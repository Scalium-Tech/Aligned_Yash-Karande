import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const initializeSession = async () => {
            // Check for code in URL params (PKCE flow)
            const code = searchParams.get('code');

            if (code) {
                // Exchange the code for a session
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    console.error('Error exchanging code:', error);
                    setIsValidSession(false);
                    setIsCheckingSession(false);
                    return;
                }
                if (data.session) {
                    setIsValidSession(true);
                    setIsCheckingSession(false);
                    return;
                }
            }

            // Check for tokens in URL hash (implicit flow)
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');

            if (type === 'recovery' && accessToken) {
                // Set the session using the tokens from the hash
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || ''
                });

                if (error) {
                    console.error('Error setting session:', error);
                    setIsValidSession(false);
                    setIsCheckingSession(false);
                    return;
                }

                if (data.session) {
                    setIsValidSession(true);
                    setIsCheckingSession(false);
                    // Clear the hash from URL for security
                    window.history.replaceState(null, '', window.location.pathname);
                    return;
                }
            }

            // Check for existing session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsValidSession(true);
                setIsCheckingSession(false);
                return;
            }

            // No valid tokens found - wait a moment for auth listener
            setTimeout(() => {
                setIsValidSession(false);
                setIsCheckingSession(false);
            }, 1000);
        };

        // Listen for PASSWORD_RECOVERY event
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);

                if (event === 'PASSWORD_RECOVERY' && session) {
                    setIsValidSession(true);
                    setIsCheckingSession(false);
                }
            }
        );

        initializeSession();

        return () => subscription.unsubscribe();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate passwords
        const validation = passwordSchema.safeParse({ password, confirmPassword });
        if (!validation.success) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: validation.error.errors[0].message
            });
            setIsLoading(false);
            return;
        }

        // Update the password
        const { error } = await supabase.auth.updateUser({
            password: password
        });

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

        toast({
            title: 'Password Updated',
            description: 'Your password has been reset successfully.'
        });

        // Sign out and redirect to login after 3 seconds
        setTimeout(async () => {
            await supabase.auth.signOut();
            navigate('/login');
        }, 3000);
    };

    // Show loading while checking session
    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background px-4">
                <div className="w-full max-w-md">
                    <div className="glass-card rounded-2xl p-8 shadow-xl">
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-muted-foreground">Verifying your session...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if no valid session
    if (!isValidSession) {
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
                            <h1 className="text-2xl font-bold text-foreground mb-2">Invalid or Expired Link</h1>
                        </div>
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-center text-muted-foreground mb-6">
                                This password reset link is invalid or has expired. Please request a new one.
                            </p>
                            <Link to="/forgot-password" className="w-full">
                                <Button className="w-full h-12 bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground font-medium shadow-lg shadow-primary/20">
                                    Request New Link
                                </Button>
                            </Link>
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
                        <h1 className="text-2xl font-bold text-foreground mb-2">Set New Password</h1>
                        <p className="text-muted-foreground">
                            {isSuccess
                                ? "Your password has been reset successfully"
                                : "Enter your new password below"}
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-center text-muted-foreground">
                                    Your password has been updated. You will be redirected to the login page shortly.
                                </p>
                            </div>
                            <Link to="/login">
                                <Button className="w-full h-12 bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground font-medium shadow-lg shadow-primary/20">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-12 pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground font-medium shadow-lg shadow-primary/20"
                            >
                                {isLoading ? 'Updating...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
