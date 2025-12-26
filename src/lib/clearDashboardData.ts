/**
 * Clear all dashboard-related data from localStorage
 * This should be called when a new user signs up to ensure they start fresh
 */
export function clearDashboardData(): void {
    const keysToRemove = [
        'aligned_analytics',
        'aligned_mood_energy',
        'aligned_focus_sessions',
        'aligned_focus_tasks',
        'aligned_journal',
        'aligned_goals',
        'aligned_habits',
        'aligned_non_negotiables',
        'aligned_health_tracking',
        'aligned_onboarding',
        'aligned_daily_habits',
        'aligned_health_inputs',
        'aligned_habits_personalized',
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });

    // Dispatch event to notify components to reload fresh data
    window.dispatchEvent(new CustomEvent('dashboard-data-cleared'));
}

/**
 * Clear only the user-specific keys (preserve settings/preferences)
 * Use when switching between user accounts
 */
export function clearUserSessionData(): void {
    clearDashboardData();
}
