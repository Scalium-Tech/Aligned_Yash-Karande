import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData, setUserData, removeUserData } from '@/lib/userStorage';
import { sanitizeHabitText, parseAndSanitizeHabitsList, isInputSafe } from '@/lib/inputSanitization';
import {
    MAX_HABITS_FROM_USER_INPUT,
    DUPLICATE_CHECK_PREFIX_LENGTH,
    getDefaultHabitsNeeded,
} from '@/config/habits';

// ============================================
// CROSS-TAB COORDINATION
// ============================================
// Problem: In-memory locks only work within a single tab.
// Solution: Use BroadcastChannel for cross-tab communication + database flag.
//
// How it works:
// 1. Before initializing, check if 'habits_initialized' flag is set in user_preferences
// 2. If already initialized, skip creation entirely
// 3. If not, try to set the flag atomically (first tab wins)
// 4. Use BroadcastChannel to notify other tabs when initialization is complete
// 5. DB unique constraints are the final safety net for any race condition that slips through

// BroadcastChannel for cross-tab coordination (modern browsers)
const HABITS_CHANNEL_NAME = 'aligned_habits_init';
let habitsChannel: BroadcastChannel | null = null;

try {
    habitsChannel = new BroadcastChannel(HABITS_CHANNEL_NAME);
} catch {
    // BroadcastChannel not supported (older browsers, Node.js)
    console.log('[Habits] BroadcastChannel not available, falling back to DB-only locking');
}

// In-memory flag to debounce within a single tab (React StrictMode, rapid remounts)
const tabInitializationAttempts = new Set<string>();

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

// ============================================
// LOCAL CONSTANTS (not in config because they're implementation details)
// ============================================

/** Extended prefix length for database habit existence checks.
 *  We use 20 chars for more reliable duplicate detection against DB records. */
const DB_DUPLICATE_CHECK_PREFIX_LENGTH = 20;

/** Maximum length for habit text before truncation.
 *  Long habits are hard to read in the UI card layout. */
const MAX_HABIT_TEXT_LENGTH = 50;

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

    // Track if this instance has already initiated initialization
    const hasInitiatedRef = useRef(false);

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

            // If habits exist, use them directly
            if (habitsData && habitsData.length > 0) {
                // Check if health objectives exist, if not create defaults
                const hasHealthObjectives = habitsData.some(h => h.type === 'health_objective');
                if (!hasHealthObjectives) {
                    // Use lock to prevent concurrent health objective creation
                    await initializeHabitsWithLock(userId, async () => {
                        // Double-check before creating - another tab might have created them
                        const { data: recheckData } = await supabase
                            .from('daily_habits')
                            .select('id')
                            .eq('user_id', userId)
                            .eq('type', 'health_objective')
                            .limit(1);

                        if (!recheckData || recheckData.length === 0) {
                            console.log('No health objectives found, creating defaults');
                            await createHealthObjectives(userId);
                        }
                    });

                    // Re-fetch to include new health objectives
                    const { data: refreshedHabits } = await supabase
                        .from('daily_habits')
                        .select('*')
                        .eq('user_id', userId)
                        .order('sort_order', { ascending: true });
                    setHabits(refreshedHabits || []);
                } else {
                    setHabits(habitsData);
                }
            } else {
                // No habits exist - need to migrate or create defaults
                // Use lock to prevent concurrent initialization (race condition fix)
                await initializeHabitsWithLock(userId, async () => {
                    // Double-check: another concurrent call might have already created habits
                    const { data: recheckData } = await supabase
                        .from('daily_habits')
                        .select('id')
                        .eq('user_id', userId)
                        .limit(1);

                    if (recheckData && recheckData.length > 0) {
                        console.log('Habits already exist (created by another tab/call), skipping initialization');
                        return;
                    }

                    // Try migration first, then create defaults
                    const migrated = await migrateFromLocalStorage(userId);
                    if (!migrated) {
                        await createDefaultHabits(userId);
                    }
                });

                // Re-fetch after migration/creation
                const { data: newHabits } = await supabase
                    .from('daily_habits')
                    .select('*')
                    .eq('user_id', userId)
                    .order('sort_order', { ascending: true });

                setHabits(newHabits || []);
            }

            setCompletions(completionsData || []);
        } catch (err) {
            console.error('Error fetching habits:', err);
            setError(err instanceof Error ? err.message : 'Failed to load habits');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // ============================================
    // DATABASE-LEVEL INITIALIZATION LOCK
    // ============================================
    // This is the proper multi-tab safe approach:
    // 1. Check if already initialized (database is source of truth)
    // 2. Debounce within same tab using in-memory Set
    // 3. Notify other tabs via BroadcastChannel when done
    // 4. DB unique constraints catch any remaining edge cases

    /**
     * Check if habits have already been initialized for this user.
     * Uses the 'habits_initialized' flag in user_preferences table.
     */
    const checkIfHabitsInitialized = async (uid: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('habits_initialized')
                .eq('user_id', uid)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
                console.warn('[Habits] Error checking initialization status:', error);
                return false;
            }

            return data?.habits_initialized === true;
        } catch {
            return false;
        }
    };

    /**
     * Mark habits as initialized in the database.
     * Uses upsert to handle potential race conditions atomically.
     */
    const markHabitsInitialized = async (uid: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: uid,
                    habits_initialized: true,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('[Habits] Error marking initialized:', error);
                return false;
            }

            // Notify other tabs that initialization is complete
            if (habitsChannel) {
                habitsChannel.postMessage({ type: 'habits_initialized', userId: uid });
            }

            return true;
        } catch {
            return false;
        }
    };

    /**
     * Initialize habits with proper multi-tab locking.
     * 
     * Flow:
     * 1. Local debounce (same tab, rapid remounts)
     * 2. Database flag check (cross-tab, persistent)
     * 3. Execute initialization
     * 4. Mark complete + notify other tabs
     * 5. DB unique constraints as final safety net
     */
    const initializeHabitsWithLock = async (uid: string, initFn: () => Promise<void>): Promise<void> => {
        const lockKey = `habits_init_${uid}`;

        // Step 1: Local debounce (same tab, same session)
        if (tabInitializationAttempts.has(lockKey)) {
            console.log('[Habits] Initialization already attempted in this tab, skipping');
            return;
        }
        tabInitializationAttempts.add(lockKey);

        try {
            // Step 2: Check database flag (cross-tab source of truth)
            const alreadyInitialized = await checkIfHabitsInitialized(uid);
            if (alreadyInitialized) {
                console.log('[Habits] Already initialized (database flag set), skipping');
                return;
            }

            // Step 3: Execute initialization
            await initFn();

            // Step 4: Mark as initialized (first tab to complete wins)
            await markHabitsInitialized(uid);

        } catch (err) {
            // Remove from local set so retry is possible on error
            tabInitializationAttempts.delete(lockKey);
            throw err;
        }
        // Note: We don't remove from tabInitializationAttempts on success
        // This prevents re-initialization within the same tab session
    };


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

    // Create default habits for new users (personalized from their onboarding)
    // TOCTOU fix: Query database first, then build insert array based on actual DB state
    const createDefaultHabits = async (uid: string): Promise<void> => {
        // First, check what already exists in the database (prevents TOCTOU race condition)
        const { data: existingHabits } = await supabase
            .from('daily_habits')
            .select('text, type')
            .eq('user_id', uid);

        const existingTexts = new Set(
            (existingHabits || []).map(h => h.text.toLowerCase().substring(0, DB_DUPLICATE_CHECK_PREFIX_LENGTH))
        );
        const existingNonNegCount = (existingHabits || []).filter(h => h.type === 'non_negotiable').length;
        const existingHealthCount = (existingHabits || []).filter(h => h.type === 'health_objective').length;

        // Helper to check if a habit already exists (case-insensitive prefix match)
        const habitExists = (text: string): boolean => {
            const prefix = text.toLowerCase().substring(0, DB_DUPLICATE_CHECK_PREFIX_LENGTH);
            return existingTexts.has(prefix) ||
                Array.from(existingTexts).some(existing =>
                    existing.includes(prefix.substring(0, DUPLICATE_CHECK_PREFIX_LENGTH)) || prefix.includes(existing.substring(0, DUPLICATE_CHECK_PREFIX_LENGTH))
                );
        };

        const habitsToInsert: Array<Omit<DailyHabit, 'id' | 'created_at' | 'updated_at' | 'completed'>> = [];

        // Try to fetch user's identity for personalization
        let userIdentity: {
            habits_focus?: string;
            health_focus?: string;
            self_care_practice?: string;
            body_care?: string;
            sleep_definition?: string;
        } | null = null;

        try {
            const { data, error } = await supabase
                .from('user_identity')
                .select('habits_focus, health_focus, self_care_practice, body_care, sleep_definition')
                .eq('id', uid)
                .single();

            if (!error && data) {
                userIdentity = data;
            }
        } catch (err) {
            console.log('Could not fetch user identity for personalization, using defaults');
        }

        let orderIndex = existingNonNegCount; // Start after existing habits

        // 1. Add foundation habits from Step 5 if they exist
        const foundationHabits = [
            { text: userIdentity?.sleep_definition, prefix: 'Sleep: ' },
            { text: userIdentity?.body_care, prefix: 'Body Care: ' },
            { text: userIdentity?.self_care_practice, prefix: 'Self-Care: ' }
        ];

        foundationHabits.forEach(h => {
            if (h.text && h.text.trim().length > 0) {
                // Sanitize user input before using it
                const sanitizedText = sanitizeHabitText(h.text);
                if (!sanitizedText || !isInputSafe(sanitizedText)) return;

                const habitText = sanitizedText.length > MAX_HABIT_TEXT_LENGTH
                    ? h.prefix + sanitizedText.substring(0, MAX_HABIT_TEXT_LENGTH - 3) + '...'
                    : h.prefix + sanitizedText;

                // Check against BOTH local array AND existing DB habits
                if (!habitExists(habitText) && !habitsToInsert.some(ins => ins.text === habitText)) {
                    habitsToInsert.push({
                        user_id: uid,
                        type: 'non_negotiable',
                        text: habitText,
                        sort_order: orderIndex++,
                    });
                }
            }
        });

        // 2. Add habits from habits_focus (Step 6)
        // Use secure parsing that sanitizes, validates length, and escapes HTML
        if (userIdentity?.habits_focus && isInputSafe(userIdentity.habits_focus)) {
            const parsedHabits = parseAndSanitizeHabitsList(userIdentity.habits_focus)
                .slice(0, MAX_HABITS_FROM_USER_INPUT);

            parsedHabits.forEach((habit) => {
                if (!habitExists(habit) && !habitsToInsert.some(ins => ins.text === habit)) {
                    habitsToInsert.push({
                        user_id: uid,
                        type: 'non_negotiable',
                        text: habit,
                        sort_order: orderIndex++,
                    });
                }
            });
        }

        // 3. Add default habits if user has fewer than the target count
        // Uses the simplified getDefaultHabitsNeeded() helper from config
        const totalNonNegotiables = existingNonNegCount + habitsToInsert.filter(h => h.type === 'non_negotiable').length;
        const needed = getDefaultHabitsNeeded(totalNonNegotiables);

        if (needed > 0) {
            defaultNonNegotiables.slice(0, needed).forEach((habit) => {
                // Check against BOTH database AND local insert array
                if (!habitExists(habit.text) && !habitsToInsert.some(ins => ins.text === habit.text)) {
                    habitsToInsert.push({
                        user_id: uid,
                        type: 'non_negotiable',
                        text: habit.text,
                        sort_order: orderIndex++,
                    });
                }
            });
        }

        // 4. Add default health objectives only if none exist
        if (existingHealthCount === 0) {
            defaultHealthObjectives.forEach((obj) => {
                if (!habitExists(obj.text)) {
                    habitsToInsert.push({
                        user_id: uid,
                        type: 'health_objective',
                        text: obj.text,
                        icon: obj.icon,
                        target_value: obj.target_value,
                        personalized_tip: obj.personalized_tip,
                        sort_order: obj.sort_order,
                    });
                }
            });
        }

        // Only insert if there's something to insert
        if (habitsToInsert.length === 0) {
            console.log('No new habits to insert for user', uid);
            return;
        }

        try {
            const { error } = await supabase.from('daily_habits').insert(habitsToInsert);
            if (error) {
                // Handle potential race condition at DB level - duplicates are non-fatal
                if (error.code === '23505') { // Unique violation
                    console.warn('Some habits already exist (race condition handled):', error.message);
                } else {
                    throw error;
                }
            }
            console.log(`Created ${habitsToInsert.length} habits for user ${uid}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create habits';
            console.error('Error creating default habits:', err);
            setError(`Failed to initialize your habits: ${errorMessage}. Please refresh the page.`);
        }
    };

    // Create health objectives for users who don't have them
    const createHealthObjectives = async (uid: string): Promise<void> => {
        // First check if health objectives already exist (TOCTOU fix)
        const { data: existing } = await supabase
            .from('daily_habits')
            .select('id')
            .eq('user_id', uid)
            .eq('type', 'health_objective')
            .limit(1);

        if (existing && existing.length > 0) {
            console.log('Health objectives already exist, skipping creation');
            return;
        }

        const healthToInsert = defaultHealthObjectives.map((obj) => ({
            user_id: uid,
            type: 'health_objective' as const,
            text: obj.text,
            icon: obj.icon,
            target_value: obj.target_value,
            personalized_tip: obj.personalized_tip,
            sort_order: obj.sort_order,
        }));

        try {
            const { error } = await supabase.from('daily_habits').insert(healthToInsert);
            if (error) {
                // Handle race condition - duplicates are non-fatal
                if (error.code === '23505') {
                    console.warn('Health objectives already exist (race condition handled)');
                    return;
                }
                throw error;
            }
            console.log('Created default health objectives for user');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create health objectives';
            console.error('Error creating health objectives:', err);
            // Set error state so UI can inform the user
            setError(`Failed to set up your health objectives: ${errorMessage}. Please refresh the page.`);
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
