import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useFocusSessionsSupabase, FocusTask } from '@/hooks/useFocusSessionsSupabase';
import { useAnalyticsSupabase } from '@/hooks/useAnalyticsSupabase';
import { useAuth } from '@/contexts/AuthContext';

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
    setFocusTasks: (tasks: { title: string; duration: number }[]) => void;
    addFocusTask: (title: string, duration: number) => Promise<void>;
    updateFocusTask: (taskId: string, updates: { title?: string; duration?: number }) => Promise<void>;
    deleteFocusTask: (taskId: string) => Promise<void>;
    markTaskComplete: (taskId: string) => void;
    isLoadingTasks: boolean;
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
    const { user } = useAuth();
    const {
        startSession,
        completeSession,
        cancelSession,
        tasks,
        addTask,
        updateTask,
        markTaskComplete: markTaskCompleteSupabase,
        deleteTask,
        setTasksFromAI,
        isLoading: isLoadingTasks,
    } = useFocusSessionsSupabase(user?.id);
    const { logFocusSession, logTaskComplete } = useAnalyticsSupabase(user?.id);

    const [isRunning, setIsRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [currentTask, setCurrentTask] = useState<FocusTask | null>(null);
    const [mode, setMode] = useState<'focus' | 'pomodoro-work' | 'pomodoro-break'>('focus');
    const [pomodoroCount, setPomodoroCount] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    const handleTimerComplete = useCallback(async () => {
        setIsRunning(false);

        if (mode === 'pomodoro-work') {
            setPomodoroCount(prev => prev + 1);
            logFocusSession(25);
            await completeSession(25);
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
            await completeSession(minutes);

            if (currentTask) {
                await handleMarkTaskComplete(currentTask.id);
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

    const finishEarly = useCallback(async () => {
        const elapsed = totalDuration - timeRemaining;
        const minutesFocused = Math.round(elapsed / 60);

        if (minutesFocused > 0) {
            logFocusSession(minutesFocused);
            await completeSession(minutesFocused);
        }

        if (currentTask) {
            await handleMarkTaskComplete(currentTask.id);
        }

        setIsRunning(false);
        setTimeRemaining(0);
        setTotalDuration(0);
        setCurrentTask(null);
    }, [totalDuration, timeRemaining, currentTask, logFocusSession, completeSession]);

    const handleMarkTaskComplete = useCallback(async (taskId: string) => {
        await markTaskCompleteSupabase(taskId);
        logTaskComplete(tasks.length);
    }, [markTaskCompleteSupabase, logTaskComplete, tasks.length]);

    const handleSetFocusTasks = useCallback(async (newTasks: { title: string; duration: number }[]) => {
        await setTasksFromAI(newTasks);
    }, [setTasksFromAI]);

    const handleAddFocusTask = useCallback(async (title: string, duration: number) => {
        await addTask(title, duration);
    }, [addTask]);

    const handleUpdateFocusTask = useCallback(async (taskId: string, updates: { title?: string; duration?: number }) => {
        await updateTask(taskId, updates);
    }, [updateTask]);

    const handleDeleteFocusTask = useCallback(async (taskId: string) => {
        await deleteTask(taskId);
    }, [deleteTask]);

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
        focusTasks: tasks,
        setFocusTasks: handleSetFocusTasks,
        addFocusTask: handleAddFocusTask,
        updateFocusTask: handleUpdateFocusTask,
        deleteFocusTask: handleDeleteFocusTask,
        markTaskComplete: handleMarkTaskComplete,
        isLoadingTasks,
    };

    return (
        <FocusTimerContext.Provider value={value}>
            {children}
        </FocusTimerContext.Provider>
    );
}
