/**
 * Data Migration Utility
 * Migrates existing localStorage data from old non-user-specific keys
 * to new user-specific keys when a user logs in.
 * This ensures existing users don't lose their data after the per-user storage update.
 */

import { getUserStorageKey } from './userStorage';

// List of all storage keys that need migration
const STORAGE_KEYS_TO_MIGRATE = [
    'aligned_analytics',
    'aligned_mood',
    'aligned_goals',
    'aligned_journal',
    'aligned_focus_data',
    'aligned_notifications',
    'aligned_custom_weekly_plan',
    'aligned_quarterly_completions',
    'aligned_focus_tasks',
    'aligned_daily_habits',
    'aligned_health_objectives',
    'aligned_habits_personalized',
    'aligned_health_personalized_user',
];

// Key to track if migration has been done for this user
const MIGRATION_DONE_KEY = 'aligned_data_migrated';

/**
 * Check if data migration has already been done for this user
 */
export function hasMigrationBeenDone(userId: string): boolean {
    try {
        const migrationKey = getUserStorageKey(MIGRATION_DONE_KEY, userId);
        return localStorage.getItem(migrationKey) === 'true';
    } catch {
        return false;
    }
}

/**
 * Mark migration as complete for this user
 */
function markMigrationComplete(userId: string): void {
    const migrationKey = getUserStorageKey(MIGRATION_DONE_KEY, userId);
    localStorage.setItem(migrationKey, 'true');
}

/**
 * Migrate a single storage key from old format to user-specific format
 */
function migrateKey(oldKey: string, userId: string): boolean {
    try {
        const oldData = localStorage.getItem(oldKey);
        if (!oldData) {
            return false; // No data to migrate
        }

        const newKey = getUserStorageKey(oldKey, userId);
        const existingNewData = localStorage.getItem(newKey);

        // Only migrate if new key doesn't already have data
        if (!existingNewData) {
            localStorage.setItem(newKey, oldData);
            console.log(`Migrated data from ${oldKey} to ${newKey}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Error migrating key ${oldKey}:`, error);
        return false;
    }
}

/**
 * Run full data migration for a user
 * This should be called when a user logs in
 */
export function migrateUserData(userId: string): { migrated: number; total: number } {
    if (!userId) {
        return { migrated: 0, total: 0 };
    }

    // Check if migration already done
    if (hasMigrationBeenDone(userId)) {
        console.log('Data migration already completed for this user');
        return { migrated: 0, total: STORAGE_KEYS_TO_MIGRATE.length };
    }

    console.log('Starting data migration for user:', userId);
    let migratedCount = 0;

    for (const key of STORAGE_KEYS_TO_MIGRATE) {
        if (migrateKey(key, userId)) {
            migratedCount++;
        }
    }

    // Mark migration as complete
    markMigrationComplete(userId);

    console.log(`Data migration complete: ${migratedCount} keys migrated`);
    return { migrated: migratedCount, total: STORAGE_KEYS_TO_MIGRATE.length };
}

/**
 * Force re-run migration (useful for debugging)
 */
export function forceRemigrate(userId: string): { migrated: number; total: number } {
    if (!userId) {
        return { migrated: 0, total: 0 };
    }

    // Clear migration flag
    const migrationKey = getUserStorageKey(MIGRATION_DONE_KEY, userId);
    localStorage.removeItem(migrationKey);

    // Run migration
    return migrateUserData(userId);
}
