import { motion } from 'framer-motion';
import { Moon, Droplet, Activity, Heart } from 'lucide-react';

interface NonNegotiable {
    name: string;
    icon: string;
}

interface DailyNonNegotiablesProps {
    items: NonNegotiable[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    moon: Moon,
    droplet: Droplet,
    activity: Activity,
    heart: Heart,
};

const colorMap: Record<string, string> = {
    moon: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    droplet: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    activity: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    heart: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
};

export function DailyNonNegotiables({ items }: DailyNonNegotiablesProps) {
    if (!items || items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full flex items-center justify-center"
            >
                <p className="text-muted-foreground text-sm">Extracting daily practices...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full"
        >
            <div className="mb-4">
                <h3 className="font-semibold text-foreground">Daily Non-Negotiables</h3>
                <p className="text-xs text-muted-foreground">Put your well-being first.</p>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => {
                    const IconComponent = iconMap[item.icon] || Heart;
                    const colorClass = colorMap[item.icon] || 'bg-primary/20 text-primary';

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.split(' ')[0]}`}>
                                <IconComponent className={`w-5 h-5 ${colorClass.split(' ').slice(1).join(' ')}`} />
                            </div>
                            <span className="font-medium text-foreground text-sm">{item.name}</span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
