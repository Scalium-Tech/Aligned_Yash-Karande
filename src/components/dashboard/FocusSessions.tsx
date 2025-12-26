import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, RotateCcw, CheckCircle2, Clock, Flame,
    Target, Sparkles, Loader2, Trophy, ListChecks, Plus, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useGoals } from '@/hooks/useGoals';
import { useFocusTimer } from '@/contexts/FocusTimerContext';

interface FocusSessionsProps {
    userIdentities?: { name: string; selected?: boolean }[];
}

export function FocusSessions({ userIdentities }: FocusSessionsProps) {
    const { focusData, getTodayStats, getWeekStats } = useFocusSessions();
    const { analytics, getWeeklyData } = useAnalytics();
    const { getActiveChallenges } = useGoals();
    const {
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
    } = useFocusTimer();

    const [customMinutes, setCustomMinutes] = useState(45);
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
    const [quarterlyCompletions, setQuarterlyCompletions] = useState<Record<string, string | null>>({});

    // Custom task creation state
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState(30);

    const todayStats = getTodayStats();
    const weeklyData = getWeeklyData();
    const activeChallenges = getActiveChallenges();

    const totalTasksThisWeek = weeklyData.reduce((sum, d) => sum + d.tasksCompleted, 0);

    // Load quarterly completions (synchronized with Analytics logic)
    useEffect(() => {
        const stored = localStorage.getItem('aligned_quarterly_completions');
        if (stored) {
            try {
                setQuarterlyCompletions(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading quarterly completions for focus chart:', e);
            }
        }
    }, []);

    // Get the last 7 dates for precise daily mapping
    const last7DaysStrings = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        last7DaysStrings.push(d.toISOString().split('T')[0]);
    }

    const quarterlyProgressTotal = Object.values(quarterlyCompletions).filter(date =>
        date && last7DaysStrings.includes(date)
    ).length;

    const challengeCheckInsTotal = activeChallenges.reduce((sum, c) => {
        const weeklyCheckIns = c.checkIns.filter(date => last7DaysStrings.includes(date)).length;
        return sum + weeklyCheckIns;
    }, 0);

    // Map daily data for the 4-metric chart
    const chartData = weeklyData.map((d, idx) => {
        const dateStr = last7DaysStrings[idx];
        const quarterlyForDay = Object.values(quarterlyCompletions).filter(date => date === dateStr).length;
        const challengesForDay = activeChallenges.filter(c => c.checkIns.includes(dateStr)).length;

        return {
            ...d,
            challenges: challengesForDay,
            quarterly: quarterlyForDay,
        };
    });

    // Generate identity-based focus tasks
    const generateFocusTasks = async () => {
        const selectedIdentity = userIdentities?.find(i => i.selected)?.name || 'professional';
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        if (!apiKey) {
            const fallbackTasks = [
                { id: '1', title: `Deep work: ${selectedIdentity} skill building`, duration: 45, completed: false },
                { id: '2', title: 'Learn something new in your field', duration: 30, completed: false },
                { id: '3', title: 'Review and reflect on progress', duration: 15, completed: false },
            ];
            setFocusTasks(fallbackTasks);
            return;
        }

        setIsGeneratingTasks(true);

        try {
            const prompt = `You are a productivity coach. The user identifies as: "${selectedIdentity}"

Generate 4 focused work sessions tailored to this identity. Each session should help them become better at their craft.

Return ONLY a JSON array with this exact format:
[
  {"id": "1", "title": "Session title (max 50 chars)", "duration": 30, "completed": false},
  {"id": "2", "title": "Session title", "duration": 45, "completed": false},
  {"id": "3", "title": "Session title", "duration": 25, "completed": false},
  {"id": "4", "title": "Session title", "duration": 20, "completed": false}
]

Make titles specific and actionable (e.g., "Build a portfolio project" not "Work on skills").
Vary durations between 15-60 minutes.
Return only JSON, no other text.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

                if (text.startsWith('```json')) text = text.slice(7);
                if (text.startsWith('```')) text = text.slice(3);
                if (text.endsWith('```')) text = text.slice(0, -3);
                text = text.trim();

                const tasks = JSON.parse(text);
                setFocusTasks(tasks);
                localStorage.setItem('aligned_focus_tasks', JSON.stringify(tasks));
            }
        } catch (error) {
            console.error('Error generating tasks:', error);
        } finally {
            setIsGeneratingTasks(false);
        }
    };

    // Load or generate tasks on mount
    useEffect(() => {
        if (focusTasks.length === 0 && userIdentities && userIdentities.length > 0) {
            generateFocusTasks();
        }
    }, [userIdentities]);

    const handleStartTask = (task: typeof focusTasks[0]) => {
        startTimer(task.duration, task, 'focus');
    };

    const handleStartFocus = () => {
        startTimer(customMinutes, undefined, 'focus');
    };

    const handleAddCustomTask = () => {
        if (!newTaskTitle.trim()) return;

        const newTask = {
            id: `custom-${Date.now()}`,
            title: newTaskTitle.trim(),
            duration: newTaskDuration,
            completed: false,
        };

        const updatedTasks = [...focusTasks, newTask];
        setFocusTasks(updatedTasks);
        localStorage.setItem('aligned_focus_tasks', JSON.stringify(updatedTasks));

        setNewTaskTitle('');
        setNewTaskDuration(30);
        setShowAddTask(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* AI Focus Tasks */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Focus Tasks</h3>
                            <p className="text-xs text-muted-foreground">AI-generated based on your identity</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowAddTask(true)}
                            disabled={isRunning}
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Task
                        </Button>
                        <Button
                            onClick={generateFocusTasks}
                            disabled={isGeneratingTasks || isRunning}
                            variant="outline"
                            size="sm"
                        >
                            {isGeneratingTasks ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Regenerate
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Custom Task Form */}
                <AnimatePresence>
                    {showAddTask && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-violet/10 border border-primary/20"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-foreground flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-primary" />
                                    Add Custom Task
                                </h4>
                                <button onClick={() => setShowAddTask(false)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Task Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Complete project documentation"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTask()}
                                        className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Duration (minutes)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Enter minutes"
                                            min="1"
                                            max="180"
                                            value={newTaskDuration || ''}
                                            onChange={(e) => setNewTaskDuration(e.target.value === '' ? 0 : Number(e.target.value))}
                                            className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">min</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddCustomTask}
                                    disabled={!newTaskTitle.trim()}
                                    className="w-full bg-gradient-to-r from-primary to-violet"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task ({newTaskDuration} min)
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {focusTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-xl border transition-all ${task.completed
                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                : currentTask?.id === task.id
                                    ? 'bg-primary/10 border-primary/30'
                                    : 'bg-secondary/30 border-border/50 hover:border-primary/30'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {task.duration} min
                                    </p>
                                </div>
                                {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                ) : currentTask?.id === task.id ? (
                                    <span className="text-sm font-mono text-primary">{formatTime(timeRemaining)}</span>
                                ) : (
                                    <Button
                                        onClick={() => handleStartTask(task)}
                                        disabled={isRunning}
                                        size="sm"
                                        className="shrink-0"
                                    >
                                        <Play className="w-4 h-4 mr-1" />
                                        Start
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Timer + Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timer Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
                >
                    {/* Current Task Label */}
                    {currentTask && (
                        <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-sm text-primary font-medium">{currentTask.title}</p>
                        </div>
                    )}

                    {/* Duration Selector (only when not running) */}
                    {!isRunning && !currentTask && (
                        <div className="mb-6">
                            <label className="text-sm text-muted-foreground mb-2 block">Duration (minutes)</label>
                            <div className="flex gap-2">
                                {[25, 45, 60, 90].map(mins => (
                                    <button
                                        key={mins}
                                        onClick={() => setCustomMinutes(mins)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${customMinutes === mins
                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                            : 'bg-secondary/30 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* Timer Display */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
                                <motion.circle
                                    cx="80"
                                    cy="80"
                                    r="72"
                                    stroke={mode === 'pomodoro-break' ? 'hsl(142, 76%, 36%)' : 'url(#focusGrad)'}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 72}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 72 * (1 - progress / 100) }}
                                    transition={{ duration: 0.5 }}
                                />
                                <defs>
                                    <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                                        <stop offset="100%" stopColor="hsl(262, 83%, 58%)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-foreground">
                                    {isRunning || timeRemaining > 0 ? formatTime(timeRemaining) : formatTime(customMinutes * 60)}
                                </span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {mode === 'pomodoro-break' ? '☕ Break' : '🎯 Focus'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {!isRunning ? (
                                <Button onClick={handleStartFocus} size="lg" className="bg-gradient-to-r from-primary to-violet hover:opacity-90 px-8">
                                    <Play className="w-5 h-5 mr-2" />
                                    Start
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={pauseTimer} variant="outline" size="lg">
                                        <Pause className="w-5 h-5 mr-2" />
                                        Pause
                                    </Button>
                                    <Button onClick={finishEarly} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Done
                                    </Button>
                                </>
                            )}
                            {(isRunning || timeRemaining > 0) && (
                                <Button onClick={resetTimer} variant="ghost" size="lg">
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                            )}
                        </div>

                        {!isRunning && timeRemaining > 0 && (
                            <Button onClick={resumeTimer} className="mt-3" variant="outline">
                                <Play className="w-4 h-4 mr-2" />
                                Resume ({formatTime(timeRemaining)} left)
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm flex flex-col"
                >
                    <h3 className="font-semibold text-foreground mb-4">Today's Progress</h3>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-secondary/30 rounded-xl p-4 text-center">
                            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{todayStats.minutes}</p>
                            <p className="text-xs text-muted-foreground">minutes</p>
                        </div>
                        <div className="bg-secondary/30 rounded-xl p-4 text-center">
                            <Target className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{todayStats.sessions}</p>
                            <p className="text-xs text-muted-foreground">sessions</p>
                        </div>
                        <div className="bg-secondary/30 rounded-xl p-4 text-center">
                            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{analytics.currentStreak}</p>
                            <p className="text-xs text-muted-foreground">day streak</p>
                        </div>
                    </div>

                    <h4 className="text-sm font-medium text-foreground mb-3">This Week</h4>
                    <div className="h-40 flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
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
                                            default: return null;
                                        }
                                    }}
                                />
                                <Bar dataKey="focusMinutes" stackId="a" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-focus-${index}`} fill="hsl(var(--primary))" opacity={entry.focusMinutes > 0 ? 1 : 0.1} />
                                    ))}
                                </Bar>
                                <Bar dataKey="tasksCompleted" stackId="b" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-tasks-${index}`} fill="#10b981" opacity={entry.tasksCompleted > 0 ? 0.8 : 0.1} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tasks completed this week</span>
                            <span className="font-bold text-foreground">{totalTasksThisWeek}</span>
                        </div>
                        <div className="flex justify-between text-right">
                            <span className="text-muted-foreground mr-2">Focus time</span>
                            <span className="font-bold text-foreground">{focusData.totalMinutes}m</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
