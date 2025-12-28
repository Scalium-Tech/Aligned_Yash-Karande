import { useState, useEffect, useCallback } from 'react';
import { getUserStorageKey } from '@/lib/userStorage';

interface FocusSession {
    id: string;
    date: string;
    duration: number; // in minutes
    completed: boolean;
    type: 'focus' | 'pomodoro';
    startedAt: string;
    endedAt?: string;
}

interface FocusData {
    sessions: FocusSession[];
    totalMinutes: number;
    totalSessions: number;
    pomodoroCount: number;
}

const FOCUS_KEY = 'aligned_focus_sessions';

function loadFocusData(userId?: string): FocusData {
    const key = getUserStorageKey(FOCUS_KEY, userId);
    const stored = localStorage.getItem(key);
    if (!stored) {
        return { sessions: [], totalMinutes: 0, totalSessions: 0, pomodoroCount: 0 };
    }
    try {
        return JSON.parse(stored);
    } catch {
        return { sessions: [], totalMinutes: 0, totalSessions: 0, pomodoroCount: 0 };
    }
}

function saveFocusData(data: FocusData, userId?: string): void {
    const key = getUserStorageKey(FOCUS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(data));
}

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

export function useFocusSessions(userId?: string) {
    const [focusData, setFocusData] = useState<FocusData>(() => loadFocusData(userId));
    const [activeSession, setActiveSession] = useState<FocusSession | null>(null);

    // Reload data when userId changes
    useEffect(() => {
        const newData = loadFocusData(userId);
        setFocusData(newData);
    }, [userId]);

    const startSession = useCallback((duration: number, type: 'focus' | 'pomodoro' = 'focus') => {
        const session: FocusSession = {
            id: `session-${Date.now()}`,
            date: getTodayKey(),
            duration,
            completed: false,
            type,
            startedAt: new Date().toISOString(),
        };
        setActiveSession(session);
        return session;
    }, []);

    const completeSession = useCallback((minutesFocused: number) => {
        if (!activeSession) return;

        const completedSession: FocusSession = {
            ...activeSession,
            duration: minutesFocused,
            completed: true,
            endedAt: new Date().toISOString(),
        };

        const updated: FocusData = {
            ...focusData,
            sessions: [completedSession, ...focusData.sessions].slice(0, 100), // Keep last 100
            totalMinutes: focusData.totalMinutes + minutesFocused,
            totalSessions: focusData.totalSessions + 1,
            pomodoroCount: activeSession.type === 'pomodoro'
                ? focusData.pomodoroCount + 1
                : focusData.pomodoroCount,
        };

        saveFocusData(updated, userId);
        setFocusData(updated);
        setActiveSession(null);
        return completedSession;
    }, [activeSession, focusData, userId]);

    const cancelSession = useCallback(() => {
        setActiveSession(null);
    }, []);

    const getTodayStats = useCallback(() => {
        const todayKey = getTodayKey();
        const todaySessions = focusData.sessions.filter(s => s.date === todayKey);
        return {
            sessions: todaySessions.length,
            minutes: todaySessions.reduce((sum, s) => sum + s.duration, 0),
            pomodoros: todaySessions.filter(s => s.type === 'pomodoro').length,
        };
    }, [focusData]);

    const getWeekStats = useCallback(() => {
        const days: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }

        return days.map(date => {
            const daySessions = focusData.sessions.filter(s => s.date === date);
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return {
                day: dayName,
                date,
                minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
                sessions: daySessions.length,
                pomodoros: daySessions.filter(s => s.type === 'pomodoro').length,
            };
        });
    }, [focusData]);

    const getRecentSessions = useCallback((limit: number = 10) => {
        return focusData.sessions.slice(0, limit);
    }, [focusData]);

    return {
        focusData,
        activeSession,
        startSession,
        completeSession,
        cancelSession,
        getTodayStats,
        getWeekStats,
        getRecentSessions,
    };
}
