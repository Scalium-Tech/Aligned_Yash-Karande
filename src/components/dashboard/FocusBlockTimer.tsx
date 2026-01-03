import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, CheckCircle2, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyticsSupabase } from '@/hooks/useAnalyticsSupabase';

interface FocusBlockTimerProps {
    initialMinutes?: number;
    onComplete?: () => void;
}

export function FocusBlockTimer({ initialMinutes = 45, onComplete }: FocusBlockTimerProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(initialMinutes * 60);
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const { logFocusSession, analytics } = useAnalyticsSupabase();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = useCallback(() => {
        setIsRunning(true);
        setHasStarted(true);
        if (!sessionStartTime) {
            setSessionStartTime(Date.now());
        }
    }, [sessionStartTime]);

    const handlePause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const handleFinish = useCallback(() => {
        // Calculate minutes focused
        const minutesFocused = Math.round((initialMinutes * 60 - timeRemaining) / 60);
        if (minutesFocused > 0) {
            logFocusSession(minutesFocused);
        }

        setIsRunning(false);
        setTimeRemaining(initialMinutes * 60);
        setHasStarted(false);
        setSessionStartTime(null);
        onComplete?.();
    }, [initialMinutes, timeRemaining, logFocusSession, onComplete]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        // Log full session on completion
                        logFocusSession(initialMinutes);
                        onComplete?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, onComplete, timeRemaining, initialMinutes, logFocusSession]);

    const progress = ((initialMinutes * 60 - timeRemaining) / (initialMinutes * 60)) * 100;

    // Get today's stats
    const todayKey = new Date().toISOString().split('T')[0];
    const todayActivity = analytics.dailyActivities[todayKey];
    const todaySessions = todayActivity?.focusSessions || 0;
    const todayMinutes = todayActivity?.focusMinutes || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-foreground">Focus Block Timer</h3>
                    <p className="text-xs text-muted-foreground">Stay focused, do deep work.</p>
                </div>
                {analytics.currentStreak > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-medium text-orange-500">{analytics.currentStreak}d</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center">
                {/* Timer Display */}
                <div className="relative mb-4">
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
                            stroke="url(#timerGradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 48}
                            initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - progress / 100) }}
                            transition={{ duration: 0.5 }}
                        />
                        <defs>
                            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">{formatTime(timeRemaining)}</span>
                        <span className="text-xs text-muted-foreground">Focus</span>
                    </div>
                </div>

                {/* Today's Stats */}
                <div className="flex items-center gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{todayMinutes}m today</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{todaySessions} sessions</span>
                    </div>
                </div>

                {/* Controls */}
                {!hasStarted ? (
                    <Button
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground"
                        size="sm"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Start Focus
                    </Button>
                ) : (
                    <div className="flex gap-2 w-full">
                        <Button
                            onClick={isRunning ? handlePause : handleStart}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            {isRunning ? (
                                <>
                                    <Pause className="w-4 h-4 mr-1" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-1" />
                                    Resume
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleFinish}
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Done
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
