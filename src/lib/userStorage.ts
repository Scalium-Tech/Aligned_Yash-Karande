/**
 * User-scoped storage utilities
 * Provides functions to store and retrieve data specific to each user
 */

/**
 * Creates a user-specific storage key by appending user ID
 */
export function getUserStorageKey(baseKey: string, userId: string | undefined): string {
    if (!userId) return baseKey;
    return `${baseKey}_${userId}`;
}

/**
 * Loads user-specific data from localStorage
 */
export function getUserData<T>(baseKey: string, userId: string | undefined, defaultValue: T): T {
    const key = getUserStorageKey(baseKey, userId);
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
        return JSON.parse(stored) as T;
    } catch {
        return defaultValue;
    }
}

/**
 * Saves user-specific data to localStorage
 */
export function setUserData<T>(baseKey: string, userId: string | undefined, data: T): void {
    const key = getUserStorageKey(baseKey, userId);
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Removes user-specific data from localStorage
 */
export function removeUserData(baseKey: string, userId: string | undefined): void {
    const key = getUserStorageKey(baseKey, userId);
    localStorage.removeItem(key);
}
