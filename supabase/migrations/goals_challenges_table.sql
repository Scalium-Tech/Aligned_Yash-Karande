-- Goals & Challenges tables for tracking user challenges and badges
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Challenge check-ins table (one per day per challenge)
CREATE TABLE IF NOT EXISTS public.challenge_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(challenge_id, check_in_date)
);

-- User badges table (earned achievements)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,  -- matches frontend badge definitions like 'first-step', 'week-warrior'
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Enable Row Level Security
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Users can view their own challenges" ON public.challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" ON public.challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" ON public.challenges
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for challenge_check_ins
CREATE POLICY "Users can view their own check-ins" ON public.challenge_check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins" ON public.challenge_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins" ON public.challenge_check_ins
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON public.challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_check_ins_challenge_id ON public.challenge_check_ins(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_check_ins_user_id ON public.challenge_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_check_ins_date ON public.challenge_check_ins(check_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
