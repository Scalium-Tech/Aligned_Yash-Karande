import { useState, useEffect, useCallback } from 'react';

// Types for analytics data
interface DailyActivity {
    date: string;
    focusSessions: number;
    focusMinutes: number;
    tasksCompleted: number;
    tasksTotal: number;
    moodCheckin: 'great' | 'okay' | 'low' | null;
    energyCheckin: 'high' | 'medium' | 'low' | null;
    habitsCompleted: number;
    habitsTotal: number;
}

interface AnalyticsData {
    dailyActivities: Record<string, DailyActivity>;
    currentStreak: number;
    longestStreak: number;
    totalFocusMinutes: number;
    totalTasksCompleted: number;
    totalFocusSessions: number;
}

const ANALYTICS_KEY = 'aligned_analytics';
const MOOD_KEY = 'aligned_mood_energy';

function getDefaultDailyActivity(date: string): DailyActivity {
    return {
        date,
        focusSessions: 0,
        focusMinutes: 0,
        tasksCompleted: 0,
        tasksTotal: 0,
        moodCheckin: null,
        energyCheckin: null,
        habitsCompleted: 0,
        habitsTotal: 0,
    };
}

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
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

function loadAnalytics(): AnalyticsData {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (!stored) {
        return {
            dailyActivities: {},
            currentStreak: 0,
            longestStreak: 0,
            totalFocusMinutes: 0,
            totalTasksCompleted: 0,
            totalFocusSessions: 0,
        };
    }
    try {
        return JSON.parse(stored);
    } catch {
        return {
            dailyActivities: {},
            currentStreak: 0,
            longestStreak: 0,
            totalFocusMinutes: 0,
            totalTasksCompleted: 0,
            totalFocusSessions: 0,
        };
    }
}

function saveAnalytics(data: AnalyticsData): void {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

function calculateStreak(dailyActivities: Record<string, DailyActivity>): number {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const activity = dailyActivities[dateKey];

        // Count as active day if there's any meaningful activity
        const isActiveDay = activity && (
            activity.focusSessions > 0 ||
            activity.tasksCompleted > 0 ||
            activity.moodCheckin !== null ||
            activity.habitsCompleted > 0
        );

        if (isActiveDay) {
            streak++;
        } else if (i > 0) {
            // Allow skipping today but not past days
            break;
        }
    }

    return streak;
}

function calculateIdentityScore(dailyActivities: Record<string, DailyActivity>): number {
    const last7Days = getLastNDays(7);
    let totalActions = 0;
    let completedActions = 0;
    let hasAnyActivity = false;

    for (const day of last7Days) {
        const activity = dailyActivities[day];
        if (activity) {
            hasAnyActivity = true;

            // Only count tasks if user has set tasks for that day
            if (activity.tasksTotal > 0) {
                totalActions += activity.tasksTotal;
                completedActions += activity.tasksCompleted;
            }

            // Only count habits if user has set habits for that day
            if (activity.habitsTotal > 0) {
                totalActions += activity.habitsTotal;
                completedActions += activity.habitsCompleted;
            }

            // Daily check-in counts as a completed action
            if (activity.moodCheckin) {
                totalActions += 1;
                completedActions += 1;
            }

            // Focus sessions count as completed actions
            if (activity.focusSessions > 0) {
                totalActions += activity.focusSessions;
                completedActions += activity.focusSessions;
            }
        }
    }

    // If user has no activity at all, return 0
    if (!hasAnyActivity || totalActions === 0) return 0;
    // Cap at 100% to prevent over-completion display
    return Math.min(100, Math.round((completedActions / totalActions) * 100));
}

export function useAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData>(() => loadAnalytics());
    const [identityScore, setIdentityScore] = useState<number>(0);

    // Listen for storage changes from other components
    useEffect(() => {
        const handleStorageChange = () => {
            const newData = loadAnalytics();
            setAnalytics(newData);
        };

        // Listen for custom analytics update event
        window.addEventListener('analytics-updated', handleStorageChange);

        // Also listen for storage events from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === ANALYTICS_KEY) {
                handleStorageChange();
            }
        });

        return () => {
            window.removeEventListener('analytics-updated', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Sync mood data from mood tracker
    useEffect(() => {
        const moodData = localStorage.getItem(MOOD_KEY);
        if (moodData) {
            try {
                const parsed = JSON.parse(moodData);
                const updated = { ...analytics };
                let hasChanges = false;

                for (const [date, data] of Object.entries(parsed)) {
                    const moodEntry = data as { mood: 'great' | 'okay' | 'low'; energy: 'high' | 'medium' | 'low' };
                    if (!updated.dailyActivities[date]) {
                        updated.dailyActivities[date] = getDefaultDailyActivity(date);
                    }
                    if (updated.dailyActivities[date].moodCheckin !== moodEntry.mood) {
                        updated.dailyActivities[date].moodCheckin = moodEntry.mood;
                        updated.dailyActivities[date].energyCheckin = moodEntry.energy;
                        hasChanges = true;
                    }
                }

                if (hasChanges) {
                    updated.currentStreak = calculateStreak(updated.dailyActivities);
                    updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);
                    saveAnalytics(updated);
                    setAnalytics(updated);
                }
            } catch (e) {
                console.error('Error syncing mood data:', e);
            }
        }
    }, []);

    // Calculate identity score
    useEffect(() => {
        const score = calculateIdentityScore(analytics.dailyActivities);
        setIdentityScore(score);
    }, [analytics]);

    const logFocusSession = useCallback((minutes: number) => {
        const todayKey = getTodayKey();
        const currentData = loadAnalytics(); // Get fresh data
        const updated = { ...currentData };

        if (!updated.dailyActivities[todayKey]) {
            updated.dailyActivities[todayKey] = getDefaultDailyActivity(todayKey);
        }

        updated.dailyActivities[todayKey].focusSessions++;
        updated.dailyActivities[todayKey].focusMinutes += minutes;
        updated.totalFocusSessions++;
        updated.totalFocusMinutes += minutes;
        updated.currentStreak = calculateStreak(updated.dailyActivities);
        updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);

        saveAnalytics(updated);
        setAnalytics(updated);

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('analytics-updated'));
    }, []);

    const logTaskComplete = useCallback((totalTasks: number = 3) => {
        const todayKey = getTodayKey();
        const currentData = loadAnalytics();
        const updated = { ...currentData };

        if (!updated.dailyActivities[todayKey]) {
            updated.dailyActivities[todayKey] = getDefaultDailyActivity(todayKey);
        }

        updated.dailyActivities[todayKey].tasksCompleted++;
        updated.dailyActivities[todayKey].tasksTotal = totalTasks;
        updated.totalTasksCompleted++;
        updated.currentStreak = calculateStreak(updated.dailyActivities);
        updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);

        saveAnalytics(updated);
        setAnalytics(updated);
        window.dispatchEvent(new CustomEvent('analytics-updated'));
    }, []);

    const logHabitComplete = useCallback((totalHabits: number = 4) => {
        const todayKey = getTodayKey();
        const currentData = loadAnalytics();
        const updated = { ...currentData };

        if (!updated.dailyActivities[todayKey]) {
            updated.dailyActivities[todayKey] = getDefaultDailyActivity(todayKey);
        }

        updated.dailyActivities[todayKey].habitsCompleted++;
        updated.dailyActivities[todayKey].habitsTotal = totalHabits;
        updated.currentStreak = calculateStreak(updated.dailyActivities);
        updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);

        saveAnalytics(updated);
        setAnalytics(updated);
        window.dispatchEvent(new CustomEvent('analytics-updated'));
    }, []);

    const getWeeklyData = useCallback(() => {
        const last7Days = getLastNDays(7);
        return last7Days.map(date => {
            const activity = analytics.dailyActivities[date] || getDefaultDailyActivity(date);
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return {
                day: dayName,
                date,
                focusMinutes: activity.focusMinutes,
                tasksCompleted: activity.tasksCompleted,
                habitsCompleted: activity.habitsCompleted,
                mood: activity.moodCheckin,
                energy: activity.energyCheckin,
            };
        });
    }, [analytics]);

    return {
        analytics,
        identityScore,
        logFocusSession,
        logTaskComplete,
        logHabitComplete,
        getWeeklyData,
    };
}
