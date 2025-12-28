import { useState, useEffect, useCallback } from 'react';
import { getUserStorageKey } from '@/lib/userStorage';

interface Challenge {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    daysCompleted: number;
    totalDays: number;
    checkIns: string[]; // dates checked in
    isActive: boolean;
    completedAt?: string;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt?: string;
    requirement: {
        type: 'streak' | 'focus' | 'tasks' | 'journal' | 'challenge';
        value: number;
    };
}

interface GoalsData {
    challenges: Challenge[];
    badges: Badge[];
    completedChallenges: number;
}

const GOALS_KEY = 'aligned_goals';

const defaultBadges: Badge[] = [
    { id: 'first-step', name: 'First Step', description: 'Complete your first task', icon: '🎯', requirement: { type: 'tasks', value: 1 } },
    { id: 'week-warrior', name: 'Week Warrior', description: '7 day streak', icon: '🔥', requirement: { type: 'streak', value: 7 } },
    { id: 'focus-master', name: 'Focus Master', description: '100 minutes of focus time', icon: '⏱️', requirement: { type: 'focus', value: 100 } },
    { id: 'journaler', name: 'Journaler', description: 'Write 7 journal entries', icon: '📝', requirement: { type: 'journal', value: 7 } },
    { id: 'challenger', name: 'Challenger', description: 'Start a 90-day challenge', icon: '💪', requirement: { type: 'challenge', value: 1 } },
    { id: 'streak-legend', name: 'Streak Legend', description: '30 day streak', icon: '🏆', requirement: { type: 'streak', value: 30 } },
    { id: 'focus-hero', name: 'Focus Hero', description: '500 minutes of focus', icon: '🦸', requirement: { type: 'focus', value: 500 } },
    { id: 'consistency-king', name: 'Consistency King', description: 'Complete a 90-day challenge', icon: '👑', requirement: { type: 'challenge', value: 90 } },
];

function loadGoalsData(userId?: string): GoalsData {
    const key = getUserStorageKey(GOALS_KEY, userId);
    const stored = localStorage.getItem(key);
    if (!stored) {
        return { challenges: [], badges: defaultBadges, completedChallenges: 0 };
    }
    try {
        const data = JSON.parse(stored);
        // Ensure all default badges exist
        const existingBadgeIds = new Set(data.badges?.map((b: Badge) => b.id) || []);
        const mergedBadges = [
            ...(data.badges || []),
            ...defaultBadges.filter(b => !existingBadgeIds.has(b.id)),
        ];
        return { ...data, badges: mergedBadges };
    } catch {
        return { challenges: [], badges: defaultBadges, completedChallenges: 0 };
    }
}

function saveGoalsData(data: GoalsData, userId?: string): void {
    const key = getUserStorageKey(GOALS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(data));
}

function getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
}

export function useGoals(userId?: string) {
    const [goalsData, setGoalsData] = useState<GoalsData>(() => loadGoalsData(userId));
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');

    // Reload data when userId changes
    useEffect(() => {
        const newData = loadGoalsData(userId);
        setGoalsData(newData);
    }, [userId]);

    const createChallenge = useCallback((title: string, description: string, days: number = 90) => {
        const startDate = getTodayKey();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const challenge: Challenge = {
            id: `challenge-${Date.now()}`,
            title,
            description,
            startDate,
            endDate: endDate.toISOString().split('T')[0],
            daysCompleted: 0,
            totalDays: days,
            checkIns: [],
            isActive: true,
        };

        setGoalsData(prev => {
            const updated = {
                ...prev,
                challenges: [challenge, ...prev.challenges],
            };
            saveGoalsData(updated);

            // Check for challenger badge inline
            const badgeUpdated = { ...updated };
            badgeUpdated.badges = updated.badges.map(badge => {
                if (!badge.earnedAt && badge.requirement.type === 'challenge' && 1 >= badge.requirement.value) {
                    return { ...badge, earnedAt: new Date().toISOString() };
                }
                return badge;
            });
            if (JSON.stringify(badgeUpdated.badges) !== JSON.stringify(updated.badges)) {
                saveGoalsData(badgeUpdated);
                return badgeUpdated;
            }
            return updated;
        });

        return challenge;
    }, []);

    const checkInChallenge = useCallback((challengeId: string) => {
        const todayKey = getTodayKey();

        setGoalsData(prev => {
            const updated = {
                ...prev,
                challenges: prev.challenges.map(c => {
                    if (c.id === challengeId && !c.checkIns.includes(todayKey)) {
                        const newCheckIns = [...c.checkIns, todayKey];
                        const newDaysCompleted = newCheckIns.length;

                        // Check if challenge is complete
                        const isComplete = newDaysCompleted >= c.totalDays;

                        if (isComplete) {
                            setCelebrationMessage(`🎉 Congratulations! You completed "${c.title}"!`);
                            setShowCelebration(true);
                        }

                        return {
                            ...c,
                            checkIns: newCheckIns,
                            daysCompleted: newDaysCompleted,
                            isActive: !isComplete,
                            completedAt: isComplete ? new Date().toISOString() : undefined,
                        };
                    }
                    return c;
                }),
            };

            // Count completed challenges
            const completedCount = updated.challenges.filter(c => c.completedAt).length;
            updated.completedChallenges = completedCount;

            // Check for milestone badge inline
            if (completedCount > 0) {
                updated.badges = updated.badges.map(badge => {
                    if (!badge.earnedAt && badge.requirement.type === 'challenge' && 90 >= badge.requirement.value) {
                        return { ...badge, earnedAt: new Date().toISOString() };
                    }
                    return badge;
                });
            }

            saveGoalsData(updated);
            return updated;
        });
    }, []);

    const deleteChallenge = useCallback((challengeId: string) => {
        setGoalsData(prev => {
            const updated = {
                ...prev,
                challenges: prev.challenges.filter(c => c.id !== challengeId),
            };
            saveGoalsData(updated);
            return updated;
        });
    }, []);

    const checkBadgeUnlock = useCallback((type: Badge['requirement']['type'], value: number) => {
        let badgeUnlocked = false;
        setGoalsData(prev => {
            const updated = { ...prev };
            updated.badges = prev.badges.map(badge => {
                if (!badge.earnedAt && badge.requirement.type === type && value >= badge.requirement.value) {
                    badgeUnlocked = true;
                    return { ...badge, earnedAt: new Date().toISOString() };
                }
                return badge;
            });

            if (badgeUnlocked) {
                saveGoalsData(updated);
                return updated;
            }
            return prev;
        });

        return badgeUnlocked;
    }, []);

    const checkAllBadges = useCallback((stats: { streak: number; focus: number; tasks: number; journal: number }) => {
        setGoalsData(prev => {
            let anyUnlocked = false;
            const updated = { ...prev };

            updated.badges = prev.badges.map(badge => {
                if (badge.earnedAt) return badge;

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
                        shouldUnlock = prev.completedChallenges >= 1 && badge.requirement.value === 90;
                        break;
                }

                if (shouldUnlock) {
                    anyUnlocked = true;
                    return { ...badge, earnedAt: new Date().toISOString() };
                }
                return badge;
            });

            if (anyUnlocked) {
                saveGoalsData(updated);
                return updated;
            }
            return prev;
        });
    }, []);

    const getActiveChallenges = useCallback(() => {
        return goalsData.challenges.filter(c => c.isActive);
    }, [goalsData.challenges]);

    const getCompletedChallenges = useCallback(() => {
        return goalsData.challenges.filter(c => c.completedAt);
    }, [goalsData.challenges]);

    const getEarnedBadges = useCallback(() => {
        return goalsData.badges.filter(b => b.earnedAt);
    }, [goalsData.badges]);

    const getUnearnedBadges = useCallback(() => {
        return goalsData.badges.filter(b => !b.earnedAt);
    }, [goalsData.badges]);

    const dismissCelebration = useCallback(() => {
        setShowCelebration(false);
        setCelebrationMessage('');
    }, []);

    return {
        goalsData,
        createChallenge,
        checkInChallenge,
        deleteChallenge,
        checkBadgeUnlock,
        checkAllBadges,
        getActiveChallenges,
        getCompletedChallenges,
        getEarnedBadges,
        getUnearnedBadges,
        showCelebration,
        celebrationMessage,
        dismissCelebration,
    };
}
