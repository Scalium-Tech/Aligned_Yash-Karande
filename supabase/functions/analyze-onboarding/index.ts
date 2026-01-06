import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      console.error('GOOGLE_API_KEY not configured');
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    const { userIdentity } = await req.json();
    console.log('Received user identity data:', JSON.stringify(userIdentity, null, 2));

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
5. For icons, use only: user, briefcase, target, graduation-cap, edit-3, moon, droplet, activity, heart, book, dumbbell
6. focus_duration_minutes must be a number (extract from their daily_time_capacity text, default to 45)
7. Return ONLY valid JSON, no markdown or extra text`;

    console.log('Calling Google Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${googleApiKey}`,
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
      console.error('Google Gemini API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 403) {
        return new Response(JSON.stringify({ error: 'API key invalid or unauthorized. Please check your Google API key.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Google Gemini response:', JSON.stringify(data, null, 2));

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('No generated text in response');
      throw new Error('No response generated');
    }

    // Parse the JSON from the response (handle potential markdown code blocks)
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

    // Mark as AI-generated
    insights.is_ai_generated = true;
    insights.generated_at = new Date().toISOString();

    console.log('Parsed insights:', JSON.stringify(insights, null, 2));

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-onboarding function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage, is_ai_generated: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
