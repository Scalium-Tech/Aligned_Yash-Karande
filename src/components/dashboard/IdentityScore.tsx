import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

function getOrdinalDay(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]) + ' day';
}

export function IdentityScore() {
    const { identityScore, analytics } = useAnalytics();

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-emerald-500';
        if (score >= 40) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getScoreMessage = (score: number) => {
        if (score >= 80) return "You're crushing it! Living your identity.";
        if (score >= 60) return "Great progress! Keep showing up.";
        if (score >= 40) return "You're on the right path. Stay consistent.";
        if (score >= 20) return "Room to grow. Small steps matter.";
        return "Start tracking to see your score!";
    };

    const getTrend = () => {
        // Simple trend based on streak
        if (analytics.currentStreak >= 3) return 'up';
        if (analytics.currentStreak === 0) return 'down';
        return 'stable';
    };

    const trend = getTrend();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-primary/10 via-violet/5 to-background border border-primary/20 p-5 shadow-sm h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-foreground">Identity Alignment</h3>
                    <p className="text-xs text-muted-foreground">How aligned are your actions?</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                </div>
            </div>

            {/* Score Circle */}
            <div className="flex items-center justify-center mb-4">
                <div className="relative">
                    <svg className="w-28 h-28 transform -rotate-90">
                        <circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-secondary"
                        />
                        <motion.circle
                            cx="56"
                            cy="56"
                            r="48"
                            stroke="url(#scoreGradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 48}
                            initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - identityScore / 100) }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${getScoreColor(identityScore)}`}>
                            {identityScore}%
                        </span>
                        <div className="flex items-center gap-0.5">
                            {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                            {trend === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
                            {trend === 'stable' && <Minus className="w-3 h-3 text-amber-500" />}
                            <span className="text-xs text-muted-foreground">
                                {getOrdinalDay(analytics.currentStreak || 1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
                {getScoreMessage(identityScore)}
            </p>

            {/* Streak indicator */}
            <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current streak</span>
                    <span className="font-medium text-foreground">
                        {analytics.currentStreak} day{analytics.currentStreak !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Best streak</span>
                    <span className="font-medium text-foreground">
                        {analytics.longestStreak} day{analytics.longestStreak !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
