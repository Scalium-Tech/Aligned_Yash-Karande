import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Flame, Trophy, ListChecks, Heart } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStorageKey } from '@/lib/userStorage';

export function WeeklyProgress() {
    const { user } = useAuth();
    const { analytics, getWeeklyData } = useAnalytics(user?.id);
    const { getActiveChallenges } = useGoals(user?.id);
    const weeklyData = getWeeklyData();
    const activeChallenges = getActiveChallenges();

    const [quarterlyCompletions, setQuarterlyCompletions] = useState<Record<string, string | null>>({});

    // Load quarterly completions once
    useEffect(() => {
        const key = getUserStorageKey('aligned_quarterly_completions', user?.id);
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                setQuarterlyCompletions(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading quarterly completions for chart:', e);
            }
        } else {
            setQuarterlyCompletions({});
        }
    }, [user?.id]);

    const totalFocusThisWeek = weeklyData.reduce((sum, d) => sum + d.focusMinutes, 0);
    const totalTasksThisWeek = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const totalHabitsThisWeek = weeklyData.reduce((sum, d) => sum + d.habitsCompleted, 0);
    const activeDays = weeklyData.filter(d => d.focusMinutes > 0 || d.tasksCompleted > 0 || d.habitsCompleted > 0).length;

    // Get the last 7 dates in YYYY-MM-DD format, aligned with weeklyData
    const last7DaysStrings = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i)); // From 6 days ago to today
        last7DaysStrings.push(d.toISOString().split('T')[0]);
    }

    // Weekly totals for the stats grid
    const quarterlyProgressTotal = Object.values(quarterlyCompletions).filter(date =>
        date && last7DaysStrings.includes(date)
    ).length;

    const challengeCheckInsTotal = activeChallenges.reduce((sum, c) => {
        const weeklyCheckIns = c.checkIns.filter(date => last7DaysStrings.includes(date)).length;
        return sum + weeklyCheckIns;
    }, 0);

    // Map daily data for the chart
    const chartData = weeklyData.map((d, idx) => {
        const dateStr = last7DaysStrings[idx];

        // Count quarterly completions on this specific day
        const quarterlyForDay = Object.values(quarterlyCompletions).filter(date => date === dateStr).length;

        // Count challenge check-ins on this specific day
        const challengesForDay = activeChallenges.filter(c => c.checkIns.includes(dateStr)).length;

        return {
            ...d,
            challenges: challengesForDay,
            quarterly: quarterlyForDay,
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-card border border-border/50 p-5 shadow-sm col-span-1 md:col-span-2"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-foreground">Weekly Progress</h3>
                    <p className="text-xs text-muted-foreground">Detailed activity breakdown</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                </div>
            </div>

            {/* Main Stats Row */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                    <Trophy className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{challengeCheckInsTotal}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground line-clamp-1">Challenges</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                    <ListChecks className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{quarterlyProgressTotal}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground line-clamp-1">Quarterly</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                    <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{totalHabitsThisWeek}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground line-clamp-1">Habits</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                    <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{totalFocusThisWeek}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground line-clamp-1">Focus Mins</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-2.5 text-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{totalTasksThisWeek}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground line-clamp-1">Tasks Done</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: 'hsl(var(--foreground))',
                            }}
                            labelStyle={{
                                color: 'hsl(var(--foreground))',
                                fontWeight: 600,
                            }}
                            itemStyle={{
                                color: 'hsl(var(--muted-foreground))',
                            }}
                            cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.2 }}
                            formatter={(value: number, name: string) => {
                                switch (name) {
                                    case 'focusMinutes': return [`${value} mins`, 'Focus'];
                                    case 'tasksCompleted': return [`${value}`, 'Tasks'];
                                    case 'habitsCompleted': return [`${value}`, 'Habits'];
                                    case 'challenges': return [`${value}`, 'Challenges'];
                                    case 'quarterly': return [`${value}`, 'Quarterly'];
                                    default: return [value, name];
                                }
                            }}
                        />
                        <Bar dataKey="focusMinutes" stackId="a" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-focus-${index}`}
                                    fill="hsl(var(--primary))"
                                    opacity={entry.focusMinutes > 0 ? 1 : 0.1}
                                />
                            ))}
                        </Bar>
                        <Bar dataKey="tasksCompleted" stackId="b" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-tasks-${index}`}
                                    fill="#10b981" // emerald-500
                                    opacity={entry.tasksCompleted > 0 ? 0.8 : 0.1}
                                />
                            ))}
                        </Bar>
                        <Bar dataKey="challenges" stackId="b" radius={[0, 0, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-challenges-${index}`}
                                    fill="#f59e0b" // amber-500
                                    opacity={entry.challenges > 0 ? 0.8 : 0.1}
                                />
                            ))}
                        </Bar>
                        <Bar dataKey="habitsCompleted" stackId="b" radius={[0, 0, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-habits-${index}`}
                                    fill="#f43f5e" // rose-500
                                    opacity={entry.habitsCompleted > 0 ? 0.8 : 0.1}
                                />
                            ))}
                        </Bar>
                        <Bar dataKey="quarterly" stackId="b" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-quarterly-${index}`}
                                    fill="#8b5cf6" // violet-500
                                    opacity={entry.quarterly > 0 ? 0.8 : 0.1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-semibold text-foreground">{analytics.currentStreak} day streak</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {activeDays}/7 active days this week
                </p>
            </div>
        </motion.div>
    );
}
