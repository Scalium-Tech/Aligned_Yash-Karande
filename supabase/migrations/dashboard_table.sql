-- Dashboard tables for Supabase
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. YEARLY GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.yearly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  my_why TEXT,
  your_why_detail TEXT,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, year)
);

-- ============================================
-- 2. QUARTERLY GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.quarterly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  yearly_goal_id UUID REFERENCES public.yearly_goals(id) ON DELETE CASCADE,
  quarter TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')) NOT NULL,
  goal TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, year, quarter)
);

-- ============================================
-- 3. USER IDENTITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_identities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'user',
  is_selected BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 4. CUSTOM WEEKLY PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan JSONB NOT NULL,  -- [{day: "Mon", activity: "..."}, ...]
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 5. AI INSIGHTS CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_insights_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insights JSONB NOT NULL,  -- Full AIInsights object
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.yearly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_cache ENABLE ROW LEVEL SECURITY;

-- Yearly goals policies
CREATE POLICY "Users can view their own yearly goals" ON public.yearly_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own yearly goals" ON public.yearly_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own yearly goals" ON public.yearly_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own yearly goals" ON public.yearly_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Quarterly goals policies
CREATE POLICY "Users can view their own quarterly goals" ON public.quarterly_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quarterly goals" ON public.quarterly_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quarterly goals" ON public.quarterly_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quarterly goals" ON public.quarterly_goals
  FOR DELETE USING (auth.uid() = user_id);

-- User identities policies
CREATE POLICY "Users can view their own identities" ON public.user_identities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own identities" ON public.user_identities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own identities" ON public.user_identities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own identities" ON public.user_identities
  FOR DELETE USING (auth.uid() = user_id);

-- Custom weekly plans policies
CREATE POLICY "Users can view their own weekly plans" ON public.custom_weekly_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weekly plans" ON public.custom_weekly_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weekly plans" ON public.custom_weekly_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- AI insights cache policies
CREATE POLICY "Users can view their own ai insights" ON public.ai_insights_cache
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ai insights" ON public.ai_insights_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ai insights" ON public.ai_insights_cache
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_yearly_goals_user_id ON public.yearly_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_yearly_goals_year ON public.yearly_goals(year);
CREATE INDEX IF NOT EXISTS idx_quarterly_goals_user_id ON public.quarterly_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_goals_yearly ON public.quarterly_goals(yearly_goal_id);
CREATE INDEX IF NOT EXISTS idx_user_identities_user_id ON public.user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_weekly_plans_user_id ON public.custom_weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_user_id ON public.ai_insights_cache(user_id);

-- ============================================
-- UPDATED_AT TRIGGER for yearly_goals
-- ============================================
CREATE OR REPLACE FUNCTION update_yearly_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_yearly_goals_updated_at
  BEFORE UPDATE ON public.yearly_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_yearly_goals_updated_at();
