import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Minus, Brain, RefreshCw,
    Target, Clock, CheckCircle2, Flame, Calendar, Sparkles, Trophy, ListChecks
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyticsSupabase } from '@/hooks/useAnalyticsSupabase';
import { useJournal } from '@/hooks/useJournal';
import { useGoalsSupabase } from '@/hooks/useGoalsSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStorageKey } from '@/lib/userStorage';

interface WeekComparison {
    focusChange: number;
    tasksChange: number;
    habitsChange: number;
    trend: 'up' | 'down' | 'stable';
}

export function WeeklyInsights() {
    const { user } = useAuth();
    const { analytics, getWeeklyData } = useAnalyticsSupabase(user?.id);
    const { getWeeklySummary, getRecentEntries } = useJournal(user?.id);
    const { activeChallenges } = useGoalsSupabase(user?.id);

    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [quarterlyProgress, setQuarterlyProgress] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const weeklyData = getWeeklyData();
    const journalSummary = getWeeklySummary();
    const recentEntries = getRecentEntries(7);

    // Listen for analytics updates to refresh data
    useEffect(() => {
        const handleAnalyticsUpdate = () => {
            setRefreshKey(prev => prev + 1);
        };

        window.addEventListener('analytics-updated', handleAnalyticsUpdate);
        return () => {
            window.removeEventListener('analytics-updated', handleAnalyticsUpdate);
        };
    }, []);

    // Calculate quarterly goal completions for this week
    useEffect(() => {
        const key = getUserStorageKey('aligned_quarterly_completions', user?.id);
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const completions = JSON.parse(stored);
                const last7Days = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    last7Days.push(d.toISOString().split('T')[0]);
                }

                const count = Object.values(completions).filter(date =>
                    date && typeof date === 'string' && last7Days.includes(date)
                ).length;
                setQuarterlyProgress(count);
            } catch (e) {
                console.error('Error calculating quarterly progress:', e);
            }
        } else {
            setQuarterlyProgress(0);
        }
    }, [user?.id, refreshKey]);

    // Calculate weekly stats
    const totalFocusMinutes = weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const totalTasks = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const totalHabits = weeklyData.reduce((sum, d) => sum + d.habitsCompleted, 0);
    const activeDays = weeklyData.filter(d => d.focusMinutes > 0 || d.tasksCompleted > 0 || d.habitsCompleted > 0).length;
    const totalJournalEntries = recentEntries.length;
    const positiveJournalDays = recentEntries.filter(e => e.mood === 'great' || e.mood === 'okay').length;

    // Calculate challenge check-ins this week
    const last7DaysStrings = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7DaysStrings.push(d.toISOString().split('T')[0]);
    }

    const challengeCheckIns = activeChallenges.reduce((sum, c) => {
        const weeklyCheckIns = c.checkIns.filter(date => last7DaysStrings.includes(date)).length;
        return sum + weeklyCheckIns;
    }, 0);

    // Calculate productivity score based on all sections
    // Max 100 points distributed across activities:
    // - Focus time: up to 20 pts (120+ mins)
    // - Tasks: up to 20 pts (10+ tasks)
    // - Habits: up to 15 pts (15+ habits)
    // - 90-Day Challenges: up to 15 pts (3+ check-ins)
    // - Quarterly Goals: up to 10 pts (5+ completions)
    // - Active days: up to 10 pts (7 days)
    // - Journal & mood: up to 5 pts (5+ entries)
    // - Streak bonus: up to 5 pts
    const focusScore = Math.min(20, Math.round((totalFocusMinutes / 120) * 20));
    const taskScore = Math.min(20, totalTasks * 2);
    const habitScore = Math.min(15, totalHabits);
    const challengeScore = Math.min(15, challengeCheckIns * 5);
    const quarterlyScore = Math.min(10, quarterlyProgress * 2);
    const activeDaysScore = Math.round((activeDays / 7) * 10);
    const journalScore = Math.min(5, (totalJournalEntries + positiveJournalDays) / 2);
    const streakBonus = Math.min(5, analytics.currentStreak);

    const productivityScore = Math.round(
        focusScore + taskScore + habitScore + challengeScore + quarterlyScore + activeDaysScore + journalScore + streakBonus
    );

    // Generate AI weekly summary
    const generateAISummary = async () => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        // Smart fallback based on actual stats
        const generateFallback = () => {
            let summary = '';

            if (totalFocusMinutes > 60 && totalTasks > 3) {
                summary = `Excellent week! You logged ${totalFocusMinutes} minutes of focus and completed ${totalTasks} tasks. Your productivity is on fire! `;
            } else if (totalFocusMinutes > 0 || totalTasks > 0) {
                summary = `You logged ${totalFocusMinutes} minutes of focus and completed ${totalTasks} tasks this week. `;
            }

            if (analytics.currentStreak >= 3) {
                summary += `Your ${analytics.currentStreak}-day streak shows real commitment! `;
            }

            if (challengeCheckIns > 0) {
                summary += `You made ${challengeCheckIns} check-in${challengeCheckIns > 1 ? 's' : ''} on your 90-day challenges. `;
            }

            if (activeDays >= 5) {
                summary += `Being active ${activeDays}/7 days shows consistency. `;
            }

            if (summary === '') {
                summary = "This week is a fresh start! Set some focus time, complete a task, or write a journal entry to get your week going. Small steps lead to big changes.";
            } else {
                summary += "Keep building on this momentum!";
            }

            return summary;
        };

        if (!apiKey) {
            console.log('No API key found, using fallback summary');
            setAiSummary(generateFallback());
            return;
        }

        setIsLoading(true);
        try {
            const entriesText = recentEntries.length > 0
                ? recentEntries.map(e => `${e.mood}: ${e.content.slice(0, 100)}`).join('; ')
                : 'No journal entries';

            const prompt = `You are a supportive productivity coach. Summarize the user's week in 2-3 sentences.

Weekly Stats:
- Focus time: ${totalFocusMinutes} minutes
- Tasks completed: ${totalTasks}
- Active days: ${activeDays}/7
- 90-Day Challenge check-ins: ${challengeCheckIns}
- Quarterly Goal milestones: ${quarterlyProgress}
- Current streak: ${analytics.currentStreak} days
- Journal mood: ${journalSummary.moodCounts.great} great, ${journalSummary.moodCounts.okay} okay, ${journalSummary.moodCounts.low} low

Recent journal entries: ${entriesText}

Be encouraging but honest. Mention specific achievements in goals or challenges if any. If stats are low, be supportive about starting fresh. Suggest one thing for next week.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (text) {
                    setAiSummary(text);
                    console.log('Generated AI weekly summary:', text);
                } else {
                    setAiSummary(generateFallback());
                }
            } else {
                console.error('Gemini API error:', response.status);
                setAiSummary(generateFallback());
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            setAiSummary(generateFallback());
        } finally {
            setIsLoading(false);
        }
    };

    // Generate summary on mount
    useEffect(() => {
        if (!aiSummary) {
            generateAISummary();
        }
    }, []);

    const getTrendIcon = (value: number) => {
        if (value > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm col-span-1 md:col-span-2"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Weekly Insights</h3>
                        <p className="text-xs text-muted-foreground">AI-powered progress analysis</p>
                    </div>
                </div>
                <Button
                    onClick={generateAISummary}
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                    <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{challengeCheckIns}</p>
                    <p className="text-xs text-muted-foreground">Challenges</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                    <ListChecks className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{quarterlyProgress}</p>
                    <p className="text-xs text-muted-foreground">Quarterly</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                    <Calendar className="w-5 h-5 text-violet mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{activeDays}/7</p>
                    <p className="text-xs text-muted-foreground">Active days</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{analytics.currentStreak}</p>
                    <p className="text-xs text-muted-foreground">Day streak</p>
                </div>
            </div>

            {/* Sub Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-secondary/20 rounded-xl p-2 flex items-center justify-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-foreground">{totalFocusMinutes}m focus</span>
                </div>
                <div className="bg-secondary/20 rounded-xl p-2 flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-foreground">{totalTasks} tasks</span>
                </div>
            </div>

            {/* Productivity Score */}
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-violet/10 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Weekly Productivity Score
                    </span>
                    <span className="text-2xl font-bold text-primary">{productivityScore}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${productivityScore}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-violet rounded-full"
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Based on focus, tasks, habits, challenges, quarterly goals, and streak
                </p>
            </div>

            {/* AI Summary */}
            <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-foreground mb-1">AI Weekly Summary</p>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground animate-pulse">Analyzing your week...</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">{aiSummary || 'Loading...'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Journal Mood Summary */}
            {(journalSummary.moodCounts.great > 0 || journalSummary.moodCounts.okay > 0 || journalSummary.moodCounts.low > 0) && (
                <div className="mt-4 flex items-center gap-4">
                    <p className="text-xs text-muted-foreground">Mood this week:</p>
                    <div className="flex items-center gap-3">
                        {journalSummary.moodCounts.great > 0 && (
                            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full">
                                😊 Great {journalSummary.moodCounts.great}x
                            </span>
                        )}
                        {journalSummary.moodCounts.okay > 0 && (
                            <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">
                                😐 Okay {journalSummary.moodCounts.okay}x
                            </span>
                        )}
                        {journalSummary.moodCounts.low > 0 && (
                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">
                                😔 Low {journalSummary.moodCounts.low}x
                            </span>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
