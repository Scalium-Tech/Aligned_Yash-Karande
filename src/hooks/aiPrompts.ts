/**
 * AI Prompts Configuration
 * 
 * Centralized location for all AI prompt templates.
 * Edit these prompts without touching business logic.
 * 
 * To modify AI behavior:
 * 1. Edit the prompt template in this file
 * 2. Rebuild and redeploy
 * 
 * Future enhancement: These could be loaded from a database or remote config
 * for runtime updates without redeploying.
 */

import type { UserIdentity } from './useAIInsights';

/**
 * Gemini API configuration
 * 
 * These settings control the AI model behavior and output characteristics.
 * Modify these values to tune the AI response quality and cost tradeoffs.
 */
export const GEMINI_CONFIG = {
  /** The Gemini model version to use.
   *  'gemini-3-flash-preview' - Fast, cost-effective model suitable for structured output generation */
  model: 'gemini-3-flash-preview',

  /** Controls randomness in AI output (0.0 = deterministic, 1.0 = very creative).
   *  0.7 balances creativity with consistency for personalized planning content. */
  temperature: 0.7,

  /** Maximum tokens (words/pieces) the model can generate in one response.
   *  32768 (~24K words) is needed because we generate a full 52-week yearly plan
   *  with daily tasks for each week. Smaller values would truncate the plan. */
  maxOutputTokens: 32768,

  /** Base URL for Gemini API. The model name and API key are appended at runtime. */
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

/**
 * Build the user context section of the prompt from their onboarding responses
 */
function buildUserContextSection(identity: UserIdentity): string {
  return `=== USER'S ACTUAL ONBOARDING RESPONSES ===
- Identity Statement: "${identity.identity_statement || 'Not provided'}"
- Purpose/Why: "${identity.purpose_why || 'Not provided'}"
- Yearly Goal: "${identity.yearly_goal || 'Not provided'}"
- Daily Time Capacity: "${identity.daily_time_capacity || 'Not provided'}"
- Sleep Definition: "${identity.sleep_definition || 'Not provided'}"
- Body Care: "${identity.body_care || 'Not provided'}"
- Self Care Practice: "${identity.self_care_practice || 'Not provided'}"
- Habits Focus: "${identity.habits_focus || 'Not provided'}"
- Health Focus: "${identity.health_focus || 'Not provided'}"
- Friction Triggers: "${identity.friction_triggers || 'Not provided'}"`;
}

/**
 * System instructions for the AI - defines its role and behavior
 */
const SYSTEM_INSTRUCTIONS = `You are an EXPERT career mentor and personal growth coach AI for "AlignedOS — Your All-In-One Personal OS."

CRITICAL MISSION: Generate a REALISTIC, CAREER-AWARE, ACTIONABLE yearly and quarterly execution plan that feels like it was created by a real mentor in the user's field.`;

/**
 * Planning rules that the AI must follow
 */
const PLANNING_RULES = `=== STRICT PLANNING RULES ===
1. Classify the goal type: career, skill-based, academic, health, or personal development
2. Each quarter MUST have a DIFFERENT focus building progressively toward the yearly goal
3. Each week within a quarter MUST have a DIFFERENT focus theme
4. Each day (Mon-Sun) MUST have a UNIQUE, SPECIFIC, actionable task
5. NEVER use vague phrases like "research", "watch tutorials", "practice basics"
6. ALWAYS specify WHAT to do, WHERE (platform/resource), and WHY it matters`;

/**
 * Examples of good vs bad task formatting
 */
const TASK_EXAMPLES = `=== EXAMPLE OF QUALITY DAILY TASKS ===
❌ BAD: "Research materials", "Watch tutorials", "Practice skills"
✅ GOOD: "Study the official certification syllabus from [official source] and create a 12-week study schedule"
✅ GOOD: "Complete Module 1 of [specific course] on [platform], take notes on [specific topic]"
✅ GOOD: "Build a simple [specific project type] using [specific technology] to practice [specific skill]"`;

/**
 * JSON response schema that the AI must follow
 * CRITICAL: The schema explicitly requires full weeklyPlan for ALL quarters
 */
const JSON_RESPONSE_SCHEMA = `=== GENERATE JSON RESPONSE ===

CRITICAL REQUIREMENT: You MUST generate COMPLETE, DETAILED weeklyPlan arrays for ALL 4 quarters (Q1, Q2, Q3, Q4).
Each quarter MUST have EXACTLY 13 weeks with specific, unique tasks for each of the 7 days.
DO NOT abbreviate Q2, Q3, or Q4. They need the SAME level of detail as Q1.

{
  "identities": [
    {"name": "First identity derived from their identity_statement", "icon": "user", "selected": false},
    {"name": "Second identity aspect from their statement", "icon": "briefcase", "selected": false},  
    {"name": "Primary identity focus from their statement", "icon": "target", "selected": true}
  ],
  "identity_summary": "A 1-sentence summary explaining who they are becoming",
  "my_why": "Condensed version of their purpose_why in max 8 words",
  "yearly_goal_title": "Their yearly_goal rewritten as a clear, measurable title",
  "quarterly_goals": [
    {
      "quarter": "Q1",
      "goal": "Q1 milestone (foundation phase) - specific, measurable outcome",
      "weeklyPlan": [
        {
          "week": "Week 1",
          "focus": "Unique theme for this week",
          "days": [
            {"day": "Mon", "task": "SPECIFIC task title", "description": "Detailed: what exactly to do, which resources to use, expected outcome"},
            {"day": "Tue", "task": "DIFFERENT specific task", "description": "Detailed action with clear deliverable"},
            {"day": "Wed", "task": "DIFFERENT specific task", "description": "Detailed action"},
            {"day": "Thu", "task": "DIFFERENT specific task", "description": "Detailed action"},
            {"day": "Fri", "task": "DIFFERENT specific task", "description": "Detailed action"},
            {"day": "Sat", "task": "Application/practice", "description": "Apply learning practically"},
            {"day": "Sun", "task": "Reflection", "description": "Review and plan next week"}
          ]
        }
        // GENERATE ALL 13 WEEKS (Week 1 through Week 13) with same structure
      ]
    },
    {
      "quarter": "Q2",
      "goal": "Q2 milestone (building phase) - different from Q1, more advanced",
      "weeklyPlan": [
        // REQUIRED: Generate COMPLETE weeks 14-26, each with SPECIFIC tasks
        // DO NOT use placeholders like "..." - generate real, specific tasks
        {
          "week": "Week 14",
          "focus": "New theme building on Q1 knowledge",
          "days": [
            {"day": "Mon", "task": "SPECIFIC Q2 task", "description": "More advanced than Q1 tasks"},
            {"day": "Tue", "task": "DIFFERENT task", "description": "Building on previous learning"},
            // ... all 7 days with REAL tasks
          ]
        }
        // ... all weeks 14-26 with full detail
      ]
    },
    {
      "quarter": "Q3",
      "goal": "Q3 milestone (advancing phase) - building mastery",
      "weeklyPlan": [
        // REQUIRED: Generate COMPLETE weeks 27-39, each with SPECIFIC tasks
        // Tasks should reflect progression from Q1 and Q2
      ]
    },
    {
      "quarter": "Q4",
      "goal": "Q4 milestone (completion phase) - achieving the yearly goal",
      "weeklyPlan": [
        // REQUIRED: Generate COMPLETE weeks 40-52, each with SPECIFIC tasks
        // Final push toward goal achievement
      ]
    }
  ],
  "your_why_detail": "1-2 sentence expansion of their purpose with emotional resonance",
  "daily_non_negotiables": [
    {"name": "Sleep goal from their input", "icon": "moon"},
    {"name": "Hydration goal", "icon": "droplet"},
    {"name": "Movement goal from body_care", "icon": "activity"},
    {"name": "Self-care practice", "icon": "heart"}
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
  "identity_reflection": "Personalized reflection about who they're becoming (1-2 sentences)",
  "quarter_goal": "Current quarter's goal explained in 1 sentence",
  "focus_block_duration": "Duration like '30-45 min' based on their capacity",
  "focus_block_suggestion": "Why this duration works for them (1 sentence)",
  "friction_insight": "Compassionate insight about their friction_triggers (1-2 sentences)",
  "identity_reinforcement": "Empowering message reinforcing their identity (1 sentence)",
  "frictions_detector_message": "You are a [derived identity]. Stay on your path!",
  "micro_steps": [
    {"text": "Specific action toward their yearly_goal", "type": "goal"},
    {"text": "Action for their habits_focus", "type": "habit"},
    {"text": "Action for their health_focus", "type": "health"}
  ]
}`;

/**
 * Quality requirements that the AI must meet
 */
const QUALITY_REQUIREMENTS = `=== CRITICAL QUALITY REQUIREMENTS ===

MOST IMPORTANT - FULL QUARTERLY PLANS:
You MUST generate COMPLETE weeklyPlan arrays for ALL 4 quarters. Each quarter needs:
- EXACTLY 13 weeks of detailed plans
- Each week has 7 days with UNIQUE, SPECIFIC tasks
- Q2, Q3, Q4 need the SAME detail level as Q1 (not abbreviated!)

Task Quality Rules:
1. NEVER use generic phrases like "Research materials", "Watch tutorials", "Practice skills"
2. ALWAYS specify exactly WHAT to do, WHERE (specific platform/resource), and WHY
3. Each week's tasks should BUILD on previous weeks - show clear progression
4. Include real-world resources: course names, book titles, specific platforms
5. Tasks should feel like advice from a real mentor in that field

Examples of GOOD vs BAD tasks:
❌ BAD: "Research study materials" 
✅ GOOD: "Read chapters 1-3 of 'Clean Code' by Robert Martin, take notes on naming conventions"

❌ BAD: "Watch tutorials/courses"
✅ GOOD: "Complete week 1 of CS50x on edX, submit Problem Set 0 (Scratch project)"

❌ BAD: "Practice skills"
✅ GOOD: "Build a simple calculator app using React, implement add/subtract/multiply/divide"

Week Number Rules:
- Q1: Week 1 through Week 13 (foundation phase)
- Q2: Week 14 through Week 26 (building phase)  
- Q3: Week 27 through Week 39 (advancing phase)
- Q4: Week 40 through Week 52 (completion phase)

Other Requirements:
- focus_duration_minutes must be a number (default 45)
- Return ONLY valid JSON, no markdown or extra text`;

/**
 * Build the complete AI insights prompt for a user
 * 
 * @param userIdentity - The user's onboarding responses
 * @returns Complete prompt string for the Gemini API
 */
export function buildInsightsPrompt(userIdentity: UserIdentity): string {
  return [
    SYSTEM_INSTRUCTIONS,
    '',
    buildUserContextSection(userIdentity),
    '',
    PLANNING_RULES,
    '',
    TASK_EXAMPLES,
    '',
    JSON_RESPONSE_SCHEMA,
    '',
    QUALITY_REQUIREMENTS,
  ].join('\n');
}

/**
 * Build the Gemini API endpoint URL
 */
export function getGeminiEndpoint(apiKey: string): string {
  return `${GEMINI_CONFIG.apiEndpoint}/${GEMINI_CONFIG.model}:generateContent?key=${apiKey}`;
}

/**
 * Build the request body for the Gemini API
 */
export function buildGeminiRequestBody(prompt: string): object {
  return {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: GEMINI_CONFIG.temperature,
      maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
    }
  };
}
