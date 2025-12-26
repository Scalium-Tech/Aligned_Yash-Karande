import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useJournal } from '@/hooks/useJournal';

export function WeeklyCoachSummary() {
    const { analytics, getWeeklyData } = useAnalytics();
    const { getWeeklySummary, getRecentEntries } = useJournal();
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const weeklyData = getWeeklyData();
    const journalSummary = getWeeklySummary();
    const recentEntries = getRecentEntries(7);

    useEffect(() => {
        generateWeeklySummary();
    }, []);

    const generateWeeklySummary = async () => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) {
            setAiSummary("Great job showing up this week! Keep building momentum with small, consistent actions.");
            return;
        }

        setIsLoading(true);

        const totalFocus = weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0);
        const totalTasks = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
        const activeDays = weeklyData.filter(d => d.focusMinutes > 0 || d.tasksCompleted > 0).length;

        const prompt = `You are a supportive weekly coach for a personal growth app. Generate a brief, encouraging weekly summary (2-3 sentences) based on this data:

- Focus time: ${totalFocus} minutes total
- Tasks completed: ${totalTasks}
- Active days: ${activeDays}/7
- Current streak: ${analytics.currentStreak} days
- Journal entries: ${journalSummary.entriesCount}
- Dominant mood: ${journalSummary.dominantMood || 'not tracked'}

Guidelines:
- Be warm and encouraging, not preachy
- Acknowledge specific achievements
- Offer one gentle suggestion for next week
- Keep it personal and motivating

Return only the summary text, no formatting.`;

        try {
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
                setAiSummary(text || "You're making progress! Every small step counts toward becoming who you want to be.");
            } else {
                setAiSummary("You're making progress! Every small step counts toward becoming who you want to be.");
            }
        } catch {
            setAiSummary("You're making progress! Every small step counts toward becoming who you want to be.");
        } finally {
            setIsLoading(false);
        }
    };

    const totalFocus = weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const totalTasks = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-primary/10 via-violet/5 to-background border border-primary/20 p-6 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground">Weekly Coach Summary</h3>
                    <p className="text-xs text-muted-foreground">AI-powered review of your week</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-card/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{totalFocus}</p>
                    <p className="text-xs text-muted-foreground">Focus mins</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{totalTasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks done</p>
                </div>
                <div className="bg-card/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{journalSummary.entriesCount}</p>
                    <p className="text-xs text-muted-foreground">Journal entries</p>
                </div>
            </div>

            {/* AI Summary */}
            <div className="rounded-xl bg-card/80 border border-border/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">AI Coach</span>
                </div>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing your week...</span>
                    </div>
                ) : (
                    <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
                )}
            </div>

            {/* Refresh */}
            <button
                onClick={generateWeeklySummary}
                disabled={isLoading}
                className="mt-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
                <TrendingUp className="w-3 h-3" />
                Refresh summary
            </button>
        </motion.div>
    );
}
