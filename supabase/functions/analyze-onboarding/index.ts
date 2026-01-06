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

    const prompt = `You are a personal growth coach AI for "Aligned — Your All-In-One Personal OS." 

CRITICAL: Analyze the user's ACTUAL responses below and generate PERSONALIZED content based on THEIR specific words, goals, and context. Do NOT use generic templates.

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

=== GENERATION INSTRUCTIONS ===
Based on the user's ACTUAL responses above, create a fully personalized dashboard. Every field must directly reflect what the user wrote.

Generate a JSON response with this exact structure:

{
  "identities": [
    {"name": "First identity derived from their identity_statement", "icon": "user", "selected": false},
    {"name": "Second identity aspect from their statement", "icon": "briefcase", "selected": false},  
    {"name": "Primary identity focus from their statement", "icon": "target", "selected": true}
  ],
  "identity_summary": "A 1-sentence summary explaining who they are becoming based on their identity_statement",
  "my_why": "Condensed version of their purpose_why in max 8 words",
  "yearly_goal_title": "Their yearly_goal rewritten as a clear, actionable title",
  "quarterly_goals": [
    {"quarter": "Q1", "goal": "First quarter milestone toward their yearly_goal"},
    {"quarter": "Q2", "goal": "Second quarter milestone building on Q1"},
    {"quarter": "Q3", "goal": "Third quarter milestone advancing toward goal"},
    {"quarter": "Q4", "goal": "Final quarter milestone to achieve yearly_goal"}
  ],
  "your_why_detail": "1-2 sentence expansion of their purpose_why with emotional resonance",
  "daily_non_negotiables": [
    {"name": "Sleep goal extracted from their sleep_definition", "icon": "moon"},
    {"name": "Hydration goal (derive from their health context)", "icon": "droplet"},
    {"name": "Movement goal from their body_care", "icon": "activity"},
    {"name": "Self-care from their self_care_practice", "icon": "heart"}
  ],
  "weekly_plan": [
    {"day": "Mon", "activity": "Monday focus based on their goals and habits"},
    {"day": "Tue", "activity": "Tuesday focus activity"},
    {"day": "Wed", "activity": "Wednesday focus activity"},
    {"day": "Thu", "activity": "Thursday focus activity"},
    {"day": "Fri", "activity": "Friday focus activity"},
    {"day": "Sat", "activity": "Weekend activity for rest/reflection"},
    {"day": "Sun", "activity": "Sunday prep or rest activity"}
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

IMPORTANT RULES:
1. Every field MUST be derived from the user's actual responses - no generic content
2. Use their exact words and phrases where possible
3. If a field was "Not provided", make a reasonable inference from related fields
4. For icons, use only: user, briefcase, target, graduation-cap, edit-3, moon, droplet, activity, heart, book, dumbbell
5. focus_duration_minutes must be a number (extract from their daily_time_capacity text, default to 45)
6. Return ONLY valid JSON, no markdown or extra text`;

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
            maxOutputTokens: 2048,
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
