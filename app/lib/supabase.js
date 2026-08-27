import { createClient } from '@supabase/supabase-js';
const supabaseUrl = "https://sgvojdgbjvynnoherpqj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNndm9qZGdianZ5bm5vaGVycHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE4ODIsImV4cCI6MjEwMTMxNzg4Mn0.RuAHGD0VCcDxIL4jfSFXjyiC4ZzVgRAZna3j80ovIf4";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
