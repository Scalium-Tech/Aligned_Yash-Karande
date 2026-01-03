import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData, setUserData, removeUserData } from '@/lib/userStorage';

// Types matching the Supabase schema
export interface DailyHabit {
    id: string;
    user_id: string;
    type: 'non_negotiable' | 'health_objective';
    text: string;
    icon?: string;
    target_value?: string;
    personalized_tip?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    // Local state for UI
    completed?: boolean;
}

export interface HabitCompletion {
    id: string;
    habit_id: string;
    user_id: string;
    completed_date: string;
    completed_at: string;
}

// Legacy localStorage keys for migration
const LEGACY_HABITS_KEY = 'aligned_daily_habits';
const LEGACY_HEALTH_KEY = 'aligned_health_objectives';
const MIGRATION_DONE_KEY = 'aligned_habits_migrated_to_supabase';

// Default habits for new users
const defaultNonNegotiables = [
    { text: 'Morning meditation or reflection', sort_order: 0 },
    { text: 'Move your body (any exercise)', sort_order: 1 },
    { text: 'Learn something new', sort_order: 2 },
    { text: 'Connect with someone', sort_order: 3 },
];

const defaultHealthObjectives = [
    { text: 'Daily Hydration Goal', icon: 'droplets', target_value: '8 glasses', personalized_tip: 'Staying hydrated keeps your brain sharp for deep work sessions.', sort_order: 0 },
    { text: 'Quality Sleep Target', icon: 'moon', target_value: '7.5 hours', personalized_tip: 'Consistent sleep is the foundation of peak cognitive performance.', sort_order: 1 },
    { text: 'Mindful Movement', icon: 'footprints', target_value: '10,000 steps', personalized_tip: 'Movement breaks help prevent mental fatigue and physical friction.', sort_order: 2 },
];

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

export function useDailyHabits(userId?: string) {
    const [habits, setHabits] = useState<DailyHabit[]>([]);
    const [completions, setCompletions] = useState<HabitCompletion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch habits and today's completions from Supabase
    const fetchHabits = useCallback(async () => {
        if (!userId) {
            setHabits([]);
            setCompletions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch habits
            const { data: habitsData, error: habitsError } = await supabase
                .from('daily_habits')
                .select('*')
                .eq('user_id', userId)
                .order('sort_order', { ascending: true });

            if (habitsError) throw habitsError;

            // Fetch today's completions
            const today = getTodayDate();
            const { data: completionsData, error: completionsError } = await supabase
                .from('habit_completions')
                .select('*')
                .eq('user_id', userId)
                .eq('completed_date', today);

            if (completionsError) throw completionsError;

            // If no habits exist, check for migration or create defaults
            if (!habitsData || habitsData.length === 0) {
                const migrated = await migrateFromLocalStorage(userId);
                if (!migrated) {
                    await createDefaultHabits(userId);
                }
                // Re-fetch after migration/creation
                const { data: newHabits } = await supabase
                    .from('daily_habits')
                    .select('*')
                    .eq('user_id', userId)
                    .order('sort_order', { ascending: true });

                setHabits(newHabits || []);
            } else {
                setHabits(habitsData);
            }

            setCompletions(completionsData || []);
        } catch (err) {
            console.error('Error fetching habits:', err);
            setError(err instanceof Error ? err.message : 'Failed to load habits');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Migrate data from localStorage to Supabase (one-time operation)
    const migrateFromLocalStorage = async (uid: string): Promise<boolean> => {
        const migrationKey = `${MIGRATION_DONE_KEY}_${uid}`;
        if (localStorage.getItem(migrationKey)) return false;

        try {
            const legacyHabits = getUserData<{ nonNegotiables?: Array<{ id: string; text: string }> }>(
                LEGACY_HABITS_KEY, uid, { nonNegotiables: [] }
            );
            const legacyHealth = getUserData<{ objectives?: Array<{ id: string; text: string; icon?: string; targetValue?: string; personalizedTip?: string }> }>(
                LEGACY_HEALTH_KEY, uid, { objectives: [] }
            );

            const habitsToInsert: Array<Omit<DailyHabit, 'id' | 'created_at' | 'updated_at' | 'completed'>> = [];

            // Migrate non-negotiables
            if (legacyHabits.nonNegotiables && legacyHabits.nonNegotiables.length > 0) {
                legacyHabits.nonNegotiables.forEach((habit, index) => {
                    habitsToInsert.push({
                        user_id: uid,
                        type: 'non_negotiable',
                        text: habit.text,
                        sort_order: index,
                    });
                });
            }

            // Migrate health objectives
            if (legacyHealth.objectives && legacyHealth.objectives.length > 0) {
                legacyHealth.objectives.forEach((obj, index) => {
                    habitsToInsert.push({
                        user_id: uid,
                        type: 'health_objective',
                        text: obj.text,
                        icon: obj.icon,
                        target_value: obj.targetValue,
                        personalized_tip: obj.personalizedTip,
                        sort_order: index,
                    });
                });
            }

            if (habitsToInsert.length > 0) {
                const { error } = await supabase.from('daily_habits').insert(habitsToInsert);
                if (error) throw error;

                // Mark migration as complete and clean up localStorage
                localStorage.setItem(migrationKey, 'true');
                removeUserData(LEGACY_HABITS_KEY, uid);
                removeUserData(LEGACY_HEALTH_KEY, uid);
                console.log('Successfully migrated habits from localStorage to Supabase');
                return true;
            }
        } catch (err) {
            console.error('Error migrating from localStorage:', err);
        }
        return false;
    };

    // Create default habits for new users
    const createDefaultHabits = async (uid: string): Promise<void> => {
        const habitsToInsert: Array<Omit<DailyHabit, 'id' | 'created_at' | 'updated_at' | 'completed'>> = [];

        defaultNonNegotiables.forEach((habit) => {
            habitsToInsert.push({
                user_id: uid,
                type: 'non_negotiable',
                text: habit.text,
                sort_order: habit.sort_order,
            });
        });

        defaultHealthObjectives.forEach((obj) => {
            habitsToInsert.push({
                user_id: uid,
                type: 'health_objective',
                text: obj.text,
                icon: obj.icon,
                target_value: obj.target_value,
                personalized_tip: obj.personalized_tip,
                sort_order: obj.sort_order,
            });
        });

        try {
            const { error } = await supabase.from('daily_habits').insert(habitsToInsert);
            if (error) throw error;
            console.log('Created default habits for new user');
        } catch (err) {
            console.error('Error creating default habits:', err);
        }
    };

    // Add a new habit
    const addHabit = useCallback(async (
        type: 'non_negotiable' | 'health_objective',
        text: string,
        options?: { icon?: string; target_value?: string; personalized_tip?: string }
    ): Promise<DailyHabit | null> => {
        if (!userId) return null;

        // Get next sort order
        const sameTypeHabits = habits.filter(h => h.type === type);
        const maxSortOrder = sameTypeHabits.length > 0
            ? Math.max(...sameTypeHabits.map(h => h.sort_order))
            : -1;

        const newHabit = {
            user_id: userId,
            type,
            text,
            icon: options?.icon,
            target_value: options?.target_value,
            personalized_tip: options?.personalized_tip,
            sort_order: maxSortOrder + 1,
        };

        try {
            const { data, error } = await supabase
                .from('daily_habits')
                .insert(newHabit)
                .select()
                .single();

            if (error) throw error;

            setHabits(prev => [...prev, data]);
            return data;
        } catch (err) {
            console.error('Error adding habit:', err);
            setError(err instanceof Error ? err.message : 'Failed to add habit');
            return null;
        }
    }, [userId, habits]);

    // Update an existing habit
    const updateHabit = useCallback(async (
        habitId: string,
        updates: Partial<Pick<DailyHabit, 'text' | 'icon' | 'target_value' | 'personalized_tip' | 'sort_order'>>
    ): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('daily_habits')
                .update(updates)
                .eq('id', habitId);

            if (error) throw error;

            setHabits(prev => prev.map(h =>
                h.id === habitId ? { ...h, ...updates } : h
            ));
            return true;
        } catch (err) {
            console.error('Error updating habit:', err);
            setError(err instanceof Error ? err.message : 'Failed to update habit');
            return false;
        }
    }, []);

    // Delete a habit
    const deleteHabit = useCallback(async (habitId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('daily_habits')
                .delete()
                .eq('id', habitId);

            if (error) throw error;

            setHabits(prev => prev.filter(h => h.id !== habitId));
            return true;
        } catch (err) {
            console.error('Error deleting habit:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete habit');
            return false;
        }
    }, []);

    // Toggle completion for a habit (for today)
    const toggleCompletion = useCallback(async (habitId: string): Promise<boolean> => {
        if (!userId) return false;

        const today = getTodayDate();
        const existingCompletion = completions.find(
            c => c.habit_id === habitId && c.completed_date === today
        );

        try {
            if (existingCompletion) {
                // Remove completion
                const { error } = await supabase
                    .from('habit_completions')
                    .delete()
                    .eq('id', existingCompletion.id);

                if (error) throw error;

                setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
            } else {
                // Add completion
                const { data, error } = await supabase
                    .from('habit_completions')
                    .insert({
                        habit_id: habitId,
                        user_id: userId,
                        completed_date: today,
                    })
                    .select()
                    .single();

                if (error) throw error;

                setCompletions(prev => [...prev, data]);
            }
            return true;
        } catch (err) {
            console.error('Error toggling completion:', err);
            setError(err instanceof Error ? err.message : 'Failed to update completion');
            return false;
        }
    }, [userId, completions]);

    // Check if a habit is completed today
    const isCompletedToday = useCallback((habitId: string): boolean => {
        const today = getTodayDate();
        return completions.some(c => c.habit_id === habitId && c.completed_date === today);
    }, [completions]);

    // Update multiple health objectives (for AI generation)
    const updateHealthObjectives = useCallback(async (
        objectives: Array<{
            text: string;
            icon?: string;
            target_value?: string;
            personalized_tip?: string;
        }>
    ): Promise<boolean> => {
        if (!userId) return false;

        try {
            // Delete existing health objectives
            const { error: deleteError } = await supabase
                .from('daily_habits')
                .delete()
                .eq('user_id', userId)
                .eq('type', 'health_objective');

            if (deleteError) throw deleteError;

            // Insert new ones
            const newObjectives = objectives.map((obj, index) => ({
                user_id: userId,
                type: 'health_objective' as const,
                text: obj.text,
                icon: obj.icon,
                target_value: obj.target_value,
                personalized_tip: obj.personalized_tip,
                sort_order: index,
            }));

            const { data, error: insertError } = await supabase
                .from('daily_habits')
                .insert(newObjectives)
                .select();

            if (insertError) throw insertError;

            // Update local state
            setHabits(prev => [
                ...prev.filter(h => h.type !== 'health_objective'),
                ...(data || [])
            ]);
            return true;
        } catch (err) {
            console.error('Error updating health objectives:', err);
            setError(err instanceof Error ? err.message : 'Failed to update health objectives');
            return false;
        }
    }, [userId]);

    // Load data when userId changes
    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    // Derived data
    const nonNegotiables = habits.filter(h => h.type === 'non_negotiable');
    const healthObjectives = habits.filter(h => h.type === 'health_objective');

    return {
        // Data
        habits,
        nonNegotiables,
        healthObjectives,
        completions,
        isLoading,
        error,
        // Actions
        addHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        isCompletedToday,
        updateHealthObjectives,
        refetch: fetchHabits,
    };
}
