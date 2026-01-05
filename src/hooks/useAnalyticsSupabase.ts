import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData, removeUserData } from '@/lib/userStorage';

// Database types
export interface DailyActivity {
    id: string;
    user_id: string;
    activity_date: string;
    focus_sessions: number;
    focus_minutes: number;
    tasks_completed: number;
    tasks_total: number;
    habits_completed: number;
    habits_total: number;
    mood_checkin: 'great' | 'okay' | 'low' | null;
    energy_checkin: 'high' | 'medium' | 'low' | null;
    challenge_check_ins: number;
    active_challenges: number;
    created_at: string;
    updated_at: string;
}

export interface WeeklyAnalytics {
    id: string;
    user_id: string;
    week_start: string;
    ai_summary: string | null;
    productivity_score: number;
    total_challenges: number;
    total_quarterly: number;
    active_days: number;
    total_focus_mins: number;
    total_tasks: number;
    total_habits: number;
    day_streak: number;
    created_at: string;
}

// Legacy localStorage keys
const LEGACY_ANALYTICS_KEY = 'aligned_analytics';
const LEGACY_MOOD_KEY = 'aligned_mood_energy';
const MIGRATION_DONE_KEY = 'aligned_analytics_migrated_to_supabase';

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

function getWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
}

function getLastNDays(n: number): string[] {
    const days: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

export function useAnalyticsSupabase(userId?: string) {
    const [dailyActivities, setDailyActivities] = useState<Record<string, DailyActivity>>({});
    const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [identityScore, setIdentityScore] = useState(0);

    // Fetch analytics data
    const fetchData = useCallback(async () => {
        if (!userId) {
            setDailyActivities({});
            setWeeklyData(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch daily activities for last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const startDate = thirtyDaysAgo.toISOString().split('T')[0];

            const { data: activities, error: activitiesError } = await supabase
                .from('daily_activities')
                .select('*')
                .eq('user_id', userId)
                .gte('activity_date', startDate)
                .order('activity_date', { ascending: false });

            if (activitiesError) throw activitiesError;

            // Migrate from localStorage if empty
            if (!activities || activities.length === 0) {
                await migrateFromLocalStorage(userId);
                // Re-fetch after migration
                const { data: newActivities } = await supabase
                    .from('daily_activities')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('activity_date', startDate)
                    .order('activity_date', { ascending: false });

                const activitiesMap: Record<string, DailyActivity> = {};
                newActivities?.forEach(a => { activitiesMap[a.activity_date] = a; });
                setDailyActivities(activitiesMap);
            } else {
                const activitiesMap: Record<string, DailyActivity> = {};
                activities.forEach(a => { activitiesMap[a.activity_date] = a; });
                setDailyActivities(activitiesMap);
            }

            // Fetch current week's analytics
            const weekStart = getWeekStart();
            const { data: weekly } = await supabase
                .from('weekly_analytics')
                .select('*')
                .eq('user_id', userId)
                .eq('week_start', weekStart)
                .single();

            setWeeklyData(weekly || null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Migrate from localStorage
    const migrateFromLocalStorage = async (uid: string): Promise<boolean> => {
        const migrationKey = `${MIGRATION_DONE_KEY}_${uid}`;
        if (localStorage.getItem(migrationKey)) return false;

        try {
            interface LegacyDailyActivity {
                date: string;
                focusSessions: number;
                focusMinutes: number;
                tasksCompleted: number;
                tasksTotal: number;
                moodCheckin: 'great' | 'okay' | 'low' | null;
                energyCheckin: 'high' | 'medium' | 'low' | null;
                habitsCompleted: number;
                habitsTotal: number;
                challengeCheckIns: number;
                activeChallenges: number;
            }
            interface LegacyAnalytics {
                dailyActivities?: Record<string, LegacyDailyActivity>;
                currentStreak?: number;
                longestStreak?: number;
                totalFocusMinutes?: number;
                totalTasksCompleted?: number;
                totalFocusSessions?: number;
            }

            const legacyData = getUserData<LegacyAnalytics>(LEGACY_ANALYTICS_KEY, uid, { dailyActivities: {} });

            if (legacyData.dailyActivities && Object.keys(legacyData.dailyActivities).length > 0) {
                const activitiesToInsert = Object.entries(legacyData.dailyActivities).map(([date, a]) => ({
                    user_id: uid,
                    activity_date: date,
                    focus_sessions: a.focusSessions || 0,
                    focus_minutes: a.focusMinutes || 0,
                    tasks_completed: a.tasksCompleted || 0,
                    tasks_total: a.tasksTotal || 0,
                    habits_completed: a.habitsCompleted || 0,
                    habits_total: a.habitsTotal || 0,
                    mood_checkin: a.moodCheckin || null,
                    energy_checkin: a.energyCheckin || null,
                    challenge_check_ins: a.challengeCheckIns || 0,
                    active_challenges: a.activeChallenges || 0,
                }));

                await supabase.from('daily_activities').insert(activitiesToInsert);
            }

            // Mark migration complete and clean up
            localStorage.setItem(migrationKey, 'true');
            removeUserData(LEGACY_ANALYTICS_KEY, uid);
            removeUserData(LEGACY_MOOD_KEY, uid);
            console.log('Successfully migrated analytics from localStorage to Supabase');
            return true;
        } catch (err) {
            console.error('Error migrating analytics:', err);
        }
        return false;
    };

    // Get or create today's activity
    const getOrCreateTodayActivity = useCallback(async (): Promise<DailyActivity | null> => {
        if (!userId) return null;

        const today = getTodayKey();
        const existing = dailyActivities[today];

        if (existing) return existing;

        try {
            const { data, error } = await supabase
                .from('daily_activities')
                .insert({
                    user_id: userId,
                    activity_date: today,
                })
                .select()
                .single();

            if (error && error.code !== '23505') throw error; // Ignore duplicate key error

            if (data) {
                setDailyActivities(prev => ({ ...prev, [today]: data }));
                return data;
            }

            // If duplicate, fetch existing
            const { data: existingData } = await supabase
                .from('daily_activities')
                .select('*')
                .eq('user_id', userId)
                .eq('activity_date', today)
                .single();

            if (existingData) {
                setDailyActivities(prev => ({ ...prev, [today]: existingData }));
                return existingData;
            }
        } catch (err) {
            console.error('Error getting today activity:', err);
        }
        return null;
    }, [userId, dailyActivities]);

    // Log focus session
    const logFocusSession = useCallback(async (minutes: number) => {
        if (!userId) return;

        const today = getTodayKey();
        const todayActivity = dailyActivities[today];

        try {
            if (todayActivity) {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .update({
                        focus_sessions: todayActivity.focus_sessions + 1,
                        focus_minutes: todayActivity.focus_minutes + minutes,
                    })
                    .eq('id', todayActivity.id)
                    .select()
                    .single();

                if (error) throw error;
                setDailyActivities(prev => ({ ...prev, [today]: data }));
            } else {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .upsert({
                        user_id: userId,
                        activity_date: today,
                        focus_sessions: 1,
                        focus_minutes: minutes,
                    }, { onConflict: 'user_id,activity_date' })
                    .select()
                    .single();

                if (error) throw error;
                if (data) setDailyActivities(prev => ({ ...prev, [today]: data }));
            }
        } catch (err) {
            console.error('Error logging focus session:', err);
        }
    }, [userId, dailyActivities]);

    // Log task complete
    const logTaskComplete = useCallback(async (totalTasks: number = 3) => {
        if (!userId) return;

        const today = getTodayKey();
        const todayActivity = dailyActivities[today];

        try {
            if (todayActivity) {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .update({
                        tasks_completed: todayActivity.tasks_completed + 1,
                        tasks_total: totalTasks,
                    })
                    .eq('id', todayActivity.id)
                    .select()
                    .single();

                if (error) throw error;
                setDailyActivities(prev => ({ ...prev, [today]: data }));
            } else {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .upsert({
                        user_id: userId,
                        activity_date: today,
                        tasks_completed: 1,
                        tasks_total: totalTasks,
                    }, { onConflict: 'user_id,activity_date' })
                    .select()
                    .single();

                if (error) throw error;
                if (data) setDailyActivities(prev => ({ ...prev, [today]: data }));
            }
        } catch (err) {
            console.error('Error logging task complete:', err);
        }
    }, [userId, dailyActivities]);

    // Log habit complete
    const logHabitComplete = useCallback(async (totalHabits: number = 4) => {
        if (!userId) return;

        const today = getTodayKey();
        const todayActivity = dailyActivities[today];

        try {
            if (todayActivity) {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .update({
                        habits_completed: todayActivity.habits_completed + 1,
                        habits_total: totalHabits,
                    })
                    .eq('id', todayActivity.id)
                    .select()
                    .single();

                if (error) throw error;
                setDailyActivities(prev => ({ ...prev, [today]: data }));
            } else {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .upsert({
                        user_id: userId,
                        activity_date: today,
                        habits_completed: 1,
                        habits_total: totalHabits,
                    }, { onConflict: 'user_id,activity_date' })
                    .select()
                    .single();

                if (error) throw error;
                if (data) setDailyActivities(prev => ({ ...prev, [today]: data }));
            }
        } catch (err) {
            console.error('Error logging habit complete:', err);
        }
    }, [userId, dailyActivities]);

    // Log challenge check-in
    const logChallengeCheckIn = useCallback(async (activeChallengesCount: number = 1) => {
        if (!userId) return;

        const today = getTodayKey();
        const todayActivity = dailyActivities[today];

        try {
            if (todayActivity) {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .update({
                        challenge_check_ins: todayActivity.challenge_check_ins + 1,
                        active_challenges: activeChallengesCount,
                    })
                    .eq('id', todayActivity.id)
                    .select()
                    .single();

                if (error) throw error;
                setDailyActivities(prev => ({ ...prev, [today]: data }));
            } else {
                const { data, error } = await supabase
                    .from('daily_activities')
                    .upsert({
                        user_id: userId,
                        activity_date: today,
                        challenge_check_ins: 1,
                        active_challenges: activeChallengesCount,
                    }, { onConflict: 'user_id,activity_date' })
                    .select()
                    .single();

                if (error) throw error;
                if (data) setDailyActivities(prev => ({ ...prev, [today]: data }));
            }
        } catch (err) {
            console.error('Error logging challenge check-in:', err);
        }
    }, [userId, dailyActivities]);

    // Set habits total
    const setHabitsTotal = useCallback(async (totalHabits: number) => {
        if (!userId) return;

        const today = getTodayKey();
        const todayActivity = dailyActivities[today];

        if (todayActivity?.habits_total === totalHabits) return;

        try {
            const { data, error } = await supabase
                .from('daily_activities')
                .upsert({
                    user_id: userId,
                    activity_date: today,
                    habits_total: totalHabits,
                    ...(todayActivity ? {} : { habits_completed: 0 }),
                }, { onConflict: 'user_id,activity_date' })
                .select()
                .single();

            if (error) throw error;
            if (data) setDailyActivities(prev => ({ ...prev, [today]: data }));
        } catch (err) {
            console.error('Error setting habits total:', err);
        }
    }, [userId, dailyActivities]);

    // Log mood check-in
    const logMoodCheckin = useCallback(async (mood: 'great' | 'okay' | 'low', energy: 'high' | 'medium' | 'low') => {
        if (!userId) return;

        const today = getTodayKey();

        try {
            const { data, error } = await supabase
                .from('daily_activities')
                .upsert({
                    user_id: userId,
                    activity_date: today,
                    mood_checkin: mood,
                    energy_checkin: energy,
                }, { onConflict: 'user_id,activity_date' })
                .select()
                .single();

            if (error) throw error;
            if (data) setDailyActivities(prev => ({ ...prev, [today]: data }));
        } catch (err) {
            console.error('Error logging mood check-in:', err);
        }
    }, [userId]);

    // Calculate current streak
    const calculateStreak = useCallback((): number => {
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const activity = dailyActivities[dateKey];

            const isActiveDay = activity && (
                activity.focus_sessions > 0 ||
                activity.tasks_completed > 0 ||
                activity.mood_checkin !== null ||
                activity.habits_completed > 0
            );

            if (isActiveDay) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    }, [dailyActivities]);

    // Calculate identity score (today's completion %)
    const calculateIdentityScore = useCallback((): number => {
        const today = getTodayKey();
        const todayActivity = dailyActivities[today];

        if (!todayActivity) return 0;

        let totalActions = 0;
        let completedActions = 0;

        if (todayActivity.tasks_total > 0) {
            totalActions += todayActivity.tasks_total;
            completedActions += todayActivity.tasks_completed;
        }

        if (todayActivity.habits_total > 0) {
            totalActions += todayActivity.habits_total;
            completedActions += todayActivity.habits_completed;
        }

        if (todayActivity.mood_checkin) {
            totalActions += 1;
            completedActions += 1;
        }

        if (todayActivity.focus_sessions > 0) {
            totalActions += todayActivity.focus_sessions;
            completedActions += todayActivity.focus_sessions;
        }

        if (todayActivity.active_challenges > 0) {
            totalActions += todayActivity.active_challenges;
            completedActions += todayActivity.challenge_check_ins;
        }

        if (totalActions === 0) return 0;

        return Math.min(100, Math.round((completedActions / totalActions) * 100));
    }, [dailyActivities]);

    // Get weekly data for charts
    const getWeeklyData = useCallback(() => {
        const last7Days = getLastNDays(7);
        return last7Days.map(date => {
            const activity = dailyActivities[date];
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return {
                day: dayName,
                date,
                focusMinutes: activity?.focus_minutes || 0,
                tasksCompleted: activity?.tasks_completed || 0,
                habitsCompleted: activity?.habits_completed || 0,
                mood: activity?.mood_checkin || null,
                energy: activity?.energy_checkin || null,
            };
        });
    }, [dailyActivities]);

    // Get weekly insights for Analytics page
    const getWeeklyInsights = useCallback(() => {
        const last7Days = getLastNDays(7);
        let totalChallenges = 0;
        let totalQuarterly = 0;
        let activeDays = 0;
        let totalFocusMins = 0;
        let totalTasks = 0;
        let totalHabits = 0;

        last7Days.forEach(date => {
            const activity = dailyActivities[date];
            if (activity) {
                totalChallenges += activity.challenge_check_ins;
                totalFocusMins += activity.focus_minutes;
                totalTasks += activity.tasks_completed;
                totalHabits += activity.habits_completed;

                if (activity.focus_sessions > 0 || activity.tasks_completed > 0 || activity.habits_completed > 0) {
                    activeDays++;
                }
            }
        });

        return {
            totalChallenges,
            totalQuarterly,
            activeDays,
            totalFocusMins,
            totalTasks,
            totalHabits,
            dayStreak: calculateStreak(),
        };
    }, [dailyActivities, calculateStreak]);

    // Save weekly analytics cache
    // Accepts optional stats overrides for when dailyActivities may be empty
    const saveWeeklyAnalytics = useCallback(async (
        aiSummary: string,
        productivityScore: number,
        stats?: {
            totalChallenges?: number;
            totalQuarterly?: number;
            activeDays?: number;
            totalFocusMins?: number;
            totalTasks?: number;
            totalHabits?: number;
            dayStreak?: number;
        }
    ) => {
        if (!userId) return;

        const weekStart = getWeekStart();
        const insights = getWeeklyInsights();

        // Use provided stats if available, otherwise fall back to insights from dailyActivities
        const finalStats = {
            totalChallenges: stats?.totalChallenges ?? insights.totalChallenges,
            totalQuarterly: stats?.totalQuarterly ?? insights.totalQuarterly,
            activeDays: stats?.activeDays ?? insights.activeDays,
            totalFocusMins: stats?.totalFocusMins ?? insights.totalFocusMins,
            totalTasks: stats?.totalTasks ?? insights.totalTasks,
            totalHabits: stats?.totalHabits ?? insights.totalHabits,
            dayStreak: stats?.dayStreak ?? insights.dayStreak,
        };

        try {
            await supabase.from('weekly_analytics').upsert({
                user_id: userId,
                week_start: weekStart,
                ai_summary: aiSummary,
                productivity_score: productivityScore,
                total_challenges: finalStats.totalChallenges,
                total_quarterly: finalStats.totalQuarterly,
                active_days: finalStats.activeDays,
                total_focus_mins: finalStats.totalFocusMins,
                total_tasks: finalStats.totalTasks,
                total_habits: finalStats.totalHabits,
                day_streak: finalStats.dayStreak,
            }, { onConflict: 'user_id,week_start' });

            // Refresh weekly data
            const { data } = await supabase
                .from('weekly_analytics')
                .select('*')
                .eq('user_id', userId)
                .eq('week_start', weekStart)
                .single();

            setWeeklyData(data || null);
        } catch (err) {
            console.error('Error saving weekly analytics:', err);
        }
    }, [userId, getWeeklyInsights]);

    // Get cached weekly analytics
    const getCachedWeeklyAnalytics = useCallback((): WeeklyAnalytics | null => {
        return weeklyData;
    }, [weeklyData]);

    // Calculate totals
    const getTotals = useCallback(() => {
        let totalFocusMinutes = 0;
        let totalTasksCompleted = 0;
        let totalFocusSessions = 0;

        Object.values(dailyActivities).forEach(a => {
            totalFocusMinutes += a.focus_minutes;
            totalTasksCompleted += a.tasks_completed;
            totalFocusSessions += a.focus_sessions;
        });

        return {
            totalFocusMinutes,
            totalTasksCompleted,
            totalFocusSessions,
        };
    }, [dailyActivities]);

    // Update identity score when activities change
    useEffect(() => {
        setIdentityScore(calculateIdentityScore());
    }, [dailyActivities, calculateIdentityScore]);

    // Load data on mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Build analytics object for compatibility
    const analytics = {
        dailyActivities: Object.fromEntries(
            Object.entries(dailyActivities).map(([date, a]) => [date, {
                date,
                focusSessions: a.focus_sessions,
                focusMinutes: a.focus_minutes,
                tasksCompleted: a.tasks_completed,
                tasksTotal: a.tasks_total,
                moodCheckin: a.mood_checkin,
                energyCheckin: a.energy_checkin,
                habitsCompleted: a.habits_completed,
                habitsTotal: a.habits_total,
                challengeCheckIns: a.challenge_check_ins,
                activeChallenges: a.active_challenges,
            }])
        ),
        currentStreak: calculateStreak(),
        longestStreak: calculateStreak(), // TODO: track separately
        ...getTotals(),
    };

    return {
        // Data
        analytics,
        dailyActivities,
        weeklyData,
        identityScore,
        isLoading,
        error,
        // Log actions
        logFocusSession,
        logTaskComplete,
        logHabitComplete,
        logChallengeCheckIn,
        logMoodCheckin,
        setHabitsTotal,
        // Stats
        getWeeklyData,
        getWeeklyInsights,
        calculateStreak,
        getTotals,
        // Weekly analytics
        saveWeeklyAnalytics,
        getCachedWeeklyAnalytics,
        // Refresh
        refetch: fetchData,
    };
}
