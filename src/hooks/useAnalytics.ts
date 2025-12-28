import { useState, useEffect, useCallback } from 'react';
import { getUserStorageKey } from '@/lib/userStorage';

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
    challengeCheckIns: number;
    activeChallenges: number;
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
        challengeCheckIns: 0,
        activeChallenges: 0,
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

function getDefaultAnalytics(): AnalyticsData {
    return {
        dailyActivities: {},
        currentStreak: 0,
        longestStreak: 0,
        totalFocusMinutes: 0,
        totalTasksCompleted: 0,
        totalFocusSessions: 0,
    };
}

function loadAnalytics(userId?: string): AnalyticsData {
    const key = getUserStorageKey(ANALYTICS_KEY, userId);
    const stored = localStorage.getItem(key);
    if (!stored) {
        return getDefaultAnalytics();
    }
    try {
        return JSON.parse(stored);
    } catch {
        return getDefaultAnalytics();
    }
}

function saveAnalytics(data: AnalyticsData, userId?: string): void {
    const key = getUserStorageKey(ANALYTICS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(data));
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
    // Calculate score based on TODAY's activity only - resets to 0% at start of each day
    const todayKey = getTodayKey();
    const todayActivity = dailyActivities[todayKey];

    // If no activity today, return 0%
    if (!todayActivity) return 0;

    let totalActions = 0;
    let completedActions = 0;

    // Only count tasks if user has set tasks for today
    if (todayActivity.tasksTotal > 0) {
        totalActions += todayActivity.tasksTotal;
        completedActions += todayActivity.tasksCompleted;
    }

    // Only count habits if user has set habits for today
    if (todayActivity.habitsTotal > 0) {
        totalActions += todayActivity.habitsTotal;
        completedActions += todayActivity.habitsCompleted;
    }

    // Daily check-in counts as a completed action
    if (todayActivity.moodCheckin) {
        totalActions += 1;
        completedActions += 1;
    }

    // Focus sessions count as completed actions
    if (todayActivity.focusSessions > 0) {
        totalActions += todayActivity.focusSessions;
        completedActions += todayActivity.focusSessions;
    }

    // Challenge check-ins count towards identity score
    // Each active challenge is a potential action, each check-in is a completed action
    if (todayActivity.activeChallenges > 0) {
        totalActions += todayActivity.activeChallenges;
        completedActions += todayActivity.challengeCheckIns;
    }

    // If user has no planned actions today, return 0
    if (totalActions === 0) return 0;

    // Cap at 100% to prevent over-completion display
    return Math.min(100, Math.round((completedActions / totalActions) * 100));
}

export function useAnalytics(userId?: string) {
    const [analytics, setAnalytics] = useState<AnalyticsData>(() => loadAnalytics(userId));
    const [identityScore, setIdentityScore] = useState<number>(0);

    // Reload data when userId changes
    useEffect(() => {
        const newData = loadAnalytics(userId);
        setAnalytics(newData);
    }, [userId]);

    // Listen for storage changes from other components
    useEffect(() => {
        const handleStorageChange = () => {
            const newData = loadAnalytics(userId);
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
    }, [userId]);

    // Sync mood data from mood tracker
    useEffect(() => {
        const moodKey = getUserStorageKey(MOOD_KEY, userId);
        const moodData = localStorage.getItem(moodKey);
        if (moodData) {
            try {
                const parsed = JSON.parse(moodData);
                // Load fresh analytics data to avoid stale closure
                const currentAnalytics = loadAnalytics(userId);
                const updated = { ...currentAnalytics };
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
                    saveAnalytics(updated, userId);
                    setAnalytics(updated);
                }
            } catch (e) {
                console.error('Error syncing mood data:', e);
            }
        }
    }, [userId]);

    // Calculate identity score
    useEffect(() => {
        const score = calculateIdentityScore(analytics.dailyActivities);
        setIdentityScore(score);
    }, [analytics]);

    const logFocusSession = useCallback((minutes: number) => {
        const todayKey = getTodayKey();
        const currentData = loadAnalytics(userId);
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

        saveAnalytics(updated, userId);
        setAnalytics(updated);

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('analytics-updated'));
    }, [userId]);

    const logTaskComplete = useCallback((totalTasks: number = 3) => {
        const todayKey = getTodayKey();
        const currentData = loadAnalytics(userId);
        const updated = { ...currentData };

        if (!updated.dailyActivities[todayKey]) {
            updated.dailyActivities[todayKey] = getDefaultDailyActivity(todayKey);
        }

        updated.dailyActivities[todayKey].tasksCompleted++;
        updated.dailyActivities[todayKey].tasksTotal = totalTasks;
        updated.totalTasksCompleted++;
        updated.currentStreak = calculateStreak(updated.dailyActivities);
        updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);

        saveAnalytics(updated, userId);
        setAnalytics(updated);
        window.dispatchEvent(new CustomEvent('analytics-updated'));
    }, [userId]);

    const logHabitComplete = useCallback((totalHabits: number = 4) => {
        const todayKey = getTodayKey();
        const currentData = loadAnalytics(userId);
        const updated = { ...currentData };

        if (!updated.dailyActivities[todayKey]) {
            updated.dailyActivities[todayKey] = getDefaultDailyActivity(todayKey);
        }

        updated.dailyActivities[todayKey].habitsCompleted++;
        updated.dailyActivities[todayKey].habitsTotal = totalHabits;
        updated.currentStreak = calculateStreak(updated.dailyActivities);
        updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);

        saveAnalytics(updated, userId);
        setAnalytics(updated);
        window.dispatchEvent(new CustomEvent('analytics-updated'));
    }, [userId]);

    const logChallengeCheckIn = useCallback((activeChallengesCount: number = 1) => {
        const todayKey = getTodayKey();
        const currentData = loadAnalytics(userId);
        const updated = { ...currentData };

        if (!updated.dailyActivities[todayKey]) {
            updated.dailyActivities[todayKey] = getDefaultDailyActivity(todayKey);
        }

        updated.dailyActivities[todayKey].challengeCheckIns++;
        updated.dailyActivities[todayKey].activeChallenges = activeChallengesCount;
        updated.currentStreak = calculateStreak(updated.dailyActivities);
        updated.longestStreak = Math.max(updated.longestStreak, updated.currentStreak);

        saveAnalytics(updated, userId);
        setAnalytics(updated);
        window.dispatchEvent(new CustomEvent('analytics-updated'));
    }, [userId]);

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
        logChallengeCheckIn,
        getWeeklyData,
    };
}
