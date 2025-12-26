import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: validation.error.errors[0].message
      });
      setIsLoading(false);
      return;
    }

    const { error, onboardingCompleted } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message
      });
      setIsLoading(false);
      return;
    }

    if (onboardingCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding/step-1');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background px-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-xl">A</span>
              </div>
              <span className="font-semibold text-2xl text-foreground">Aligned</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              {isLoading ? 'Signing in...' : 'Log In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
