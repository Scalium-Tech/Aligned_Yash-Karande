import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// TEMP DEBUG LOG – REMOVE AFTER VERIFICATION
console.log(
  "Gemini key loaded:",
  import.meta.env.VITE_GOOGLE_API_KEY?.slice(0, 6)
);



interface UserIdentity {
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
}

// Generate insights directly using Gemini API
async function generateInsightsWithGemini(userIdentity: UserIdentity): Promise<AIInsights> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Google API Key not configured');
  }

  const prompt = `You are an EXPERT career mentor and personal growth coach AI for "Aligned — Your All-In-One Personal OS."

CRITICAL MISSION: Generate a REALISTIC, CAREER-AWARE, ACTIONABLE yearly and quarterly execution plan that feels like it was created by a real mentor in the user's field.

=== USER'S ACTUAL ONBOARDING RESPONSES ===
- Identity Statement: "${userIdentity.identity_statement || 'Not provided'}"
- Purpose/Why: "${userIdentity.purpose_why || 'Not provided'}"
- Yearly Goal: "${userIdentity.yearly_goal || 'Not provided'}"
- Daily Time Capacity: "${userIdentity.daily_time_capacity || 'Not provided'}"
- Sleep Definition: "${userIdentity.sleep_definition || 'Not provided'}"
- Body Care: "${userIdentity.body_care || 'Not provided'}"
- Self Care Practice: "${userIdentity.self_care_practice || 'Not provided'}"
- Habits Focus: "${userIdentity.habits_focus || 'Not provided'}"
- Health Focus: "${userIdentity.health_focus || 'Not provided'}"
- Friction Triggers: "${userIdentity.friction_triggers || 'Not provided'}"

=== STRICT PLANNING RULES ===
1. Classify the goal type: career, skill-based, academic, health, or personal development
2. Each quarter MUST have a DIFFERENT focus building progressively toward the yearly goal
3. Each week within a quarter MUST have a DIFFERENT focus theme
4. Each day (Mon-Sun) MUST have a UNIQUE, SPECIFIC, actionable task
5. NEVER use vague phrases like "research", "watch tutorials", "practice basics"
6. ALWAYS specify WHAT to do, WHERE (platform/resource), and WHY it matters

=== EXAMPLE OF QUALITY DAILY TASKS ===
❌ BAD: "Research materials", "Watch tutorials", "Practice skills"
✅ GOOD: "Study the official certification syllabus from [official source] and create a 12-week study schedule"
✅ GOOD: "Complete Module 1 of [specific course] on [platform], take notes on [specific topic]"
✅ GOOD: "Build a simple [specific project type] using [specific technology] to practice [specific skill]"

=== GENERATE JSON RESPONSE ===
{
  "identities": [
    {"name": "First identity derived from their identity_statement", "icon": "user", "selected": false},
    {"name": "Second identity aspect from their statement", "icon": "briefcase", "selected": false},  
    {"name": "Primary identity focus from their statement", "icon": "target", "selected": true}
  ],
  "identity_summary": "A 1-sentence summary explaining who they are becoming based on their identity_statement",
  "my_why": "Condensed version of their purpose_why in max 8 words",
  "yearly_goal_title": "Their yearly_goal rewritten as a clear, measurable, actionable title",
  "quarterly_goals": [
    {
      "quarter": "Q1",
      "goal": "SPECIFIC Q1 milestone (foundation phase) - what exactly will be achieved",
      "weeklyPlan": [
        {
          "week": "Week 1",
          "focus": "SPECIFIC weekly theme for week 1",
          "days": [
            {"day": "Mon", "task": "Specific task title", "description": "Detailed description: what exactly to do, where to find resources, expected outcome"},
            {"day": "Tue", "task": "Different specific task", "description": "Different detailed action with clear deliverable"},
            {"day": "Wed", "task": "Different specific task", "description": "Different detailed action with clear deliverable"},
            {"day": "Thu", "task": "Different specific task", "description": "Different detailed action with clear deliverable"},
            {"day": "Fri", "task": "Different specific task", "description": "Different detailed action with clear deliverable"},
            {"day": "Sat", "task": "Application/practice task", "description": "Apply the week's learning in a practical way"},
            {"day": "Sun", "task": "Reflection & planning", "description": "Review week's progress, journal learnings, plan next week"}
          ]
        },
        {
          "week": "Week 2",
          "focus": "DIFFERENT weekly theme building on week 1",
          "days": [
            {"day": "Mon", "task": "New specific task", "description": "Detailed description different from week 1"},
            {"day": "Tue", "task": "New specific task", "description": "Detailed description different from week 1"},
            {"day": "Wed", "task": "New specific task", "description": "Detailed description different from week 1"},
            {"day": "Thu", "task": "New specific task", "description": "Detailed description different from week 1"},
            {"day": "Fri", "task": "New specific task", "description": "Detailed description different from week 1"},
            {"day": "Sat", "task": "Application/practice task", "description": "Apply the week's learning"},
            {"day": "Sun", "task": "Reflection & planning", "description": "Review and plan"}
          ]
        }
      ]
    },
    {
      "quarter": "Q2",
      "goal": "SPECIFIC Q2 milestone (building phase) - different from Q1, advancing toward yearly goal",
      "weeklyPlan": [
        {
          "week": "Week 14",
          "focus": "SPECIFIC weekly theme for first week of Q2",
          "days": [
            {"day": "Mon", "task": "Specific task", "description": "Detailed description"},
            {"day": "Tue", "task": "Specific task", "description": "Detailed description"},
            {"day": "Wed", "task": "Specific task", "description": "Detailed description"},
            {"day": "Thu", "task": "Specific task", "description": "Detailed description"},
            {"day": "Fri", "task": "Specific task", "description": "Detailed description"},
            {"day": "Sat", "task": "Application task", "description": "Apply learning"},
            {"day": "Sun", "task": "Reflection", "description": "Review and plan"}
          ]
        }
      ]
    },
    {
      "quarter": "Q3",
      "goal": "SPECIFIC Q3 milestone (advancing phase) - building on Q1+Q2 progress",
      "weeklyPlan": [
        {
          "week": "Week 27",
          "focus": "SPECIFIC weekly theme for first week of Q3",
          "days": [
            {"day": "Mon", "task": "Specific task", "description": "Detailed description"},
            {"day": "Tue", "task": "Specific task", "description": "Detailed description"},
            {"day": "Wed", "task": "Specific task", "description": "Detailed description"},
            {"day": "Thu", "task": "Specific task", "description": "Detailed description"},
            {"day": "Fri", "task": "Specific task", "description": "Detailed description"},
            {"day": "Sat", "task": "Application task", "description": "Apply learning"},
            {"day": "Sun", "task": "Reflection", "description": "Review and plan"}
          ]
        }
      ]
    },
    {
      "quarter": "Q4",
      "goal": "SPECIFIC Q4 milestone (completion phase) - achieving the yearly goal",
      "weeklyPlan": [
        {
          "week": "Week 40",
          "focus": "SPECIFIC weekly theme for first week of Q4",
          "days": [
            {"day": "Mon", "task": "Specific task", "description": "Detailed description"},
            {"day": "Tue", "task": "Specific task", "description": "Detailed description"},
            {"day": "Wed", "task": "Specific task", "description": "Detailed description"},
            {"day": "Thu", "task": "Specific task", "description": "Detailed description"},
            {"day": "Fri", "task": "Specific task", "description": "Detailed description"},
            {"day": "Sat", "task": "Application task", "description": "Apply learning"},
            {"day": "Sun", "task": "Reflection", "description": "Review and plan"}
          ]
        }
      ]
    }
  ],
  "your_why_detail": "1-2 sentence expansion of their purpose_why with emotional resonance",
  "daily_non_negotiables": [
    {"name": "Sleep goal extracted from their sleep_definition", "icon": "moon"},
    {"name": "Hydration goal (derive from their health context)", "icon": "droplet"},
    {"name": "Movement goal from their body_care", "icon": "activity"},
    {"name": "Self-care from their self_care_practice", "icon": "heart"}
  ],
  "weekly_plan": [
    {"day": "Mon", "activity": "Focused deep work on primary goal (2-3 hours)"},
    {"day": "Tue", "activity": "Skill building session with measurable output"},
    {"day": "Wed", "activity": "Mid-week progress check, practice session"},
    {"day": "Thu", "activity": "Network/community engagement or mentorship"},
    {"day": "Fri", "activity": "Project work and weekly milestone completion"},
    {"day": "Sat", "activity": "Rest, social activities, light review"},
    {"day": "Sun", "activity": "Weekly reflection, planning next week's priorities"}
  ],
  "habits": [
    {"name": "Primary habit from habits_focus", "current": 0, "target": 4, "unit": "days"},
    {"name": "Sleep", "value": "Based on sleep_definition", "icon": "moon"},
    {"name": "Water", "value": "2,000", "unit": "ml"}
  ],
  "focus_duration_minutes": 45,
  "identity_reflection": "Personalized reflection about who they're becoming based on identity_statement (1-2 sentences)",
  "quarter_goal": "Current quarter's goal from quarterly_goals explained in 1 sentence",
  "focus_block_duration": "Duration like '30-45 min' based on their daily_time_capacity",
  "focus_block_suggestion": "Why this duration works for them specifically (1 sentence)",
  "friction_insight": "Compassionate insight about their friction_triggers and how to handle them (1-2 sentences)",
  "identity_reinforcement": "Empowering message reinforcing their identity_statement (1 sentence)",
  "frictions_detector_message": "You are a [derived identity]. Stay on your path!",
  "micro_steps": [
    {"text": "Specific action toward their yearly_goal", "type": "goal"},
    {"text": "Action for their habits_focus", "type": "habit"},
    {"text": "Action for their body_care or health_focus", "type": "health"}
  ]
}

=== CRITICAL QUALITY REQUIREMENTS ===
1. Generate AT LEAST 4 weeks of detailed plans for EACH quarter (not just 2)
2. Every daily task MUST be different and progress logically
3. Include real-world resources, platforms, or tools relevant to their goal
4. Tasks should feel like advice from a real mentor in that specific field
5. focus_duration_minutes must be a number (extract from their daily_time_capacity text, default to 45 if unclear)
6. Return ONLY valid JSON, no markdown or extra text`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
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

  const insights = JSON.parse(cleanedText);

  // Ensure focus_duration_minutes is a number
  let focusDuration = 45;
  if (typeof insights.focus_duration_minutes === 'number') {
    focusDuration = insights.focus_duration_minutes;
  } else if (typeof insights.focus_duration_minutes === 'string') {
    const parsed = parseInt(insights.focus_duration_minutes, 10);
    if (!isNaN(parsed)) focusDuration = parsed;
  }

  // Transform micro_steps to include completed state and id
  const microSteps: MicroStep[] = (insights.micro_steps || []).map((step: { text: string; type: string }, index: number) => ({
    id: String(index + 1),
    text: step.text,
    type: step.type as MicroStep['type'],
    completed: false,
  }));

  return {
    identity_reflection: insights.identity_reflection || '',
    identity_summary: insights.identity_summary || '',
    quarter_goal: insights.quarter_goal || '',
    focus_block_duration: insights.focus_block_duration || '',
    focus_block_suggestion: insights.focus_block_suggestion || '',
    friction_insight: insights.friction_insight || '',
    identity_reinforcement: insights.identity_reinforcement || '',
    micro_steps: microSteps,
    identities: insights.identities || [],
    my_why: insights.my_why || '',
    yearly_goal_title: insights.yearly_goal_title || '',
    quarterly_goals: insights.quarterly_goals || [],
    your_why_detail: insights.your_why_detail || '',
    daily_non_negotiables: insights.daily_non_negotiables || [],
    weekly_plan: insights.weekly_plan || [],
    habits: insights.habits || [],
    focus_duration_minutes: focusDuration,
    frictions_detector_message: insights.frictions_detector_message || '',
    is_ai_generated: true,
    generated_at: new Date().toISOString(),
  };
}

export function useAIInsights(userId: string | undefined) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAligning, setIsAligning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache key for this user's insights
  const cacheKey = userId ? `aligned_insights_${userId}` : null;

  // Try to load cached insights immediately
  useEffect(() => {
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setInsights(parsed);
          setLoading(false);
          console.log('Loaded cached insights for user');
        }
      } catch (e) {
        console.warn('Failed to load cached insights:', e);
      }
    }
  }, [cacheKey]);

  const fetchInsights = useCallback(async (retryCount = 0, forceRefresh = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // If we already have cached insights and this isn't a force refresh, skip generation
    if (insights && !forceRefresh) {
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
        // Cache insights for instant loading on next login
        if (cacheKey) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(generatedInsights));
            console.log('Cached insights for user');
          } catch (e) {
            console.warn('Failed to cache insights:', e);
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
  }, [userId, isAligning, cacheKey, insights]);

  useEffect(() => {
    fetchInsights();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchInsights(0, true); // Force refresh
  }, [fetchInsights]);

  return { insights, loading: loading || isAligning, isAligning, error, refetch };
}
