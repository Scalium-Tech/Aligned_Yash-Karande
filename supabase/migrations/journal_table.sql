-- Journal & AI Features tables for Supabase
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- 1. JOURNAL ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_summary TEXT,
  polished_content TEXT,
  mood TEXT CHECK (mood IN ('great', 'okay', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, entry_date)
);

-- ============================================
-- 2. BRAIN DUMPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.brain_dumps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  organized_content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 3. AI GUIDANCE CHATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_guidance_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 4. WEEKLY SUMMARIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,  -- Monday of the week
  ai_summary TEXT NOT NULL,
  total_focus_minutes INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  journal_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, week_start)
);

-- ============================================
-- 5. AI INSIGHTS TABLE (Smart Insights cache)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_date DATE NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, insight_date)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_guidance_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Brain dumps policies
CREATE POLICY "Users can view their own brain dumps" ON public.brain_dumps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own brain dumps" ON public.brain_dumps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brain dumps" ON public.brain_dumps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brain dumps" ON public.brain_dumps
  FOR DELETE USING (auth.uid() = user_id);

-- AI guidance chats policies
CREATE POLICY "Users can view their own ai guidance chats" ON public.ai_guidance_chats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ai guidance chats" ON public.ai_guidance_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ai guidance chats" ON public.ai_guidance_chats
  FOR DELETE USING (auth.uid() = user_id);

-- Weekly summaries policies
CREATE POLICY "Users can view their own weekly summaries" ON public.weekly_summaries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weekly summaries" ON public.weekly_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weekly summaries" ON public.weekly_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- AI insights policies
CREATE POLICY "Users can view their own ai insights" ON public.ai_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ai insights" ON public.ai_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ai insights" ON public.ai_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_brain_dumps_user_id ON public.brain_dumps(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_dumps_created ON public.brain_dumps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_guidance_chats_user_id ON public.ai_guidance_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_guidance_chats_created ON public.ai_guidance_chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_id ON public.weekly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week ON public.weekly_summaries(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_date ON public.ai_insights(insight_date DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_updated_at();
