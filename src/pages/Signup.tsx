import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { getPendingPayment, clearPendingPayment } from '@/lib/razorpay';
import { Crown, Mail, CheckCircle2 } from 'lucide-react';

const signupSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72, 'Password must be less than 72 characters')
});

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{ paymentId: string; planType: string } | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for pending payment on mount
  useEffect(() => {
    const payment = getPendingPayment();
    if (payment) {
      setPendingPayment({
        paymentId: payment.paymentId,
        planType: payment.planType
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    const validation = signupSchema.safeParse({ fullName, email, password });
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: validation.error.errors[0].message
      });
      setIsLoading(false);
      return;
    }

    // Pass payment info if exists
    const { error } = await signUp(
      email,
      password,
      fullName,
      pendingPayment || undefined
    );

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message
      });
      setIsLoading(false);
      return;
    }

    // Clear pending payment after successful signup
    if (pendingPayment) {
      clearPendingPayment();
    }

    // Show email confirmation message
    setEmailSent(true);
    setIsLoading(false);
  };

  // Email confirmation sent UI
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background px-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
              Please click the link to verify your email and complete your registration.
            </p>

            <div className="bg-secondary/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">What's next?</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Check your inbox (and spam folder)</li>
                    <li>Click the confirmation link</li>
                    <li>Complete your onboarding</li>
                  </ol>
                </div>
              </div>
            </div>

            {pendingPayment && (
              <div className="flex items-center justify-center gap-2 text-primary mb-4">
                <Crown size={18} />
                <span className="font-medium text-sm">Your Pro {pendingPayment.planType} plan will be activated after confirmation</span>
              </div>
            )}

            <div className="space-y-3">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Go to Login
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background px-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center mb-6">
              <img
                src="/logo.png"
                alt="Aligned"
                className="h-14 w-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
            {pendingPayment ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Crown size={18} />
                <span className="font-medium">Pro {pendingPayment.planType} plan activated!</span>
              </div>
            ) : (
              <p className="text-muted-foreground">Get started with your free account</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground font-medium shadow-lg shadow-primary/20"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

