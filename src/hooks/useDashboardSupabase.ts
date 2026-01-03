import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserData, removeUserData } from '@/lib/userStorage';

// Database types
export interface YearlyGoal {
    id: string;
    user_id: string;
    title: string;
    my_why: string | null;
    your_why_detail: string | null;
    year: number;
    created_at: string;
    updated_at: string;
}

export interface QuarterlyGoal {
    id: string;
    user_id: string;
    yearly_goal_id: string | null;
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    goal: string;
    completed: boolean;
    completed_at: string | null;
    year: number;
    created_at: string;
}

export interface UserIdentity {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    is_selected: boolean;
    display_order: number;
    created_at: string;
}

export interface WeeklyPlanItem {
    day: string;
    activity: string;
}

export interface CustomWeeklyPlan {
    id: string;
    user_id: string;
    plan: WeeklyPlanItem[];
    updated_at: string;
}

// Legacy localStorage keys
const LEGACY_INSIGHTS_KEY = 'aligned_insights_';
const LEGACY_WEEKLY_PLAN_KEY = 'aligned_custom_weekly_plan';
const MIGRATION_DONE_KEY = 'aligned_dashboard_migrated_to_supabase';

export function useDashboardSupabase(userId?: string) {
    const [yearlyGoal, setYearlyGoal] = useState<YearlyGoal | null>(null);
    const [quarterlyGoals, setQuarterlyGoals] = useState<QuarterlyGoal[]>([]);
    const [identities, setIdentities] = useState<UserIdentity[]>([]);
    const [customWeeklyPlan, setCustomWeeklyPlan] = useState<WeeklyPlanItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentYear = new Date().getFullYear();

    // Fetch all dashboard data
    const fetchData = useCallback(async () => {
        if (!userId) {
            setYearlyGoal(null);
            setQuarterlyGoals([]);
            setIdentities([]);
            setCustomWeeklyPlan(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch yearly goal
            const { data: yearlyData } = await supabase
                .from('yearly_goals')
                .select('*')
                .eq('user_id', userId)
                .eq('year', currentYear)
                .single();

            // Fetch quarterly goals
            const { data: quarterlyData } = await supabase
                .from('quarterly_goals')
                .select('*')
                .eq('user_id', userId)
                .eq('year', currentYear)
                .order('quarter');

            // Fetch identities
            const { data: identitiesData } = await supabase
                .from('user_identities')
                .select('*')
                .eq('user_id', userId)
                .order('display_order');

            // Fetch custom weekly plan
            const { data: weeklyPlanData } = await supabase
                .from('custom_weekly_plans')
                .select('*')
                .eq('user_id', userId)
                .single();

            // Migrate from localStorage if empty
            if (!yearlyData && !identitiesData?.length) {
                await migrateFromLocalStorage(userId);
                // Re-fetch after migration
                const { data: newYearly } = await supabase
                    .from('yearly_goals')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('year', currentYear)
                    .single();

                const { data: newQuarterly } = await supabase
                    .from('quarterly_goals')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('year', currentYear)
                    .order('quarter');

                const { data: newIdentities } = await supabase
                    .from('user_identities')
                    .select('*')
                    .eq('user_id', userId)
                    .order('display_order');

                const { data: newWeeklyPlan } = await supabase
                    .from('custom_weekly_plans')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                setYearlyGoal(newYearly || null);
                setQuarterlyGoals(newQuarterly || []);
                setIdentities(newIdentities || []);
                setCustomWeeklyPlan(newWeeklyPlan?.plan || null);
            } else {
                setYearlyGoal(yearlyData || null);
                setQuarterlyGoals(quarterlyData || []);
                setIdentities(identitiesData || []);
                setCustomWeeklyPlan(weeklyPlanData?.plan || null);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    }, [userId, currentYear]);

    // Migrate from localStorage
    const migrateFromLocalStorage = async (uid: string): Promise<boolean> => {
        const migrationKey = `${MIGRATION_DONE_KEY}_${uid}`;
        if (localStorage.getItem(migrationKey)) return false;

        try {
            // Try to get cached insights
            const insightsKey = `${LEGACY_INSIGHTS_KEY}${uid}`;
            const cachedInsights = localStorage.getItem(insightsKey);

            if (cachedInsights) {
                const insights = JSON.parse(cachedInsights);

                // Migrate yearly goal
                if (insights.yearly_goal_title) {
                    const { data: yearlyData } = await supabase
                        .from('yearly_goals')
                        .insert({
                            user_id: uid,
                            title: insights.yearly_goal_title,
                            my_why: insights.my_why || null,
                            your_why_detail: insights.your_why_detail || null,
                            year: currentYear,
                        })
                        .select()
                        .single();

                    // Migrate quarterly goals
                    if (insights.quarterly_goals && yearlyData) {
                        const quarterlyGoalsToInsert = insights.quarterly_goals.map((q: { quarter: string; goal: string }) => ({
                            user_id: uid,
                            yearly_goal_id: yearlyData.id,
                            quarter: q.quarter,
                            goal: q.goal,
                            year: currentYear,
                        }));
                        await supabase.from('quarterly_goals').insert(quarterlyGoalsToInsert);
                    }
                }

                // Migrate identities
                if (insights.identities && insights.identities.length > 0) {
                    const identitiesToInsert = insights.identities.map((i: { name: string; icon?: string; selected?: boolean }, idx: number) => ({
                        user_id: uid,
                        name: i.name,
                        icon: i.icon || 'user',
                        is_selected: i.selected || false,
                        display_order: idx,
                    }));
                    await supabase.from('user_identities').insert(identitiesToInsert);
                }
            }

            // Migrate custom weekly plan
            const weeklyPlanData = getUserData<WeeklyPlanItem[]>(LEGACY_WEEKLY_PLAN_KEY, uid, []);
            if (weeklyPlanData && weeklyPlanData.length > 0) {
                await supabase.from('custom_weekly_plans').insert({
                    user_id: uid,
                    plan: weeklyPlanData,
                });
            }

            // Mark migration complete and clean up
            localStorage.setItem(migrationKey, 'true');
            localStorage.removeItem(insightsKey);
            removeUserData(LEGACY_WEEKLY_PLAN_KEY, uid);
            console.log('Successfully migrated dashboard from localStorage to Supabase');
            return true;
        } catch (err) {
            console.error('Error migrating dashboard:', err);
        }
        return false;
    };

    // Save yearly goal
    const saveYearlyGoal = useCallback(async (title: string, myWhy?: string, yourWhyDetail?: string): Promise<YearlyGoal | null> => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('yearly_goals')
                .upsert({
                    user_id: userId,
                    title,
                    my_why: myWhy || null,
                    your_why_detail: yourWhyDetail || null,
                    year: currentYear,
                }, { onConflict: 'user_id,year' })
                .select()
                .single();

            if (error) throw error;

            setYearlyGoal(data);
            return data;
        } catch (err) {
            console.error('Error saving yearly goal:', err);
            return null;
        }
    }, [userId, currentYear]);

    // Save quarterly goals
    const saveQuarterlyGoals = useCallback(async (goals: { quarter: string; goal: string }[]): Promise<QuarterlyGoal[]> => {
        if (!userId) return [];

        try {
            // Delete existing and insert new
            await supabase
                .from('quarterly_goals')
                .delete()
                .eq('user_id', userId)
                .eq('year', currentYear);

            const goalsToInsert = goals.map(g => ({
                user_id: userId,
                yearly_goal_id: yearlyGoal?.id || null,
                quarter: g.quarter,
                goal: g.goal,
                year: currentYear,
            }));

            const { data, error } = await supabase
                .from('quarterly_goals')
                .insert(goalsToInsert)
                .select();

            if (error) throw error;

            setQuarterlyGoals(data || []);
            return data || [];
        } catch (err) {
            console.error('Error saving quarterly goals:', err);
            return [];
        }
    }, [userId, currentYear, yearlyGoal?.id]);

    // Mark quarterly goal complete
    const markQuarterlyGoalComplete = useCallback(async (quarter: string, completed: boolean): Promise<boolean> => {
        if (!userId) return false;

        try {
            const { error } = await supabase
                .from('quarterly_goals')
                .update({
                    completed,
                    completed_at: completed ? new Date().toISOString() : null,
                })
                .eq('user_id', userId)
                .eq('quarter', quarter)
                .eq('year', currentYear);

            if (error) throw error;

            setQuarterlyGoals(prev => prev.map(q =>
                q.quarter === quarter ? { ...q, completed, completed_at: completed ? new Date().toISOString() : null } : q
            ));
            return true;
        } catch (err) {
            console.error('Error marking quarterly goal complete:', err);
            return false;
        }
    }, [userId, currentYear]);

    // Save identities
    const saveIdentities = useCallback(async (newIdentities: { name: string; icon?: string; selected?: boolean }[]): Promise<UserIdentity[]> => {
        if (!userId) return [];

        try {
            // Delete existing and insert new
            await supabase
                .from('user_identities')
                .delete()
                .eq('user_id', userId);

            const identitiesToInsert = newIdentities.map((i, idx) => ({
                user_id: userId,
                name: i.name,
                icon: i.icon || 'user',
                is_selected: i.selected || false,
                display_order: idx,
            }));

            const { data, error } = await supabase
                .from('user_identities')
                .insert(identitiesToInsert)
                .select();

            if (error) throw error;

            setIdentities(data || []);
            return data || [];
        } catch (err) {
            console.error('Error saving identities:', err);
            return [];
        }
    }, [userId]);

    // Select identity
    const selectIdentity = useCallback(async (identityId: string): Promise<boolean> => {
        if (!userId) return false;

        try {
            // Deselect all first
            await supabase
                .from('user_identities')
                .update({ is_selected: false })
                .eq('user_id', userId);

            // Select the chosen one
            const { error } = await supabase
                .from('user_identities')
                .update({ is_selected: true })
                .eq('id', identityId);

            if (error) throw error;

            setIdentities(prev => prev.map(i => ({
                ...i,
                is_selected: i.id === identityId,
            })));
            return true;
        } catch (err) {
            console.error('Error selecting identity:', err);
            return false;
        }
    }, [userId]);

    // Save custom weekly plan
    const saveCustomWeeklyPlan = useCallback(async (plan: WeeklyPlanItem[]): Promise<boolean> => {
        if (!userId) return false;

        try {
            const { error } = await supabase
                .from('custom_weekly_plans')
                .upsert({
                    user_id: userId,
                    plan,
                }, { onConflict: 'user_id' });

            if (error) throw error;

            setCustomWeeklyPlan(plan);
            return true;
        } catch (err) {
            console.error('Error saving custom weekly plan:', err);
            return false;
        }
    }, [userId]);

    // Get selected identity
    const getSelectedIdentity = useCallback((): UserIdentity | null => {
        return identities.find(i => i.is_selected) || null;
    }, [identities]);

    // Load data on mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        // Data
        yearlyGoal,
        quarterlyGoals,
        identities,
        customWeeklyPlan,
        isLoading,
        error,
        // Yearly goal operations
        saveYearlyGoal,
        // Quarterly goal operations
        saveQuarterlyGoals,
        markQuarterlyGoalComplete,
        // Identity operations
        saveIdentities,
        selectIdentity,
        getSelectedIdentity,
        // Weekly plan operations
        saveCustomWeeklyPlan,
        // Refresh
        refetch: fetchData,
    };
}
