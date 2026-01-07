import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Heart, CheckCircle2, Plus, Droplets, Moon, Footprints,
    Apple, Dumbbell, X, Sparkles, Loader2, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalyticsSupabase } from '@/hooks/useAnalyticsSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useDailyHabits } from '@/hooks/useDailyHabits';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    droplets: Droplets,
    moon: Moon,
    footprints: Footprints,
    apple: Apple,
    dumbbell: Dumbbell,
};

export function DailyHabitsSection() {
    const [newNonNeg, setNewNonNeg] = useState('');
    const [showAddNonNeg, setShowAddNonNeg] = useState(false);
    const [isGeneratingHealth, setIsGeneratingHealth] = useState(false);
    const { user } = useAuth();

    const {
        nonNegotiables,
        healthObjectives,
        isLoading,
        addHabit,
        deleteHabit,
        toggleCompletion,
        isCompletedToday,
        updateHealthObjectives,
    } = useDailyHabits(user?.id);

    const { logHabitComplete, setHabitsTotal } = useAnalyticsSupabase(user?.id);

    // Set total habits count in analytics when habits are loaded
    useEffect(() => {
        const totalHabits = nonNegotiables.length + healthObjectives.length;
        if (totalHabits > 0) {
            setHabitsTotal(totalHabits);
        }
    }, [nonNegotiables.length, healthObjectives.length, setHabitsTotal]);

    // Check for personalization on mount (for new users from onboarding)
    useEffect(() => {
        const initializePersonalization = async () => {
            if (!user) return;

            try {
                // Check Supabase for personalization status (source of truth)
                const { data: prefs, error: prefsError } = await supabase
                    .from('user_preferences')
                    .select('habits_personalized, health_personalized')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (prefsError && prefsError.code !== 'PGRST116') {
                    console.warn('Error fetching user preferences:', prefsError);
                }

                const habitsPersonalized = prefs?.habits_personalized ?? false;
                const healthPersonalized = prefs?.health_personalized ?? false;

                if (!habitsPersonalized || !healthPersonalized) {
                    const { data: userIdentity, error } = await supabase
                        .from('user_identity')
                        .select('health_focus')
                        .eq('id', user.id)
                        .single();

                    if (!error && userIdentity) {
                        // Mark habits as personalized (useDailyHabits already handles initial creation)
                        if (!habitsPersonalized) {
                            await supabase.from('user_preferences').upsert({
                                user_id: user.id,
                                habits_personalized: true,
                                updated_at: new Date().toISOString()
                            }, { onConflict: 'user_id' });
                        }

                        // Personalize Health Objectives with AI if health_focus exists
                        if (!healthPersonalized) {
                            if (userIdentity.health_focus) {
                                await generateHealthObjectives(userIdentity.health_focus);
                            }
                            await supabase.from('user_preferences').upsert({
                                user_id: user.id,
                                health_personalized: true,
                                updated_at: new Date().toISOString()
                            }, { onConflict: 'user_id' });
                        }
                    }
                }
            } catch (err) {
                console.error('Error initializing personalization:', err);
            }
        };

        initializePersonalization();
    }, [user?.id]);



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
            [{"text": "...", "target_value": "...", "personalized_tip": "...", "icon": "..."}]`;

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

                const objectives = JSON.parse(text.trim());
                await updateHealthObjectives(objectives);
            }
        } catch (e) {
            console.error('Error generating health goals:', e);
        } finally {
            setIsGeneratingHealth(false);
        }
    };

    const handleToggleNonNegotiable = async (id: string) => {
        const wasCompleted = isCompletedToday(id);
        const success = await toggleCompletion(id);

        // Only log if we successfully marked as completed (not unchecking)
        if (success && !wasCompleted) {
            logHabitComplete(nonNegotiables.length + healthObjectives.length);
        }
    };

    const handleToggleHealthObjective = async (id: string) => {
        const wasCompleted = isCompletedToday(id);
        const success = await toggleCompletion(id);

        // Log as a habit completion since health objectives are part of the broader habit system
        if (success && !wasCompleted) {
            logHabitComplete(nonNegotiables.length + healthObjectives.length);
        }
    };

    const handleAddNonNegotiable = async () => {
        if (!newNonNeg.trim()) return;
        await addHabit('non_negotiable', newNonNeg.trim());
        setNewNonNeg('');
        setShowAddNonNeg(false);
    };

    const handleRemoveNonNegotiable = async (id: string) => {
        await deleteHabit(id);
    };

    const completedNonNegs = nonNegotiables.filter(n => isCompletedToday(n.id)).length;
    const completedHealth = healthObjectives.filter(h => isCompletedToday(h.id)).length;

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-secondary rounded"></div>
                            <div className="h-3 w-24 bg-secondary rounded"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 bg-secondary/50 rounded-xl"></div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-secondary rounded"></div>
                            <div className="h-3 w-24 bg-secondary rounded"></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-secondary/50 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                            onKeyPress={e => e.key === 'Enter' && handleAddNonNegotiable()}
                            className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground"
                            autoFocus
                        />
                        <Button onClick={handleAddNonNegotiable} size="sm">Add</Button>
                        <Button onClick={() => setShowAddNonNeg(false)} size="sm" variant="ghost">
                            <X className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}

                <div className="space-y-2">
                    {nonNegotiables.map((item, index) => {
                        const completed = isCompletedToday(item.id);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${completed
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-secondary/30 hover:bg-secondary/50'
                                    }`}
                            >
                                <button
                                    onClick={() => handleToggleNonNegotiable(item.id)}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${completed
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-secondary border border-border hover:border-emerald-500/50'
                                        }`}
                                >
                                    {completed && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                                <span className={`flex-1 text-sm ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {item.text}
                                </span>
                                <button
                                    onClick={() => handleRemoveNonNegotiable(item.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
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
                        const Icon = iconMap[obj.icon || ''] || Heart;
                        const completed = isCompletedToday(obj.id);

                        return (
                            <motion.div
                                key={obj.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`group p-4 rounded-2xl transition-all border ${completed
                                    ? 'bg-blue-500/5 border-blue-500/20'
                                    : 'bg-secondary/30 border-transparent hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${completed ? 'bg-blue-500/20' : 'bg-background border border-border/50'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${completed ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`font-semibold text-sm ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {obj.text}
                                            </h4>
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                {obj.target_value}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                            {obj.personalized_tip}
                                        </p>

                                        <Button
                                            onClick={() => handleToggleHealthObjective(obj.id)}
                                            size="sm"
                                            className={`w-full transition-all ${completed
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20'
                                                : 'bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20'
                                                }`}
                                            variant={completed ? 'outline' : 'default'}
                                        >
                                            {completed ? (
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

                {completedHealth === healthObjectives.length && healthObjectives.length > 0 && (
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
