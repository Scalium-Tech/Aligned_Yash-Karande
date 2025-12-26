import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrudchzkmeqeejhzhgzh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydWRjaHprbWVxZWVqaHpoZ3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjM5NzEsImV4cCI6MjA4MjAzOTk3MX0.l2aec8xjK0b3sauejCKpLyB23sIHLQnI-64WjCvgc7A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
