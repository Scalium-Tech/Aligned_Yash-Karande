-- Analytics tables for Supabase
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. DAILY ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  focus_sessions INTEGER DEFAULT 0,
  focus_minutes INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  habits_total INTEGER DEFAULT 0,
  mood_checkin TEXT CHECK (mood_checkin IN ('great', 'okay', 'low')),
  energy_checkin TEXT CHECK (energy_checkin IN ('high', 'medium', 'low')),
  challenge_check_ins INTEGER DEFAULT 0,
  active_challenges INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, activity_date)
);

-- ============================================
-- 2. WEEKLY ANALYTICS TABLE (cached insights)
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,  -- Monday of the week
  ai_summary TEXT,           -- AI-generated weekly summary
  productivity_score INTEGER DEFAULT 0,
  total_challenges INTEGER DEFAULT 0,
  total_quarterly INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0,
  total_focus_mins INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  total_habits INTEGER DEFAULT 0,
  day_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, week_start)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_analytics ENABLE ROW LEVEL SECURITY;

-- Daily activities policies
CREATE POLICY "Users can view their own daily activities" ON public.daily_activities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily activities" ON public.daily_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily activities" ON public.daily_activities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily activities" ON public.daily_activities
  FOR DELETE USING (auth.uid() = user_id);

-- Weekly analytics policies
CREATE POLICY "Users can view their own weekly analytics" ON public.weekly_analytics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weekly analytics" ON public.weekly_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weekly analytics" ON public.weekly_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_id ON public.daily_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_date ON public.daily_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date ON public.daily_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_weekly_analytics_user_id ON public.weekly_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_analytics_week ON public.weekly_analytics(week_start DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_daily_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_activities_updated_at
  BEFORE UPDATE ON public.daily_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_activities_updated_at();
