import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface ProFeatureGateProps {
    children: ReactNode;
    featureName?: string;
}

export function ProFeatureGate({ children, featureName = 'this feature' }: ProFeatureGateProps) {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const handleUpgradeClick = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        // Navigate to landing page with pricing section
        navigate('/');
        // Scroll to pricing section after navigation
        setTimeout(() => {
            const pricingSection = document.getElementById('pricing');
            if (pricingSection) {
                pricingSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    // If user is Pro, show content normally
    if (profile?.is_pro) {
        return <>{children}</>;
    }

    // For free users, show blurred content with lock overlay
    return (
        <div className="relative">
            {/* Blurred content */}
            <div className="blur-sm pointer-events-none select-none opacity-60">
                {children}
            </div>

            {/* Lock overlay */}
            <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl cursor-pointer z-10"
                onClick={handleUpgradeClick}
            >
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                        Upgrade to Pro to unlock {featureName}
                    </p>
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-primary to-purple-dark hover:opacity-90 text-primary-foreground shadow-lg"
                        onClick={handleUpgradeClick}
                    >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Hook to check if user is Pro
export function useIsPro(): boolean {
    const { profile } = useAuth();
    return profile?.is_pro === true;
}
