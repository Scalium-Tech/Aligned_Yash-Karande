-- Focus Sessions tables for Supabase
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. FOCUS SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  duration INTEGER NOT NULL,  -- minutes focused
  completed BOOLEAN DEFAULT true,
  session_type TEXT CHECK (session_type IN ('focus', 'pomodoro')) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. FOCUS TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.focus_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,  -- estimated minutes
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_tasks ENABLE ROW LEVEL SECURITY;

-- Focus sessions policies
CREATE POLICY "Users can view their own focus sessions" ON public.focus_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus sessions" ON public.focus_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus sessions" ON public.focus_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own focus sessions" ON public.focus_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Focus tasks policies
CREATE POLICY "Users can view their own focus tasks" ON public.focus_tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus tasks" ON public.focus_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus tasks" ON public.focus_tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own focus tasks" ON public.focus_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_date ON public.focus_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON public.focus_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_focus_tasks_user_id ON public.focus_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_tasks_completed ON public.focus_tasks(completed);
