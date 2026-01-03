import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData, removeUserData } from '@/lib/userStorage';

// Database types
export interface Challenge {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string;
    total_days: number;
    is_active: boolean;
    completed_at: string | null;
    created_at: string;
    // Computed from check-ins
    daysCompleted?: number;
    checkIns?: string[];
}

export interface ChallengeCheckIn {
    id: string;
    challenge_id: string;
    user_id: string;
    check_in_date: string;
    created_at: string;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    earned_at: string;
}

// Frontend badge definitions (static)
export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: {
        type: 'streak' | 'focus' | 'tasks' | 'journal' | 'challenge';
        value: number;
    };
}

export interface Badge extends BadgeDefinition {
    earnedAt?: string;
}

// Legacy localStorage key for migration
const LEGACY_GOALS_KEY = 'aligned_goals';
const MIGRATION_DONE_KEY = 'aligned_goals_migrated_to_supabase';

// Default badge definitions
const defaultBadges: BadgeDefinition[] = [
    { id: 'first-step', name: 'First Step', description: 'Complete your first task', icon: '🎯', requirement: { type: 'tasks', value: 1 } },
    { id: 'week-warrior', name: 'Week Warrior', description: '7 day streak', icon: '🔥', requirement: { type: 'streak', value: 7 } },
    { id: 'focus-master', name: 'Focus Master', description: '100 minutes of focus time', icon: '⏱️', requirement: { type: 'focus', value: 100 } },
    { id: 'journaler', name: 'Journaler', description: 'Write 7 journal entries', icon: '📝', requirement: { type: 'journal', value: 7 } },
    { id: 'challenger', name: 'Challenger', description: 'Start a 90-day challenge', icon: '💪', requirement: { type: 'challenge', value: 1 } },
    { id: 'streak-legend', name: 'Streak Legend', description: '30 day streak', icon: '🏆', requirement: { type: 'streak', value: 30 } },
    { id: 'focus-hero', name: 'Focus Hero', description: '500 minutes of focus', icon: '🦸', requirement: { type: 'focus', value: 500 } },
    { id: 'consistency-king', name: 'Consistency King', description: 'Complete a 90-day challenge', icon: '👑', requirement: { type: 'challenge', value: 90 } },
];

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

export function useGoalsSupabase(userId?: string) {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [checkIns, setCheckIns] = useState<ChallengeCheckIn[]>([]);
    const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');

    // Fetch all data from Supabase
    const fetchData = useCallback(async () => {
        if (!userId) {
            setChallenges([]);
            setCheckIns([]);
            setEarnedBadgeIds(new Set());
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch challenges
            const { data: challengesData, error: challengesError } = await supabase
                .from('challenges')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (challengesError) throw challengesError;

            // Fetch all check-ins for user's challenges
            const { data: checkInsData, error: checkInsError } = await supabase
                .from('challenge_check_ins')
                .select('*')
                .eq('user_id', userId);

            if (checkInsError) throw checkInsError;

            // Fetch earned badges
            const { data: badgesData, error: badgesError } = await supabase
                .from('user_badges')
                .select('*')
                .eq('user_id', userId);

            if (badgesError) throw badgesError;

            // If no challenges exist, attempt migration
            if (!challengesData || challengesData.length === 0) {
                await migrateFromLocalStorage(userId);
                // Re-fetch after migration
                const { data: newChallenges } = await supabase
                    .from('challenges')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                const { data: newCheckIns } = await supabase
                    .from('challenge_check_ins')
                    .select('*')
                    .eq('user_id', userId);

                const { data: newBadges } = await supabase
                    .from('user_badges')
                    .select('*')
                    .eq('user_id', userId);

                setChallenges(newChallenges || []);
                setCheckIns(newCheckIns || []);
                setEarnedBadgeIds(new Set((newBadges || []).map(b => b.badge_id)));
            } else {
                setChallenges(challengesData);
                setCheckIns(checkInsData || []);
                setEarnedBadgeIds(new Set((badgesData || []).map(b => b.badge_id)));
            }
        } catch (err) {
            console.error('Error fetching goals data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load goals');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Migrate from localStorage
    const migrateFromLocalStorage = async (uid: string): Promise<boolean> => {
        const migrationKey = `${MIGRATION_DONE_KEY}_${uid}`;
        if (localStorage.getItem(migrationKey)) return false;

        try {
            interface LegacyChallenge {
                id: string;
                title: string;
                description: string;
                startDate: string;
                endDate: string;
                totalDays: number;
                checkIns: string[];
                isActive: boolean;
                completedAt?: string;
            }
            interface LegacyBadge {
                id: string;
                earnedAt?: string;
            }
            interface LegacyData {
                challenges?: LegacyChallenge[];
                badges?: LegacyBadge[];
            }

            const legacyData = getUserData<LegacyData>(LEGACY_GOALS_KEY, uid, { challenges: [], badges: [] });

            // Migrate challenges
            if (legacyData.challenges && legacyData.challenges.length > 0) {
                for (const challenge of legacyData.challenges) {
                    // Insert challenge
                    const { data: newChallenge, error: challengeError } = await supabase
                        .from('challenges')
                        .insert({
                            user_id: uid,
                            title: challenge.title,
                            description: challenge.description,
                            start_date: challenge.startDate,
                            end_date: challenge.endDate,
                            total_days: challenge.totalDays,
                            is_active: challenge.isActive,
                            completed_at: challenge.completedAt || null,
                        })
                        .select()
                        .single();

                    if (challengeError) {
                        console.error('Error migrating challenge:', challengeError);
                        continue;
                    }

                    // Insert check-ins for this challenge
                    if (challenge.checkIns && challenge.checkIns.length > 0 && newChallenge) {
                        const checkInsToInsert = challenge.checkIns.map(date => ({
                            challenge_id: newChallenge.id,
                            user_id: uid,
                            check_in_date: date,
                        }));

                        await supabase.from('challenge_check_ins').insert(checkInsToInsert);
                    }
                }
            }

            // Migrate earned badges
            if (legacyData.badges) {
                const earnedBadges = legacyData.badges.filter(b => b.earnedAt);
                if (earnedBadges.length > 0) {
                    const badgesToInsert = earnedBadges.map(b => ({
                        user_id: uid,
                        badge_id: b.id,
                        earned_at: b.earnedAt,
                    }));

                    await supabase.from('user_badges').insert(badgesToInsert);
                }
            }

            // Mark migration complete and clean up
            localStorage.setItem(migrationKey, 'true');
            removeUserData(LEGACY_GOALS_KEY, uid);
            console.log('Successfully migrated goals from localStorage to Supabase');
            return true;
        } catch (err) {
            console.error('Error migrating goals:', err);
        }
        return false;
    };

    // Create a new challenge
    const createChallenge = useCallback(async (
        title: string,
        description: string,
        days: number = 90
    ): Promise<Challenge | null> => {
        if (!userId) return null;

        const startDate = getTodayKey();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        try {
            const { data, error } = await supabase
                .from('challenges')
                .insert({
                    user_id: userId,
                    title,
                    description,
                    start_date: startDate,
                    end_date: endDate.toISOString().split('T')[0],
                    total_days: days,
                    is_active: true,
                })
                .select()
                .single();

            if (error) throw error;

            setChallenges(prev => [data, ...prev]);

            // Check for challenger badge (started a challenge)
            await earnBadge('challenger');

            return data;
        } catch (err) {
            console.error('Error creating challenge:', err);
            setError(err instanceof Error ? err.message : 'Failed to create challenge');
            return null;
        }
    }, [userId]);

    // Check-in to a challenge
    const checkInChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
        if (!userId) return false;

        const todayKey = getTodayKey();
        const existingCheckIn = checkIns.find(
            c => c.challenge_id === challengeId && c.check_in_date === todayKey
        );

        if (existingCheckIn) return false; // Already checked in today

        try {
            const { data, error } = await supabase
                .from('challenge_check_ins')
                .insert({
                    challenge_id: challengeId,
                    user_id: userId,
                    check_in_date: todayKey,
                })
                .select()
                .single();

            if (error) throw error;

            setCheckIns(prev => [...prev, data]);

            // Check if challenge is complete
            const challenge = challenges.find(c => c.id === challengeId);
            if (challenge) {
                const totalCheckIns = checkIns.filter(c => c.challenge_id === challengeId).length + 1;

                if (totalCheckIns >= challenge.total_days) {
                    // Mark challenge as complete
                    await supabase
                        .from('challenges')
                        .update({ is_active: false, completed_at: new Date().toISOString() })
                        .eq('id', challengeId);

                    setChallenges(prev => prev.map(c =>
                        c.id === challengeId
                            ? { ...c, is_active: false, completed_at: new Date().toISOString() }
                            : c
                    ));

                    // Award consistency-king badge for completing 90-day challenge
                    if (challenge.total_days >= 90) {
                        await earnBadge('consistency-king');
                    }

                    setCelebrationMessage(`🎉 Congratulations! You completed "${challenge.title}"!`);
                    setShowCelebration(true);
                }
            }

            return true;
        } catch (err) {
            console.error('Error checking in:', err);
            setError(err instanceof Error ? err.message : 'Failed to check in');
            return false;
        }
    }, [userId, checkIns, challenges]);

    // Delete a challenge
    const deleteChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('challenges')
                .delete()
                .eq('id', challengeId);

            if (error) throw error;

            setChallenges(prev => prev.filter(c => c.id !== challengeId));
            setCheckIns(prev => prev.filter(c => c.challenge_id !== challengeId));
            return true;
        } catch (err) {
            console.error('Error deleting challenge:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete challenge');
            return false;
        }
    }, []);

    // Earn a badge
    const earnBadge = useCallback(async (badgeId: string): Promise<boolean> => {
        if (!userId || earnedBadgeIds.has(badgeId)) return false;

        try {
            const { error } = await supabase
                .from('user_badges')
                .insert({
                    user_id: userId,
                    badge_id: badgeId,
                    earned_at: new Date().toISOString(),
                });

            if (error) {
                // Unique constraint violation means already earned
                if (error.code === '23505') return false;
                throw error;
            }

            setEarnedBadgeIds(prev => new Set([...prev, badgeId]));
            return true;
        } catch (err) {
            console.error('Error earning badge:', err);
            return false;
        }
    }, [userId, earnedBadgeIds]);

    // Check and award badges based on stats
    const checkAllBadges = useCallback(async (stats: {
        streak: number;
        focus: number;
        tasks: number;
        journal: number
    }): Promise<void> => {
        for (const badge of defaultBadges) {
            if (earnedBadgeIds.has(badge.id)) continue;

            let shouldUnlock = false;
            switch (badge.requirement.type) {
                case 'streak':
                    shouldUnlock = stats.streak >= badge.requirement.value;
                    break;
                case 'focus':
                    shouldUnlock = stats.focus >= badge.requirement.value;
                    break;
                case 'tasks':
                    shouldUnlock = stats.tasks >= badge.requirement.value;
                    break;
                case 'journal':
                    shouldUnlock = stats.journal >= badge.requirement.value;
                    break;
                case 'challenge':
                    // Already handled in createChallenge and checkInChallenge
                    break;
            }

            if (shouldUnlock) {
                await earnBadge(badge.id);
            }
        }
    }, [earnedBadgeIds, earnBadge]);

    // Check if checked in today for a specific challenge
    const hasCheckedInToday = useCallback((challengeId: string): boolean => {
        const todayKey = getTodayKey();
        return checkIns.some(c => c.challenge_id === challengeId && c.check_in_date === todayKey);
    }, [checkIns]);

    // Get check-in count for a challenge
    const getCheckInCount = useCallback((challengeId: string): number => {
        return checkIns.filter(c => c.challenge_id === challengeId).length;
    }, [checkIns]);

    // Dismiss celebration
    const dismissCelebration = useCallback(() => {
        setShowCelebration(false);
        setCelebrationMessage('');
    }, []);

    // Load data on mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Derived data
    const activeChallenges = challenges.filter(c => c.is_active);
    const completedChallenges = challenges.filter(c => c.completed_at);

    // Merge badge definitions with earned status
    const badges: Badge[] = defaultBadges.map(b => ({
        ...b,
        earnedAt: earnedBadgeIds.has(b.id) ? 'earned' : undefined,
    }));

    const earnedBadges = badges.filter(b => b.earnedAt);
    const unearnedBadges = badges.filter(b => !b.earnedAt);

    return {
        // Data
        challenges,
        activeChallenges,
        completedChallenges,
        badges,
        earnedBadges,
        unearnedBadges,
        isLoading,
        error,
        // Actions
        createChallenge,
        checkInChallenge,
        deleteChallenge,
        earnBadge,
        checkAllBadges,
        hasCheckedInToday,
        getCheckInCount,
        refetch: fetchData,
        // Celebration
        showCelebration,
        celebrationMessage,
        dismissCelebration,
    };
}
