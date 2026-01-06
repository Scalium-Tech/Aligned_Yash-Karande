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
          "focus": "SPECIFIC weekly theme for week 14",
          "days": [
            {"day": "Mon", "task": "Specific task", "description": "Detailed description"},
            {"day": "Tue", "task": "Specific task", "description": "Detailed description"},
            {"day": "Wed", "task": "Specific task", "description": "Detailed description"},
            {"day": "Thu", "task": "Specific task", "description": "Detailed description"},
            {"day": "Fri", "task": "Specific task", "description": "Detailed description"},
            {"day": "Sat", "task": "Application task", "description": "Apply learning"},
            {"day": "Sun", "task": "Reflection", "description": "Review and plan"}
          ]
        },
        {"week": "Week 15", "focus": "Week 15 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 16", "focus": "Week 16 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 17", "focus": "Week 17 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 18", "focus": "Week 18 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 19", "focus": "Week 19 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 20", "focus": "Week 20 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 21", "focus": "Week 21 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 22", "focus": "Week 22 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 23", "focus": "Week 23 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 24", "focus": "Week 24 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 25", "focus": "Week 25 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 26", "focus": "Week 26 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]}
      ]
    },
    {
      "quarter": "Q3",
      "goal": "SPECIFIC Q3 milestone (advancing phase) - building on Q1+Q2 progress",
      "weeklyPlan": [
        {
          "week": "Week 27",
          "focus": "SPECIFIC weekly theme for week 27",
          "days": [
            {"day": "Mon", "task": "Specific task", "description": "Detailed description"},
            {"day": "Tue", "task": "Specific task", "description": "Detailed description"},
            {"day": "Wed", "task": "Specific task", "description": "Detailed description"},
            {"day": "Thu", "task": "Specific task", "description": "Detailed description"},
            {"day": "Fri", "task": "Specific task", "description": "Detailed description"},
            {"day": "Sat", "task": "Application task", "description": "Apply learning"},
            {"day": "Sun", "task": "Reflection", "description": "Review and plan"}
          ]
        },
        {"week": "Week 28", "focus": "Week 28 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 29", "focus": "Week 29 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 30", "focus": "Week 30 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 31", "focus": "Week 31 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 32", "focus": "Week 32 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 33", "focus": "Week 33 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 34", "focus": "Week 34 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 35", "focus": "Week 35 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 36", "focus": "Week 36 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 37", "focus": "Week 37 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 38", "focus": "Week 38 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 39", "focus": "Week 39 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]}
      ]
    },
    {
      "quarter": "Q4",
      "goal": "SPECIFIC Q4 milestone (completion phase) - achieving the yearly goal",
      "weeklyPlan": [
        {
          "week": "Week 40",
          "focus": "SPECIFIC weekly theme for week 40",
          "days": [
            {"day": "Mon", "task": "Specific task", "description": "Detailed description"},
            {"day": "Tue", "task": "Specific task", "description": "Detailed description"},
            {"day": "Wed", "task": "Specific task", "description": "Detailed description"},
            {"day": "Thu", "task": "Specific task", "description": "Detailed description"},
            {"day": "Fri", "task": "Specific task", "description": "Detailed description"},
            {"day": "Sat", "task": "Application task", "description": "Apply learning"},
            {"day": "Sun", "task": "Reflection", "description": "Review and plan"}
          ]
        },
        {"week": "Week 41", "focus": "Week 41 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 42", "focus": "Week 42 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 43", "focus": "Week 43 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 44", "focus": "Week 44 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 45", "focus": "Week 45 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 46", "focus": "Week 46 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 47", "focus": "Week 47 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 48", "focus": "Week 48 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 49", "focus": "Week 49 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 50", "focus": "Week 50 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 51", "focus": "Week 51 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]},
        {"week": "Week 52", "focus": "Week 52 theme", "days": [{"day": "Mon", "task": "Task", "description": "Desc"}, {"day": "Tue", "task": "Task", "description": "Desc"}, {"day": "Wed", "task": "Task", "description": "Desc"}, {"day": "Thu", "task": "Task", "description": "Desc"}, {"day": "Fri", "task": "Task", "description": "Desc"}, {"day": "Sat", "task": "Task", "description": "Desc"}, {"day": "Sun", "task": "Reflection", "description": "Plan"}]}
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
1. Generate ALL 13 weeks of detailed plans for EACH quarter:
   - Q1: Week 1 through Week 13 (foundation phase)
   - Q2: Week 14 through Week 26 (building phase)
   - Q3: Week 27 through Week 39 (advancing phase)
   - Q4: Week 40 through Week 52 (completion phase)
2. Every daily task MUST be different and progress logically throughout the quarter
3. Include real-world resources, platforms, or tools relevant to their goal
4. Tasks should feel like advice from a real mentor in that specific field
5. Each week must have a unique focus theme that builds on the previous week
6. For icons, use only: user, briefcase, target, graduation-cap, edit-3, moon, droplet, activity, heart, book, dumbbell
7. focus_duration_minutes must be a number (extract from their daily_time_capacity text, default to 45)
8. Return ONLY valid JSON, no markdown or extra text`;

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
            maxOutputTokens: 32768,
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
