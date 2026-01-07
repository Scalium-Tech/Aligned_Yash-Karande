/**
 * Habits Configuration
 * 
 * This file centralizes all configuration for the habits feature.
 * Separating config from logic makes it easier to:
 * 1. Understand the business rules at a glance
 * 2. Modify values without touching business logic
 * 3. A/B test different configurations
 * 4. Override per-user segment in the future
 */

// ============================================
// HABIT CREATION LIMITS
// ============================================

/**
 * Maximum number of habits to parse from the user's freeform text input.
 * 
 * WHY THIS VALUE:
 * - Research shows 3-5 habits is optimal for habit formation
 * - More than 5 overwhelms new users and reduces adherence
 * - Less than 3 may not give users enough variety
 * 
 * HOW IT'S USED:
 * - When parsing the `habits_focus` onboarding text field
 * - We split by delimiters and take at most this many
 */
export const MAX_HABITS_FROM_USER_INPUT = 5;

/**
 * Target number of non-negotiable habits for new users.
 * 
 * WHY THIS VALUE:
 * - 4 habits provides a good balance of variety without overwhelm
 * - Aligns with "habit stacking" research (2-4 habits is optimal)
 * - Easy to complete daily, encouraging early wins
 * 
 * HOW IT'S USED:
 * - If a user has fewer habits after onboarding, we add defaults
 * - We DON'T add defaults if the user already has this many
 * - This is a "fill up to" threshold, not a hard requirement
 */
export const TARGET_HABIT_COUNT = 4;

/**
 * Default number of health objectives to create for new users.
 * 
 * Health objectives are separate from habits - they're trackable metrics
 * like water intake, sleep hours, etc.
 */
export const DEFAULT_HEALTH_OBJECTIVES_COUNT = 3;

// ============================================
// DUPLICATE DETECTION
// ============================================

/**
 * Number of characters to compare when detecting duplicate habits.
 * 
 * WHY THIS VALUE:
 * - 10 chars catches obvious duplicates: "Drink water" vs "Drink more water"
 * - Short enough to not miss variations
 * - Long enough to avoid false positives: "Drink water" vs "Drive to work"
 * 
 * EXAMPLES:
 * - "Drink water" (10 chars: "Drink wate") matches "Drink more water"
 * - "Exercise" (8 chars) would NOT match with 10-char check, so we use full length
 */
export const DUPLICATE_CHECK_PREFIX_LENGTH = 10;

// ============================================
// USER SEGMENT OVERRIDES
// ============================================

/**
 * Configuration overrides for different user segments.
 * 
 * This enables A/B testing and personalization:
 * - Pro users might get more habits
 * - New users might start with fewer
 * - Power users could have higher limits
 * 
 * FUTURE: Load this from Supabase or feature flags
 */
export interface HabitsConfigOverrides {
    maxHabitsFromInput?: number;
    targetHabitCount?: number;
    duplicateCheckPrefixLength?: number;
}

/**
 * Get the effective configuration, merging defaults with any overrides.
 * 
 * @param overrides - Optional per-user or per-segment overrides
 * @returns The final configuration to use
 */
export function getHabitsConfig(overrides?: HabitsConfigOverrides) {
    return {
        maxHabitsFromInput: overrides?.maxHabitsFromInput ?? MAX_HABITS_FROM_USER_INPUT,
        targetHabitCount: overrides?.targetHabitCount ?? TARGET_HABIT_COUNT,
        duplicateCheckPrefixLength: overrides?.duplicateCheckPrefixLength ?? DUPLICATE_CHECK_PREFIX_LENGTH,
    };
}

/**
 * Determine if we should add default habits for a user.
 * 
 * NEW SIMPLIFIED LOGIC:
 * If the user has fewer habits than the target, add defaults to reach target.
 * No confusing MIN/TARGET split anymore.
 * 
 * @param currentHabitCount - How many habits the user currently has
 * @param config - Configuration (allows overrides)
 * @returns Number of default habits to add (0 if none needed)
 */
export function getDefaultHabitsNeeded(
    currentHabitCount: number,
    config = getHabitsConfig()
): number {
    if (currentHabitCount >= config.targetHabitCount) {
        return 0;
    }
    return config.targetHabitCount - currentHabitCount;
}
