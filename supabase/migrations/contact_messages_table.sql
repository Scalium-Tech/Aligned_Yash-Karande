-- Contact Messages table for contact form submissions
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert contact messages (for visitors)
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read messages (you can customize this)
-- For now, we allow insert only
-- CREATE POLICY "Admins can read messages" ON public.contact_messages
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
