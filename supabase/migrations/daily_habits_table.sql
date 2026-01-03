-- Daily Habits table for storing Non-Negotiables and Health Objectives
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Main habits table (stores both non-negotiables and health objectives)
CREATE TABLE IF NOT EXISTS public.daily_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('non_negotiable', 'health_objective')),
  text TEXT NOT NULL,
  icon TEXT,                    -- for health objectives: droplets, moon, footprints, apple, dumbbell
  target_value TEXT,            -- for health objectives: "8 glasses", "7.5 hours", etc.
  personalized_tip TEXT,        -- for health objectives: AI-generated tip
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily completion logs table (tracks when habits are completed)
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.daily_habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(habit_id, completed_date) -- One completion per habit per day
);

-- Enable Row Level Security
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_habits
CREATE POLICY "Users can view their own habits" ON public.daily_habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" ON public.daily_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON public.daily_habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON public.daily_habits
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for habit_completions
CREATE POLICY "Users can view their own completions" ON public.habit_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON public.habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" ON public.habit_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions" ON public.habit_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_id ON public.daily_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_habits_type ON public.daily_habits(type);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON public.habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON public.habit_completions(completed_date DESC);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on daily_habits
CREATE TRIGGER update_daily_habits_updated_at
  BEFORE UPDATE ON public.daily_habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
