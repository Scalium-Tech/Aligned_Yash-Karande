-- Feedback table for user testimonials
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  feedback TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (for anonymous users)
CREATE POLICY "Anyone can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read approved feedback (for testimonials section)
CREATE POLICY "Anyone can read approved feedback" ON public.feedback
  FOR SELECT USING (approved = true);

-- Create an index for faster queries on approved feedback
CREATE INDEX IF NOT EXISTS idx_feedback_approved ON public.feedback(approved);
