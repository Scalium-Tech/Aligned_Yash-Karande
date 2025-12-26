import { motion } from 'framer-motion';
import { Book, Moon, Droplet, TrendingUp } from 'lucide-react';

interface Habit {
    name: string;
    current?: number;
    target?: number;
    value?: string;
    unit?: string;
    icon?: string;
}

interface HabitHealthTrackingProps {
    habits: Habit[];
}

export function HabitHealthTracking({ habits }: HabitHealthTrackingProps) {
    if (!habits || habits.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full flex items-center justify-center"
            >
                <p className="text-muted-foreground text-sm">Setting up habit tracking...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-foreground">Habit & Health Tracking</h3>
                    <p className="text-xs text-muted-foreground">Track habits, sleep, water, steps.</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                </div>
            </div>

            <div className="space-y-4">
                {habits.map((habit, index) => (
                    <motion.div
                        key={habit.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                    >
                        {habit.current !== undefined && habit.target !== undefined ? (
                            // Progress-based habit (like reading streak)
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Book className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground">{habit.name}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {habit.current} / {habit.target} {habit.unit}
                                    </span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary to-violet rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((habit.current / habit.target) * 100, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                                    />
                                </div>
                            </div>
                        ) : (
                            // Value-based habit (like sleep or water)
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                                {habit.icon === 'moon' ? (
                                    <Moon className="w-5 h-5 text-indigo-500" />
                                ) : (
                                    <Droplet className="w-5 h-5 text-blue-500" />
                                )}
                                <div className="flex-1">
                                    <span className="text-sm text-muted-foreground">{habit.name}</span>
                                    <p className="text-lg font-semibold text-foreground">
                                        {habit.value}
                                        {habit.unit && <span className="text-sm text-muted-foreground ml-1">{habit.unit}</span>}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
