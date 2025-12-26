import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, TrendingDown, TrendingUp, Clock, Zap, Target, Brain, RefreshCw } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useJournal } from '@/hooks/useJournal';
import { Button } from '@/components/ui/button';

interface FrictionAlert {
    id: string;
    type: 'warning' | 'insight' | 'encouragement' | 'ai';
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    message: string;
    color: string;
}

export function FrictionAlerts() {
    const { analytics, getWeeklyData } = useAnalytics();
    const { getWeeklySummary, getRecentEntries } = useJournal();
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const weeklyData = getWeeklyData();
    const journalSummary = getWeeklySummary();
    const recentEntries = getRecentEntries(3);

    // Generate AI insight based on journal entries
    const generateAIInsight = async () => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey || recentEntries.length === 0) return;

        setIsLoading(true);
        try {
            const entriesText = recentEntries
                .map(e => `${e.date} (mood: ${e.mood}): ${e.content}`)
                .join('\n');

            const totalFocus = weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0);
            const totalTasks = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);

            const prompt = `You are a compassionate AI coach. Based on the user's recent journal entries and activity, provide ONE short, specific, actionable insight (2 sentences max).

Journal entries:
${entriesText}

Weekly stats: ${totalFocus} focus mins, ${totalTasks} tasks done, ${analytics.currentStreak} day streak

Focus on: patterns you notice, gentle encouragement, or a specific suggestion. Be warm but concise.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (text) {
                    setAiInsight(text);
                }
            }
        } catch (error) {
            console.error('Error generating AI insight:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate AI insight on mount if there are journal entries
    useEffect(() => {
        if (recentEntries.length > 0 && !aiInsight) {
            generateAIInsight();
        }
    }, [recentEntries.length]);

    // Generate rule-based alerts
    const generateAlerts = (): FrictionAlert[] => {
        const alerts: FrictionAlert[] = [];
        const totalFocusThisWeek = weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0);
        const totalTasksThisWeek = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
        const avgDailyFocus = totalFocusThisWeek / 7;

        // High achiever - completed many tasks
        if (totalTasksThisWeek >= 5) {
            alerts.push({
                id: 'high-tasks',
                type: 'encouragement',
                icon: Target,
                title: 'Great Progress!',
                message: `You completed ${totalTasksThisWeek} tasks this week. Your consistency is paying off!`,
                color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            });
        }

        // Good focus time
        if (totalFocusThisWeek >= 60) {
            alerts.push({
                id: 'good-focus',
                type: 'encouragement',
                icon: Clock,
                title: 'Focus Champion',
                message: `${totalFocusThisWeek} minutes of deep work this week. Your focus muscle is getting stronger!`,
                color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            });
        }

        // Streak momentum
        if (analytics.currentStreak >= 3) {
            alerts.push({
                id: 'streak-going',
                type: 'encouragement',
                icon: Zap,
                title: 'Momentum Building!',
                message: `${analytics.currentStreak} days strong! You are proving who you are becoming.`,
                color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            });
        }

        // Streak reset
        if (analytics.currentStreak === 0 && analytics.longestStreak > 0) {
            alerts.push({
                id: 'streak-lost',
                type: 'warning',
                icon: TrendingDown,
                title: 'Fresh Start',
                message: `Your streak ended, but today is a new beginning. Show up gently.`,
                color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
            });
        }

        // Low focus this week
        if (avgDailyFocus < 10 && totalFocusThisWeek > 0) {
            alerts.push({
                id: 'low-focus',
                type: 'insight',
                icon: Lightbulb,
                title: 'Focus Opportunity',
                message: `Try scheduling just 15 minutes of focused work tomorrow morning.`,
                color: 'text-violet bg-violet/10 border-violet/20',
            });
        }

        // Mood patterns
        if (journalSummary.moodCounts.great >= 2) {
            alerts.push({
                id: 'great-mood',
                type: 'encouragement',
                icon: TrendingUp,
                title: 'Positive Vibes',
                message: `You felt great ${journalSummary.moodCounts.great} times this week. What is contributing to your happiness?`,
                color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
            });
        }

        if (journalSummary.moodCounts.low >= 2) {
            alerts.push({
                id: 'mood-pattern',
                type: 'insight',
                icon: Lightbulb,
                title: 'Self-Care Reminder',
                message: `You have had some tough days. Consider what might be draining you.`,
                color: 'text-violet bg-violet/10 border-violet/20',
            });
        }

        // No tasks but has history
        if (totalTasksThisWeek === 0 && analytics.totalTasksCompleted > 0) {
            alerts.push({
                id: 'no-tasks',
                type: 'warning',
                icon: AlertTriangle,
                title: 'Start Small',
                message: 'No tasks completed this week. Start with just one small step today.',
                color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            });
        }

        // Default if nothing else
        if (alerts.length === 0) {
            alerts.push({
                id: 'default',
                type: 'encouragement',
                icon: Lightbulb,
                title: 'Keep Going',
                message: 'Small consistent actions lead to big changes. You are on the right path.',
                color: 'text-primary bg-primary/10 border-primary/20',
            });
        }

        return alerts.slice(0, 2); // Show max 2 rule-based alerts
    };

    const alerts = generateAlerts();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Smart Insights</h3>
                    <p className="text-xs text-muted-foreground">AI-detected patterns & suggestions</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* AI-powered insight */}
                {aiInsight && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-xl border p-4 bg-gradient-to-r from-primary/10 to-violet/10 border-primary/20"
                    >
                        <div className="flex items-start gap-3">
                            <Brain className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium text-foreground text-sm flex items-center gap-2">
                                    AI Coach Insight
                                    <span className="text-xs text-muted-foreground font-normal">✨</span>
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{aiInsight}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Rule-based alerts */}
                {alerts.map((alert, index) => {
                    const Icon = alert.icon;
                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (aiInsight ? 0.1 : 0) + index * 0.1 }}
                            className={`rounded-xl border p-4 ${alert.color}`}
                        >
                            <div className="flex items-start gap-3">
                                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground text-sm">{alert.title}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Refresh button */}
                <Button
                    onClick={generateAIInsight}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    disabled={isLoading || recentEntries.length === 0}
                >
                    {isLoading ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Insights
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
