import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { buildInsightsPrompt, getGeminiEndpoint, buildGeminiRequestBody } from './aiPrompts';
import {
  validateAIInsights,
  validateQuarterlyPlansDepth,
  detectTruncation,
  type AIInsights as ZodAIInsights,
} from '@/lib/aiSchemas';

// Export for use in aiPrompts.ts
export interface UserIdentity {
  identity_statement: string;
  purpose_why: string;
  yearly_goal: string;
  daily_time_capacity: string;
  sleep_definition: string;
  body_care: string;
  self_care_practice: string;
  habits_focus: string;
  health_focus: string;
  friction_triggers: string;
}

interface MicroStep {
  id: string;
  text: string;
  type: 'goal' | 'habit' | 'health' | 'rest';
  completed: boolean;
}

interface Identity {
  name: string;
  icon: string;
  selected?: boolean;
}

interface QuarterlyGoal {
  quarter: string;
  goal: string;
}

interface NonNegotiable {
  name: string;
  icon: string;
}

interface WeeklyPlanItem {
  day: string;
  activity: string;
}

interface Habit {
  name: string;
  current?: number;
  target?: number;
  value?: string;
  unit?: string;
  icon?: string;
}

export interface AIInsights {
  identity_reflection: string;
  identity_summary: string;
  quarter_goal: string;
  focus_block_duration: string;
  focus_block_suggestion: string;
  friction_insight: string;
  identity_reinforcement: string;
  micro_steps: MicroStep[];
  identities: Identity[];
  my_why: string;
  yearly_goal_title: string;
  quarterly_goals: QuarterlyGoal[];
  your_why_detail: string;
  daily_non_negotiables: NonNegotiable[];
  weekly_plan: WeeklyPlanItem[];
  habits: Habit[];
  focus_duration_minutes: number;
  frictions_detector_message: string;
  is_ai_generated: boolean;
  generated_at?: string;
  validation_warnings?: string[]; // Track any validation issues for debugging
}

// Generate insights directly using Gemini API
async function generateInsightsWithGemini(userIdentity: UserIdentity): Promise<AIInsights> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Google API Key not configured');
  }

  // Use extracted prompt builder for separation of concerns
  const prompt = buildInsightsPrompt(userIdentity);

  const response = await fetch(
    getGeminiEndpoint(apiKey),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildGeminiRequestBody(prompt)),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error('No response generated from Gemini');
  }

  // Parse the JSON from the response
  let cleanedText = generatedText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  }
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  // Check for truncation BEFORE parsing
  if (detectTruncation(cleanedText)) {
    console.error('[AI] Response appears truncated. Length:', cleanedText.length);
    throw new Error('AI response was truncated. The plan may be incomplete.');
  }

  // Safe JSON parsing with try-catch
  let rawInsights: unknown;
  try {
    rawInsights = JSON.parse(cleanedText);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    console.error('Raw response (first 500 chars):', cleanedText.substring(0, 500));
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  // ============================================
  // ZOD SCHEMA VALIDATION (comprehensive)
  // ============================================
  // This validates ALL 20+ fields, not just 2
  // Including deeply nested: quarterly_goals[0].weeklyPlan[0].days[0].task

  const validationResult = validateAIInsights(rawInsights);

  if (!validationResult.success) {
    console.error('[AI Validation] Schema validation failed:', validationResult.errors);
    throw new Error(`AI response failed validation: ${validationResult.errors?.slice(0, 3).join(', ')}`);
  }

  const insights = validationResult.data!;

  // Additional deep validation for quarterly plans
  const quarterlyValidation = validateQuarterlyPlansDepth(insights.quarterly_goals);
  const validationWarnings: string[] = [];

  if (!quarterlyValidation.valid) {
    console.warn('[AI Validation] Some quarters have incomplete weekly plans:', quarterlyValidation.details);
    // Don't fail, but record the warning
    for (const [quarter, details] of Object.entries(quarterlyValidation.details)) {
      if (!details.hasWeeklyPlan || details.avgDaysPerWeek < 3) {
        validationWarnings.push(`${quarter}: incomplete weekly plan (${details.weekCount} weeks, avg ${details.avgDaysPerWeek.toFixed(1)} days/week)`);
      }
    }
  }

  // Ensure focus_duration_minutes is within bounds
  let focusDuration = insights.focus_duration_minutes ?? 45;
  if (focusDuration < 5) focusDuration = 5;
  if (focusDuration > 180) focusDuration = 180;

  // Transform micro_steps to include completed state and id
  const microSteps: MicroStep[] = (insights.micro_steps || []).map((step, index) => ({
    id: String(index + 1),
    text: step.text || '',
    type: (step.type || 'goal') as MicroStep['type'],
    completed: false,
  }));

  return {
    identity_reflection: insights.identity_reflection || '',
    identity_summary: insights.identity_summary || '',
    quarter_goal: insights.quarter_goal || '',
    focus_block_duration: insights.focus_block_duration || '30-45 min',
    focus_block_suggestion: insights.focus_block_suggestion || '',
    friction_insight: insights.friction_insight || '',
    identity_reinforcement: insights.identity_reinforcement || '',
    micro_steps: microSteps,
    identities: insights.identities as Identity[],
    my_why: insights.my_why || '',
    yearly_goal_title: insights.yearly_goal_title,
    quarterly_goals: insights.quarterly_goals as QuarterlyGoal[],
    your_why_detail: insights.your_why_detail || '',
    daily_non_negotiables: (insights.daily_non_negotiables || []) as NonNegotiable[],
    weekly_plan: (insights.weekly_plan || []) as WeeklyPlanItem[],
    habits: (insights.habits || []) as Habit[],
    focus_duration_minutes: focusDuration,
    frictions_detector_message: insights.frictions_detector_message || '',
    is_ai_generated: true,
    generated_at: new Date().toISOString(),
    validation_warnings: validationWarnings.length > 0 ? validationWarnings : undefined,
  };
}

export function useAIInsights(userId: string | undefined) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAligning, setIsAligning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track current insights without causing dependency issues
  // This avoids the stale closure problem of having `insights` in the dependency array
  const insightsRef = useRef<AIInsights | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    insightsRef.current = insights;
  }, [insights]);

  // Cache key for localStorage (fast read cache only)
  const localCacheKey = userId ? `aligned_insights_${userId}` : null;

  // Load cached insights: try localStorage first (fast), then Supabase (source of truth)
  useEffect(() => {
    const loadCachedInsights = async () => {
      if (!userId) return;

      // Step 1: Try localStorage for instant load (fast cache layer)
      if (localCacheKey) {
        try {
          const localCached = localStorage.getItem(localCacheKey);
          if (localCached) {
            const parsed = JSON.parse(localCached);
            if (parsed && parsed.identities && parsed.yearly_goal_title) {
              setInsights(parsed);
              setLoading(false);
              console.log('Loaded insights from localStorage cache');
            }
          }
        } catch (e) {
          console.warn('Failed to load from localStorage:', e);
        }
      }

      // Step 2: Verify/load from Supabase (source of truth)
      try {
        const { data: supabaseCache, error } = await supabase
          .from('ai_insights_cache')
          .select('insights, generated_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching from ai_insights_cache:', error);
          return;
        }

        if (supabaseCache?.insights) {
          const supabaseInsights = supabaseCache.insights as AIInsights;
          // Validate the insights have required fields
          if (supabaseInsights.identities && supabaseInsights.yearly_goal_title) {
            setInsights(supabaseInsights);
            setLoading(false);
            console.log('Loaded insights from Supabase (source of truth)');

            // Update localStorage cache for future fast loads
            if (localCacheKey) {
              try {
                localStorage.setItem(localCacheKey, JSON.stringify(supabaseInsights));
              } catch (e) {
                // localStorage quota exceeded - non-critical
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error loading from Supabase cache:', e);
      }
    };

    loadCachedInsights();
  }, [userId, localCacheKey]);

  const fetchInsights = useCallback(async (retryCount = 0, forceRefresh = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Use ref to check current insights without depending on state
    // This prevents stale closures and infinite loops
    if (insightsRef.current && !forceRefresh) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch user identity data
      const { data: identityData, error: identityError } = await supabase
        .from('user_identity')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (identityError) {
        console.error('Error fetching identity:', identityError);
        throw identityError;
      }

      if (!identityData) {
        console.log('No identity data found for user');
        setError('Please complete onboarding to see your personalized dashboard');
        setLoading(false);
        return;
      }

      const userIdentity: UserIdentity = {
        identity_statement: identityData.identity_statement || '',
        purpose_why: identityData.purpose_why || '',
        yearly_goal: identityData.yearly_goal || '',
        daily_time_capacity: identityData.daily_time_capacity || '',
        sleep_definition: identityData.sleep_definition || '',
        body_care: identityData.body_care || '',
        self_care_practice: identityData.self_care_practice || '',
        habits_focus: identityData.habits_focus || '',
        health_focus: identityData.health_focus || '',
        friction_triggers: identityData.friction_triggers || '',
      };

      console.log('Generating AI insights for identity:', userIdentity);

      // Try edge function first, fallback to direct Gemini API
      let generatedInsights: AIInsights | null = null;

      try {
        // Try Supabase Edge Function
        const { data, error: fnError } = await supabase.functions.invoke('analyze-onboarding', {
          body: { userIdentity },
        });

        if (fnError) {
          console.warn('Edge function failed, falling back to Gemini API:', fnError);
          throw fnError;
        }

        if (data && !data.error) {
          const insightsData = data.insights || data;

          const microSteps: MicroStep[] = (insightsData.micro_steps || []).map((step: { text: string; type: string }, index: number) => ({
            id: String(index + 1),
            text: step.text,
            type: step.type as MicroStep['type'],
            completed: false,
          }));

          let focusDuration = 45;
          if (typeof insightsData.focus_duration_minutes === 'number') {
            focusDuration = insightsData.focus_duration_minutes;
          } else if (typeof insightsData.focus_duration_minutes === 'string') {
            const parsed = parseInt(insightsData.focus_duration_minutes, 10);
            if (!isNaN(parsed)) focusDuration = parsed;
          }

          generatedInsights = {
            identity_reflection: insightsData.identity_reflection || '',
            identity_summary: insightsData.identity_summary || '',
            quarter_goal: insightsData.quarter_goal || '',
            focus_block_duration: insightsData.focus_block_duration || '',
            focus_block_suggestion: insightsData.focus_block_suggestion || '',
            friction_insight: insightsData.friction_insight || '',
            identity_reinforcement: insightsData.identity_reinforcement || '',
            micro_steps: microSteps,
            identities: insightsData.identities || [],
            my_why: insightsData.my_why || '',
            yearly_goal_title: insightsData.yearly_goal_title || '',
            quarterly_goals: insightsData.quarterly_goals || [],
            your_why_detail: insightsData.your_why_detail || '',
            daily_non_negotiables: insightsData.daily_non_negotiables || [],
            weekly_plan: insightsData.weekly_plan || [],
            habits: insightsData.habits || [],
            focus_duration_minutes: focusDuration,
            frictions_detector_message: insightsData.frictions_detector_message || '',
            is_ai_generated: insightsData.is_ai_generated === true,
            generated_at: insightsData.generated_at,
          };
        } else {
          throw new Error(data?.error || 'No insights returned from edge function');
        }
      } catch (edgeFnError) {
        // Fallback to direct Gemini API call
        console.log('Using Gemini API directly...');
        generatedInsights = await generateInsightsWithGemini(userIdentity);
      }

      if (generatedInsights) {
        setInsights(generatedInsights);

        // Save to Supabase (source of truth)
        try {
          const { error: upsertError } = await supabase
            .from('ai_insights_cache')
            .upsert({
              user_id: userId,
              insights: generatedInsights,
              generated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          if (upsertError) {
            console.warn('Failed to save insights to Supabase:', upsertError);
          } else {
            console.log('Saved insights to Supabase');
          }
        } catch (e) {
          console.warn('Error saving to Supabase:', e);
        }

        // Also cache in localStorage for fast future loads
        if (localCacheKey) {
          try {
            localStorage.setItem(localCacheKey, JSON.stringify(generatedInsights));
          } catch (e) {
            // localStorage quota exceeded - non-critical since Supabase is source of truth
          }
        }
      } else {
        throw new Error('Failed to generate insights');
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err);

      // Retry once if this is the first attempt
      if (retryCount < 1) {
        console.log('Retrying AI insights fetch...');
        setIsAligning(true);
        setTimeout(() => {
          fetchInsights(retryCount + 1);
        }, 2000);
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(`AI Analysis failed: ${errorMessage}. Please try refreshing the page.`);
    } finally {
      if (!isAligning) {
        setLoading(false);
      }
      setIsAligning(false);
    }
  }, [userId, localCacheKey]); // Fixed: renamed cacheKey to localCacheKey

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]); // Now safe to include fetchInsights since deps are correct

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchInsights(0, true); // Force refresh
  }, [fetchInsights]);

  return { insights, loading: loading || isAligning, isAligning, error, refetch };
}
