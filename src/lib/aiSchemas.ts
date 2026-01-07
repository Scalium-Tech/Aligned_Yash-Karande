/**
 * AI Response Validation Schemas
 * 
 * Uses Zod for runtime validation of AI-generated JSON responses.
 * This ensures we never use malformed or truncated AI output.
 * 
 * DESIGN PRINCIPLES:
 * 1. Validate ALL fields, not just a few required ones
 * 2. Validate nested structures deeply (quarterly_goals[0].weeklyPlan[0].days[0].task)
 * 3. Provide clear error messages for debugging
 * 4. Use .partial() or .optional() for truly optional fields
 * 5. Fail fast on invalid data rather than silently accepting garbage
 */

import { z } from 'zod';

// ============================================
// ATOMIC SCHEMAS (building blocks)
// ============================================

/**
 * A single day's task within a weekly plan
 */
export const DayTaskSchema = z.object({
    day: z.string().min(1),
    task: z.string().min(1),
    description: z.string().optional(), // Some days might not have descriptions
});

/**
 * A single week within a quarterly plan
 */
export const WeeklyPlanItemSchema = z.object({
    week: z.string().min(1),
    focus: z.string().min(1),
    days: z.array(DayTaskSchema).min(1), // At least 1 day, ideally 7
});

/**
 * A quarterly goal with its weekly plan
 */
export const QuarterlyGoalSchema = z.object({
    quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
    goal: z.string().min(1),
    weeklyPlan: z.array(WeeklyPlanItemSchema).optional(), // May not be present in initial response
});

/**
 * User identity item
 */
export const IdentitySchema = z.object({
    name: z.string().min(1),
    icon: z.string().optional(),
    selected: z.boolean().optional(),
});

/**
 * Daily non-negotiable habit
 */
export const NonNegotiableSchema = z.object({
    name: z.string().min(1),
    icon: z.string().optional(),
});

/**
 * Weekly plan day activity
 */
export const WeeklyPlanDaySchema = z.object({
    day: z.string().min(1),
    activity: z.string().min(1),
});

/**
 * Habit tracking item
 */
export const HabitSchema = z.object({
    name: z.string().min(1),
    current: z.number().optional(),
    target: z.number().optional(),
    value: z.string().optional(),
    unit: z.string().optional(),
    icon: z.string().optional(),
});

/**
 * Micro-step action item
 */
export const MicroStepSchema = z.object({
    text: z.string().min(1),
    type: z.enum(['goal', 'habit', 'health', 'rest']).optional(),
});

// ============================================
// MAIN AI INSIGHTS SCHEMA
// ============================================

/**
 * Complete AI Insights response schema
 * 
 * Uses .optional() for fields that may be missing but code can handle.
 * Uses required fields for critical data that must be present.
 */
export const AIInsightsSchema = z.object({
    // CRITICAL: These must be present for the feature to work
    identities: z.array(IdentitySchema).min(1, 'At least one identity required'),
    yearly_goal_title: z.string().min(1, 'Yearly goal title is required'),
    quarterly_goals: z.array(QuarterlyGoalSchema).min(1, 'At least one quarterly goal required'),

    // IMPORTANT: These should be present but have sensible defaults
    identity_summary: z.string().optional().default(''),
    my_why: z.string().optional().default(''),
    your_why_detail: z.string().optional().default(''),
    daily_non_negotiables: z.array(NonNegotiableSchema).optional().default([]),
    weekly_plan: z.array(WeeklyPlanDaySchema).optional().default([]),
    habits: z.array(HabitSchema).optional().default([]),
    micro_steps: z.array(MicroStepSchema).optional().default([]),

    // OPTIONAL: Nice to have but not critical
    identity_reflection: z.string().optional().default(''),
    quarter_goal: z.string().optional().default(''),
    focus_block_duration: z.string().optional().default('30-45 min'),
    focus_block_suggestion: z.string().optional().default(''),
    friction_insight: z.string().optional().default(''),
    identity_reinforcement: z.string().optional().default(''),
    frictions_detector_message: z.string().optional().default(''),
    focus_duration_minutes: z.number().min(5).max(180).optional().default(45),
});

// ============================================
// QUARTERLY PLAN SCHEMA (for multi-step generation)
// ============================================

/**
 * Schema for a single quarter's detailed plan
 * Used when generating quarters independently
 */
export const DetailedQuarterSchema = z.object({
    quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
    goal: z.string().min(1),
    weeklyPlan: z.array(WeeklyPlanItemSchema).min(4, 'At least 4 weeks required'), // Minimum viable quarter
});

// ============================================
// TYPE EXPORTS
// ============================================

export type DayTask = z.infer<typeof DayTaskSchema>;
export type WeeklyPlanItem = z.infer<typeof WeeklyPlanItemSchema>;
export type QuarterlyGoal = z.infer<typeof QuarterlyGoalSchema>;
export type Identity = z.infer<typeof IdentitySchema>;
export type NonNegotiable = z.infer<typeof NonNegotiableSchema>;
export type Habit = z.infer<typeof HabitSchema>;
export type MicroStep = z.infer<typeof MicroStepSchema>;
export type AIInsights = z.infer<typeof AIInsightsSchema>;
export type DetailedQuarter = z.infer<typeof DetailedQuarterSchema>;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

/**
 * Validate a complete AI insights response
 * 
 * @param data - Raw parsed JSON from AI
 * @returns Validation result with typed data or error messages
 */
export function validateAIInsights(data: unknown): ValidationResult<AIInsights> {
    const result = AIInsightsSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Extract human-readable error messages
    const errors = result.error.issues.map(issue => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
    });

    console.error('[AI Validation] Schema validation failed:', errors);
    return { success: false, errors };
}

/**
 * Validate a single quarter's detailed plan
 * 
 * @param data - Raw parsed JSON for one quarter
 * @returns Validation result with typed data or error messages
 */
export function validateQuarterPlan(data: unknown): ValidationResult<DetailedQuarter> {
    const result = DetailedQuarterSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map(issue => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
    });

    console.error('[AI Validation] Quarter plan validation failed:', errors);
    return { success: false, errors };
}

/**
 * Check if quarterly goals have valid weekly plans
 * This is the deep validation the old code was missing
 * 
 * @param quarterlyGoals - Array of quarterly goals to validate
 * @returns Object with validation status and details
 */
export function validateQuarterlyPlansDepth(
    quarterlyGoals: QuarterlyGoal[]
): { valid: boolean; details: Record<string, { hasWeeklyPlan: boolean; weekCount: number; avgDaysPerWeek: number }> } {
    const details: Record<string, { hasWeeklyPlan: boolean; weekCount: number; avgDaysPerWeek: number }> = {};
    let allValid = true;

    for (const qg of quarterlyGoals) {
        const weeklyPlan = qg.weeklyPlan || [];
        const weekCount = weeklyPlan.length;
        const totalDays = weeklyPlan.reduce((sum, week) => sum + (week.days?.length || 0), 0);
        const avgDaysPerWeek = weekCount > 0 ? totalDays / weekCount : 0;

        details[qg.quarter] = {
            hasWeeklyPlan: weekCount > 0,
            weekCount,
            avgDaysPerWeek,
        };

        // Consider a quarter invalid if it has no weekly plan or very few days
        if (weekCount === 0 || avgDaysPerWeek < 3) {
            allValid = false;
        }
    }

    return { valid: allValid, details };
}

/**
 * Detect if AI response was likely truncated
 * 
 * Signs of truncation:
 * - Missing closing braces
 * - Incomplete quarterly goals
 * - weeklyPlan arrays that stop mid-quarter
 * 
 * @param rawText - The raw text response from AI
 * @param parsedData - The parsed JSON (if parsing succeeded)
 * @returns true if truncation is suspected
 */
export function detectTruncation(rawText: string, parsedData?: unknown): boolean {
    // Check for unclosed braces/brackets
    const openBraces = (rawText.match(/{/g) || []).length;
    const closeBraces = (rawText.match(/}/g) || []).length;
    const openBrackets = (rawText.match(/\[/g) || []).length;
    const closeBrackets = (rawText.match(/\]/g) || []).length;

    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
        console.warn('[AI Validation] Likely truncation: unbalanced braces/brackets');
        return true;
    }

    // Check if response ends abruptly (not with proper JSON closing)
    const trimmed = rawText.trim();
    if (!trimmed.endsWith('}') && !trimmed.endsWith(']')) {
        console.warn('[AI Validation] Likely truncation: response does not end with } or ]');
        return true;
    }

    // If parsed, check for incomplete quarterly goals
    if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
        const data = parsedData as Record<string, unknown>;
        const quarterlyGoals = data.quarterly_goals as QuarterlyGoal[] | undefined;

        if (quarterlyGoals && quarterlyGoals.length < 4) {
            console.warn(`[AI Validation] Likely truncation: only ${quarterlyGoals.length} quarters found`);
            return true;
        }
    }

    return false;
}
