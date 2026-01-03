import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData, removeUserData } from '@/lib/userStorage';

// Database types
export interface FocusSession {
    id: string;
    user_id: string;
    session_date: string;
    duration: number;
    completed: boolean;
    session_type: 'focus' | 'pomodoro';
    started_at: string;
    ended_at: string | null;
    created_at: string;
}

export interface FocusTask {
    id: string;
    user_id: string;
    title: string;
    duration: number;
    completed: boolean;
    created_at: string;
    completed_at: string | null;
}

// Legacy localStorage keys
const LEGACY_FOCUS_KEY = 'aligned_focus_sessions';
const LEGACY_TASKS_KEY = 'aligned_focus_tasks';
const MIGRATION_DONE_KEY = 'aligned_focus_migrated_to_supabase';

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

export function useFocusSessionsSupabase(userId?: string) {
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [tasks, setTasks] = useState<FocusTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSession, setActiveSession] = useState<{
        id: string;
        duration: number;
        type: 'focus' | 'pomodoro';
        startedAt: string;
    } | null>(null);

    // Fetch all focus data
    const fetchData = useCallback(async () => {
        if (!userId) {
            setSessions([]);
            setTasks([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch sessions
            const { data: sessionsData, error: sessionsError } = await supabase
                .from('focus_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('session_date', { ascending: false })
                .limit(100);

            if (sessionsError) throw sessionsError;

            // Fetch tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('focus_tasks')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (tasksError) throw tasksError;

            // Migrate from localStorage if empty
            if (!sessionsData || sessionsData.length === 0) {
                await migrateFromLocalStorage(userId);
                // Re-fetch after migration
                const { data: newSessions } = await supabase
                    .from('focus_sessions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('session_date', { ascending: false })
                    .limit(100);

                const { data: newTasks } = await supabase
                    .from('focus_tasks')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                setSessions(newSessions || []);
                setTasks(newTasks || []);
            } else {
                setSessions(sessionsData);
                setTasks(tasksData || []);
            }
        } catch (err) {
            console.error('Error fetching focus data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load focus sessions');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Migrate from localStorage
    const migrateFromLocalStorage = async (uid: string): Promise<boolean> => {
        const migrationKey = `${MIGRATION_DONE_KEY}_${uid}`;
        if (localStorage.getItem(migrationKey)) return false;

        try {
            // Migrate focus sessions
            interface LegacySession {
                id: string;
                date: string;
                duration: number;
                completed: boolean;
                type: 'focus' | 'pomodoro';
                startedAt: string;
                endedAt?: string;
            }
            interface LegacyFocusData {
                sessions?: LegacySession[];
                totalMinutes?: number;
                totalSessions?: number;
                pomodoroCount?: number;
            }

            const legacyFocus = getUserData<LegacyFocusData>(LEGACY_FOCUS_KEY, uid, { sessions: [] });

            if (legacyFocus.sessions && legacyFocus.sessions.length > 0) {
                const sessionsToInsert = legacyFocus.sessions.map(s => ({
                    user_id: uid,
                    session_date: s.date,
                    duration: s.duration,
                    completed: s.completed,
                    session_type: s.type,
                    started_at: s.startedAt,
                    ended_at: s.endedAt || null,
                }));

                await supabase.from('focus_sessions').insert(sessionsToInsert);
            }

            // Migrate focus tasks
            interface LegacyTask {
                id: string;
                title: string;
                duration: number;
                completed: boolean;
            }

            const legacyTasks = getUserData<LegacyTask[]>(LEGACY_TASKS_KEY, uid, []);

            if (legacyTasks && legacyTasks.length > 0) {
                const tasksToInsert = legacyTasks.map(t => ({
                    user_id: uid,
                    title: t.title,
                    duration: t.duration,
                    completed: t.completed,
                }));

                await supabase.from('focus_tasks').insert(tasksToInsert);
            }

            // Mark migration complete and clean up
            localStorage.setItem(migrationKey, 'true');
            removeUserData(LEGACY_FOCUS_KEY, uid);
            removeUserData(LEGACY_TASKS_KEY, uid);
            console.log('Successfully migrated focus sessions from localStorage to Supabase');
            return true;
        } catch (err) {
            console.error('Error migrating focus sessions:', err);
        }
        return false;
    };

    // Start a focus session
    const startSession = useCallback((duration: number, type: 'focus' | 'pomodoro' = 'focus') => {
        const session = {
            id: `session-${Date.now()}`,
            duration,
            type,
            startedAt: new Date().toISOString(),
        };
        setActiveSession(session);
        return session;
    }, []);

    // Complete a focus session
    const completeSession = useCallback(async (minutesFocused: number): Promise<FocusSession | null> => {
        if (!userId || !activeSession) return null;

        const now = new Date().toISOString();
        const today = getTodayKey();

        try {
            const { data, error } = await supabase
                .from('focus_sessions')
                .insert({
                    user_id: userId,
                    session_date: today,
                    duration: minutesFocused,
                    completed: true,
                    session_type: activeSession.type,
                    started_at: activeSession.startedAt,
                    ended_at: now,
                })
                .select()
                .single();

            if (error) throw error;

            setSessions(prev => [data, ...prev]);
            setActiveSession(null);
            return data;
        } catch (err) {
            console.error('Error completing session:', err);
            return null;
        }
    }, [userId, activeSession]);

    // Cancel active session
    const cancelSession = useCallback(() => {
        setActiveSession(null);
    }, []);

    // Get today's stats
    const getTodayStats = useCallback(() => {
        const today = getTodayKey();
        const todaySessions = sessions.filter(s => s.session_date === today);
        return {
            sessions: todaySessions.length,
            minutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
            pomodoros: todaySessions.filter(s => s.session_type === 'pomodoro').length,
        };
    }, [sessions]);

    // Get week stats
    const getWeekStats = useCallback(() => {
        const days: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }

        return days.map(date => {
            const daySessions = sessions.filter(s => s.session_date === date);
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return {
                day: dayName,
                date,
                minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
                sessions: daySessions.length,
                pomodoros: daySessions.filter(s => s.session_type === 'pomodoro').length,
            };
        });
    }, [sessions]);

    // Calculate day streak
    const getDayStreak = useCallback(() => {
        if (sessions.length === 0) return 0;

        // Get unique dates with sessions, sorted descending
        const uniqueDates = [...new Set(sessions.map(s => s.session_date))].sort().reverse();
        if (uniqueDates.length === 0) return 0;

        const today = getTodayKey();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];

        // Check if streak includes today or yesterday
        if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayKey) {
            return 0;
        }

        let streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i - 1]);
            const prevDate = new Date(uniqueDates[i]);
            const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }, [sessions]);

    // Get recent sessions
    const getRecentSessions = useCallback((limit: number = 10): FocusSession[] => {
        return sessions.slice(0, limit);
    }, [sessions]);

    // Task operations
    const addTask = useCallback(async (title: string, duration: number): Promise<FocusTask | null> => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('focus_tasks')
                .insert({
                    user_id: userId,
                    title,
                    duration,
                    completed: false,
                })
                .select()
                .single();

            if (error) throw error;

            setTasks(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error adding task:', err);
            return null;
        }
    }, [userId]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Pick<FocusTask, 'title' | 'duration'>>): Promise<FocusTask | null> => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('focus_tasks')
                .update(updates)
                .eq('id', taskId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;

            setTasks(prev => prev.map(t => t.id === taskId ? data : t));
            return data;
        } catch (err) {
            console.error('Error updating task:', err);
            return null;
        }
    }, [userId]);

    const markTaskComplete = useCallback(async (taskId: string): Promise<FocusTask | null> => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('focus_tasks')
                .update({
                    completed: true,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', taskId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;

            setTasks(prev => prev.map(t => t.id === taskId ? data : t));
            return data;
        } catch (err) {
            console.error('Error completing task:', err);
            return null;
        }
    }, [userId]);

    const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
        if (!userId) return false;

        try {
            const { error } = await supabase
                .from('focus_tasks')
                .delete()
                .eq('id', taskId)
                .eq('user_id', userId);

            if (error) throw error;

            setTasks(prev => prev.filter(t => t.id !== taskId));
            return true;
        } catch (err) {
            console.error('Error deleting task:', err);
            return false;
        }
    }, [userId]);

    const setTasksFromAI = useCallback(async (newTasks: { title: string; duration: number }[]): Promise<void> => {
        if (!userId) return;

        try {
            // Delete existing incomplete tasks
            await supabase
                .from('focus_tasks')
                .delete()
                .eq('user_id', userId)
                .eq('completed', false);

            // Insert new tasks
            const tasksToInsert = newTasks.map(t => ({
                user_id: userId,
                title: t.title,
                duration: t.duration,
                completed: false,
            }));

            const { data, error } = await supabase
                .from('focus_tasks')
                .insert(tasksToInsert)
                .select();

            if (error) throw error;

            // Keep completed tasks, add new ones
            setTasks(prev => [...(data || []), ...prev.filter(t => t.completed)]);
        } catch (err) {
            console.error('Error setting AI tasks:', err);
        }
    }, [userId]);

    // Get totals
    const getTotals = useCallback(() => {
        return {
            totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
            totalSessions: sessions.length,
            pomodoroCount: sessions.filter(s => s.session_type === 'pomodoro').length,
        };
    }, [sessions]);

    // Load data on mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        // Data
        sessions,
        tasks,
        activeSession,
        isLoading,
        error,
        // Session operations
        startSession,
        completeSession,
        cancelSession,
        // Stats
        getTodayStats,
        getWeekStats,
        getDayStreak,
        getRecentSessions,
        getTotals,
        // Task operations
        addTask,
        updateTask,
        markTaskComplete,
        deleteTask,
        setTasksFromAI,
        // Refresh
        refetch: fetchData,
    };
}
