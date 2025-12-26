import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useAnalytics } from '@/hooks/useAnalytics';

interface FocusTask {
    id: string;
    title: string;
    duration: number;
    completed: boolean;
}

interface FocusTimerContextType {
    // Timer state
    isRunning: boolean;
    timeRemaining: number;
    totalDuration: number;
    currentTask: FocusTask | null;
    mode: 'focus' | 'pomodoro-work' | 'pomodoro-break';
    pomodoroCount: number;

    // Actions
    startTimer: (duration: number, task?: FocusTask, mode?: 'focus' | 'pomodoro-work') => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    resetTimer: () => void;
    finishEarly: () => void;

    // Task management
    focusTasks: FocusTask[];
    setFocusTasks: (tasks: FocusTask[]) => void;
    markTaskComplete: (taskId: string) => void;
}

const FocusTimerContext = createContext<FocusTimerContextType | null>(null);

export function useFocusTimer() {
    const context = useContext(FocusTimerContext);
    if (!context) {
        throw new Error('useFocusTimer must be used within a FocusTimerProvider');
    }
    return context;
}

interface FocusTimerProviderProps {
    children: React.ReactNode;
}

export function FocusTimerProvider({ children }: FocusTimerProviderProps) {
    const { startSession, completeSession, cancelSession } = useFocusSessions();
    const { logFocusSession } = useAnalytics();

    const [isRunning, setIsRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [currentTask, setCurrentTask] = useState<FocusTask | null>(null);
    const [mode, setMode] = useState<'focus' | 'pomodoro-work' | 'pomodoro-break'>('focus');
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load tasks from localStorage
    useEffect(() => {
        const savedTasks = localStorage.getItem('aligned_focus_tasks');
        if (savedTasks) {
            setFocusTasks(JSON.parse(savedTasks));
        }
    }, []);

    // Timer tick
    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeRemaining]);

    const handleTimerComplete = useCallback(() => {
        setIsRunning(false);

        if (mode === 'pomodoro-work') {
            setPomodoroCount(prev => prev + 1);
            logFocusSession(25);
            completeSession(25);
            setMode('pomodoro-break');
            setTimeRemaining(5 * 60);
            setTotalDuration(5 * 60);
        } else if (mode === 'pomodoro-break') {
            setMode('pomodoro-work');
            setTimeRemaining(25 * 60);
            setTotalDuration(25 * 60);
        } else {
            const minutes = currentTask?.duration || Math.round(totalDuration / 60);
            logFocusSession(minutes);
            completeSession(minutes);

            if (currentTask) {
                markTaskComplete(currentTask.id);
                setCurrentTask(null);
            }
        }
    }, [mode, currentTask, totalDuration, logFocusSession, completeSession]);

    const startTimer = useCallback((duration: number, task?: FocusTask, timerMode: 'focus' | 'pomodoro-work' = 'focus') => {
        const durationSeconds = duration * 60;
        setTimeRemaining(durationSeconds);
        setTotalDuration(durationSeconds);
        setCurrentTask(task || null);
        setMode(timerMode);
        setIsRunning(true);
        startSession(duration, timerMode === 'pomodoro-work' ? 'pomodoro' : 'focus');
    }, [startSession]);

    const pauseTimer = useCallback(() => {
        setIsRunning(false);
    }, []);

    const resumeTimer = useCallback(() => {
        setIsRunning(true);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeRemaining(0);
        setTotalDuration(0);
        setCurrentTask(null);
        cancelSession();
    }, [cancelSession]);

    const finishEarly = useCallback(() => {
        const elapsed = totalDuration - timeRemaining;
        const minutesFocused = Math.round(elapsed / 60);

        if (minutesFocused > 0) {
            logFocusSession(minutesFocused);
            completeSession(minutesFocused);
        }

        if (currentTask) {
            markTaskComplete(currentTask.id);
        }

        setIsRunning(false);
        setTimeRemaining(0);
        setTotalDuration(0);
        setCurrentTask(null);
    }, [totalDuration, timeRemaining, currentTask, logFocusSession, completeSession]);

    const markTaskComplete = useCallback((taskId: string) => {
        setFocusTasks(prev => {
            const updated = prev.map(t =>
                t.id === taskId ? { ...t, completed: true } : t
            );
            localStorage.setItem('aligned_focus_tasks', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const value: FocusTimerContextType = {
        isRunning,
        timeRemaining,
        totalDuration,
        currentTask,
        mode,
        pomodoroCount,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        finishEarly,
        focusTasks,
        setFocusTasks,
        markTaskComplete,
    };

    return (
        <FocusTimerContext.Provider value={value}>
            {children}
        </FocusTimerContext.Provider>
    );
}
