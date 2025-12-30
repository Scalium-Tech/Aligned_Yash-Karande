import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Heart, CheckCircle2, Plus, Droplets, Moon, Footprints,
    Apple, Dumbbell, X, Sparkles, Send, Loader2, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface NonNegotiable {
    id: string;
    text: string;
    completed: boolean;
}

interface HealthObjective {
    id: string;
    text: string;
    completed: boolean;
    targetValue?: string;
    icon: string;
    personalizedTip: string;
}

const STORAGE_KEY = 'aligned_daily_habits';
const HEALTH_OBJECTIVES_KEY = 'aligned_health_objectives';
const HEALTH_PERSONALIZED_KEY = 'aligned_health_personalized';

const defaultNonNegotiables: NonNegotiable[] = [
    { id: '1', text: 'Morning meditation or reflection', completed: false },
    { id: '2', text: 'Move your body (any exercise)', completed: false },
    { id: '3', text: 'Learn something new', completed: false },
    { id: '4', text: 'Connect with someone', completed: false },
];

const defaultHealthObjectives: HealthObjective[] = [
    { id: 'water', text: 'Daily Hydration Goal', icon: 'droplets', completed: false, targetValue: '8 glasses', personalizedTip: 'Staying hydrated keeps your brain sharp for deep work sessions.' },
    { id: 'sleep', text: 'Quality Sleep Target', icon: 'moon', completed: false, targetValue: '7.5 hours', personalizedTip: 'Consistent sleep is the foundation of peak cognitive performance.' },
    { id: 'movement', text: 'Mindful Movement', icon: 'footprints', completed: false, targetValue: '10,000 steps', personalizedTip: 'Movement breaks help prevent mental fatigue and physical friction.' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    droplets: Droplets,
    moon: Moon,
    footprints: Footprints,
    apple: Apple,
    dumbbell: Dumbbell,
};

const placeholders: Record<string, string> = {
    water: "e.g., I drank 4 glasses today, feeling a bit dehydrated...",
    sleep: "e.g., Slept 6 hours, woke up tired, had trouble falling asleep...",
    activity: "e.g., Walked 3000 steps, sat at desk most of the day...",
    nutrition: "e.g., Had 2 servings of vegetables, skipped breakfast...",
};

function loadHabitsData(): { nonNegotiables: NonNegotiable[], lastDate: string } {
    const stored = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];

    if (!stored) {
        return { nonNegotiables: defaultNonNegotiables, lastDate: today };
    }

    try {
        const data = JSON.parse(stored);
        if (data.lastDate !== today) {
            return {
                nonNegotiables: (data.nonNegotiables || defaultNonNegotiables).map((n: NonNegotiable) => ({ ...n, completed: false })),
                lastDate: today
            };
        }
        return data;
    } catch {
        return { nonNegotiables: defaultNonNegotiables, lastDate: today };
    }
}

function loadHealthObjectives(): { objectives: HealthObjective[], lastDate: string } {
    const stored = localStorage.getItem(HEALTH_OBJECTIVES_KEY);
    const today = new Date().toISOString().split('T')[0];

    if (!stored) return { objectives: defaultHealthObjectives, lastDate: today };

    try {
        const data = JSON.parse(stored);
        if (data.lastDate !== today) {
            // Reset completion status for a new day but keep the AI generated text
            return {
                objectives: (data.objectives || defaultHealthObjectives).map((o: HealthObjective) => ({ ...o, completed: false })),
                lastDate: today
            };
        }
        return data;
    } catch {
        return { objectives: defaultHealthObjectives, lastDate: today };
    }
}

const HABITS_PERSONALIZED_KEY = 'aligned_habits_personalized';
const HEALTH_PERSONALIZED_USER_KEY = 'aligned_health_personalized_user';

export function DailyHabitsSection() {
    const [nonNegotiables, setNonNegotiables] = useState<NonNegotiable[]>([]);
    const [healthObjectives, setHealthObjectives] = useState<HealthObjective[]>([]);
    const [newNonNeg, setNewNonNeg] = useState('');
    const [showAddNonNeg, setShowAddNonNeg] = useState(false);
    const [isGeneratingHealth, setIsGeneratingHealth] = useState(false);
    const { user } = useAuth();
    const { logHabitComplete, logTaskComplete, setHabitsTotal } = useAnalytics(user?.id);

    // Load data on mount and check for personalization from onboarding
    useEffect(() => {
        const initializeAll = async () => {
            const habitsData = loadHabitsData();
            const healthData = loadHealthObjectives();

            setNonNegotiables(habitsData.nonNegotiables);
            setHealthObjectives(healthData.objectives);

            if (user) {
                const habitPersonalized = localStorage.getItem(HABITS_PERSONALIZED_KEY);
                const healthPersonalized = localStorage.getItem(HEALTH_PERSONALIZED_USER_KEY);

                if (habitPersonalized !== user.id || healthPersonalized !== user.id) {
                    try {
                        const { data: userIdentity, error } = await supabase
                            .from('user_identity')
                            .select('habits_focus, health_focus')
                            .eq('id', user.id)
                            .single();

                        if (!error && userIdentity) {
                            // Personalize Habits
                            if (habitPersonalized !== user.id && userIdentity.habits_focus) {
                                const habits = userIdentity.habits_focus.split(/[,\n;]+/).map((h: string) => h.trim()).filter((h: string) => h.length > 2);
                                if (habits.length > 0) {
                                    const personalized = habits.map((h: string, i: number) => ({
                                        id: `onboard-${i}`,
                                        text: h.charAt(0).toUpperCase() + h.slice(1),
                                        completed: false
                                    }));
                                    setNonNegotiables(personalized);
                                    localStorage.setItem(HABITS_PERSONALIZED_KEY, user.id);
                                }
                            }

                            // Personalize Health Objectives
                            if (healthPersonalized !== user.id && userIdentity.health_focus) {
                                await generateHealthObjectives(userIdentity.health_focus);
                                localStorage.setItem(HEALTH_PERSONALIZED_USER_KEY, user.id);
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching user identity:', err);
                    }
                }
            }
        };

        initializeAll();
    }, [user]);

    // Set total habits count in analytics when habits are loaded
    useEffect(() => {
        const totalHabits = nonNegotiables.length + healthObjectives.length;
        if (totalHabits > 0) {
            setHabitsTotal(totalHabits);
        }
    }, [nonNegotiables.length, healthObjectives.length, setHabitsTotal]);

    const generateHealthObjectives = async (healthFocus: string) => {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) return;

        setIsGeneratingHealth(true);
        try {
            const prompt = `Based on the user's health focus: "${healthFocus}"
            
            Generate 4 specific, actionable daily health objectives. For each, provide:
            1. A short title (e.g., "Deep Sleep Mastery")
            2. A target value (e.g., "7-8 hours", "3 liters", "15 mins meditation")
            3. A personalized tip correlating this to their productivity.
            4. An icon name from this list: "droplets", "moon", "footprints", "apple", "dumbbell".

            Return ONLY a JSON array:
            [{"id": "h1", "text": "...", "targetValue": "...", "personalizedTip": "...", "icon": "..."}]`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                if (text.startsWith('```json')) text = text.slice(7);
                if (text.startsWith('```')) text = text.slice(3);
                if (text.endsWith('```')) text = text.slice(0, -3);

                const objectives = JSON.parse(text.trim()).map((obj: Partial<HealthObjective>) => ({ ...obj, completed: false }));
                setHealthObjectives(objectives);
                saveHealthObjectives(objectives);
            }
        } catch (e) {
            console.error('Error generating health goals:', e);
        } finally {
            setIsGeneratingHealth(false);
        }
    };

    const saveHealthObjectives = (objectives: HealthObjective[]) => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(HEALTH_OBJECTIVES_KEY, JSON.stringify({
            objectives,
            lastDate: today,
        }));
    };

    // Save non-negotiables
    useEffect(() => {
        if (nonNegotiables.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                nonNegotiables,
                lastDate: today,
            }));
        }
    }, [nonNegotiables]);

    // Save health objectives
    useEffect(() => {
        if (healthObjectives.length > 0) {
            saveHealthObjectives(healthObjectives);
        }
    }, [healthObjectives]);

    const toggleNonNegotiable = (id: string) => {
        setNonNegotiables(prev => {
            const updated = prev.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            );
            const item = prev.find(i => i.id === id);
            // Only log if we are marking a habit as completed (not unchecking)
            if (item && !item.completed) {
                logHabitComplete(prev.length + healthObjectives.length);
            }
            return updated;
        });
    };

    const addNonNegotiable = () => {
        if (!newNonNeg.trim()) return;
        setNonNegotiables(prev => [
            ...prev,
            { id: `custom-${Date.now()}`, text: newNonNeg.trim(), completed: false }
        ]);
        setNewNonNeg('');
        setShowAddNonNeg(false);
    };

    const removeNonNegotiable = (id: string) => {
        setNonNegotiables(prev => prev.filter(item => item.id !== id));
    };

    // const updateHealthInput = (id: string, value: string) => { // Removed as per instructions
    //     setHealthEntries(prev => prev.map(entry =>
    //         entry.id === id ? { ...entry, userInput: value } : entry
    //     ));
    // };

    // const generateAISuggestion = async (id: string) => { // Removed as per instructions
    //     const entry = healthEntries.find(e => e.id === id);
    //     if (!entry || !entry.userInput.trim()) return;

    //     const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    //     setHealthEntries(prev => prev.map(e =>
    //         e.id === id ? { ...e, isLoading: true } : e
    //     ));

    //     try {
    //         const prompts: Record<string, string> = {
    //             water: `The user said about their water intake: "${entry.userInput}"

    //     Provide a brief, helpful suggestion (2-3 sentences) about their hydration. Include:
    //     - Whether their intake is adequate (adults need ~8 glasses/2L daily)
    //     - A specific tip to improve if needed
    //     Be encouraging and practical.`,
    //             sleep: `The user said about their sleep: "${entry.userInput}"

    //     Provide a brief, helpful suggestion (2-3 sentences) about their sleep. Include:
    //     - Whether this sounds like adequate rest (adults need 7-9 hours)
    //     - A specific tip to improve sleep quality if needed
    //     Be encouraging and practical.`,
    //             activity: `The user said about their physical activity: "${entry.userInput}"

    //     Provide a brief, helpful suggestion (2-3 sentences) about their activity level. Include:
    //     - Whether they're meeting daily movement goals (10,000 steps or 30 min exercise recommended)
    //     - A specific tip to increase movement if needed
    //     Be encouraging and practical.`,
    //             nutrition: `The user said about their nutrition: "${entry.userInput}"

    //     Provide a brief, helpful suggestion (2-3 sentences) about their diet. Include:
    //     - Whether they're getting enough fruits/vegetables (5 servings recommended)
    //     - A specific tip to improve nutrition if needed
    //     Be encouraging and practical.`,
    //         };

    //         if (!apiKey) {
    //             const fallbacks: Record<string, string> = {
    //                 water: "Staying hydrated is key! Aim for 8 glasses daily. Try keeping a water bottle at your desk as a reminder.",
    //                 sleep: "Quality sleep is essential for recovery. Try maintaining a consistent sleep schedule and avoiding screens before bed.",
    //                 activity: "Every step counts! Even short walks throughout the day add up. Consider taking stairs or a 10-minute walk after meals.",
    //                 nutrition: "Great that you're tracking nutrition! Try adding one more serving of vegetables to your next meal.",
    //             };
    //             setHealthEntries(prev => prev.map(e =>
    //                 e.id === id ? { ...e, aiSuggestion: fallbacks[id] || "Keep tracking your health habits!", isLoading: false } : e
    //             ));
    //             return;
    //         }

    //         const response = await fetch(
    //             `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    //             {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({
    //                     contents: [{ parts: [{ text: prompts[id] }] }],
    //                     generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
    //                 }),
    //             }
    //         );

    //         if (response.ok) {
    //             const data = await response.json();
    //             const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    //             setHealthEntries(prev => prev.map(e =>
    //                 e.id === id ? { ...e, aiSuggestion: suggestion, isLoading: false } : e
    //             ));
    //         }
    //     } catch (error) {
    //         console.error('Error generating suggestion:', error);
    //         setHealthEntries(prev => prev.map(e =>
    //             e.id === id ? { ...e, aiSuggestion: "Keep tracking your health habits! Every small step matters.", isLoading: false } : e
    //         ));
    //     }
    // };

    const toggleHealthObjective = (id: string) => {
        setHealthObjectives(prev => {
            const updated = prev.map(obj =>
                obj.id === id ? { ...obj, completed: !obj.completed } : obj
            );
            const obj = prev.find(o => o.id === id);
            // Log as a habit completion since health objectives are part of the broader habit system
            if (obj && !obj.completed) {
                logHabitComplete(nonNegotiables.length + prev.length);
            }
            return updated;
        });
    };

    const completedNonNegs = nonNegotiables.filter(n => n.completed).length;

    return (
        <div className="space-y-6">
            {/* Daily Non-Negotiables */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Daily Non-Negotiables</h3>
                            <p className="text-xs text-muted-foreground">Your essential daily commitments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${completedNonNegs === nonNegotiables.length && completedNonNegs > 0 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {completedNonNegs}/{nonNegotiables.length}
                        </span>
                        <Button onClick={() => setShowAddNonNeg(true)} size="sm" variant="outline">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {showAddNonNeg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4 flex gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Add a non-negotiable..."
                            value={newNonNeg}
                            onChange={e => setNewNonNeg(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && addNonNegotiable()}
                            className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
                            autoFocus
                        />
                        <Button onClick={addNonNegotiable} size="sm">Add</Button>
                        <Button onClick={() => setShowAddNonNeg(false)} size="sm" variant="ghost">
                            <X className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}

                <div className="space-y-2">
                    {nonNegotiables.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.completed
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-secondary/30 hover:bg-secondary/50'
                                }`}
                        >
                            <button
                                onClick={() => toggleNonNegotiable(item.id)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${item.completed
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-secondary border border-border hover:border-emerald-500/50'
                                    }`}
                            >
                                {item.completed && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <span className={`flex-1 text-sm ${item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {item.text}
                            </span>
                            {item.id.startsWith('custom') && (
                                <button
                                    onClick={() => removeNonNegotiable(item.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>

                {completedNonNegs === nonNegotiables.length && nonNegotiables.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
                    >
                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            All non-negotiables complete! You're building your identity.
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Health Tracking with AI Generated Objectives */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Health Performance</h3>
                            <p className="text-xs text-muted-foreground">AI-personalized daily health targets</p>
                        </div>
                    </div>
                    {isGeneratingHealth && (
                        <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            Aligning goals...
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {healthObjectives.map((obj, index) => {
                        const Icon = iconMap[obj.icon] || Heart;

                        return (
                            <motion.div
                                key={obj.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group p-4 rounded-2xl transition-all border ${obj.completed
                                    ? 'bg-blue-500/5 border-blue-500/20'
                                    : 'bg-secondary/30 border-transparent hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${obj.completed ? 'bg-blue-500/20' : 'bg-background border border-border/50'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${obj.completed ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`font-semibold text-sm ${obj.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {obj.text}
                                            </h4>
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                {obj.targetValue}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                            {obj.personalizedTip}
                                        </p>

                                        <Button
                                            onClick={() => toggleHealthObjective(obj.id)}
                                            size="sm"
                                            className={`w-full transition-all ${obj.completed
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20'
                                                : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20'
                                                }`}
                                            variant={obj.completed ? 'outline' : 'default'}
                                        >
                                            {obj.completed ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Achieved Today
                                                </>
                                            ) : (
                                                'Mark as Complete'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {healthObjectives.filter(o => o.completed).length === healthObjectives.length && healthObjectives.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-center"
                    >
                        <p className="text-sm text-blue-600 font-bold flex items-center justify-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Peak Physical State Achieved!
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
