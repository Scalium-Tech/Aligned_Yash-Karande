import { motion } from 'framer-motion';
import { User, Briefcase, Target, GraduationCap, Edit3, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Identity {
    name: string;
    icon: string;
    selected?: boolean;
}

interface IdentitySetupProps {
    identities: Identity[];
    myWhy: string;
    identitySummary?: string;
    onGetStarted?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    user: User,
    briefcase: Briefcase,
    target: Target,
    'graduation-cap': GraduationCap,
    'edit-3': Edit3,
};

export function IdentitySetup({ identities, myWhy, identitySummary, onGetStarted }: IdentitySetupProps) {
    if (!identities || identities.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full flex items-center justify-center"
            >
                <p className="text-muted-foreground text-sm">Loading identities...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-foreground">Identity Setup</h3>
                    <p className="text-xs text-muted-foreground">Who are you becoming?</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                    <User className="w-5 h-5 text-violet-600" />
                </div>
            </div>

            <div className="space-y-2.5 mb-4">
                {identities.map((identity, index) => {
                    const IconComponent = iconMap[identity.icon] || User;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${identity.selected
                                ? 'bg-primary/10 border border-primary/30'
                                : 'bg-secondary/30 border border-transparent hover:bg-secondary/50'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${identity.selected ? 'bg-primary/20' : 'bg-secondary'
                                }`}>
                                <IconComponent className={`w-4 h-4 ${identity.selected ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <span className={`flex-1 text-sm font-medium ${identity.selected ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                {identity.name}
                            </span>
                            {identity.selected && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {identitySummary && (
                <p className="text-xs text-muted-foreground mb-3 italic">{identitySummary}</p>
            )}

            <div className="flex items-center gap-2 text-sm mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">My Why:</span>
                <span className="text-foreground font-medium">{myWhy}</span>
            </div>

            <Button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground"
                size="sm"
            >
                Get Started
                <Sparkles className="w-4 h-4 ml-2" />
            </Button>
        </motion.div>
    );
}
