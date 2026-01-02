import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const emailSchema = z.object({
    email: z.string().trim().email('Invalid email address')
});

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { resetPasswordForEmail } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate email
        const validation = emailSchema.safeParse({ email });
        if (!validation.success) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: validation.error.errors[0].message
            });
            setIsLoading(false);
            return;
        }

        const { error } = await resetPasswordForEmail(email);

        if (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            });
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
        setIsLoading(false);
    };

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
                        <h1 className="text-2xl font-bold text-foreground mb-2">Reset Password</h1>
                        <p className="text-muted-foreground">
                            {isSuccess
                                ? "Check your email for the reset link"
                                : "Enter your email to receive a password reset link"}
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-center text-muted-foreground">
                                    We've sent a password reset link to <strong className="text-foreground">{email}</strong>.
                                    Please check your inbox and click the link to reset your password.
                                </p>
                            </div>
                            <Link to="/login">
                                <Button
                                    variant="outline"
                                    className="w-full h-12"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-12 pl-10"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground font-medium shadow-lg shadow-primary/20"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>

                            <Link to="/login" className="block">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-12"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Button>
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
