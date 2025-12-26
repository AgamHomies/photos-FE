import { createClient } from '@supabase/supabase-js';

// Dev Supabase defaults (override with .env for production)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ogumccqoiwgiwjqygxlg.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndW1jY3FvaXdnaXdqcXlneGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDM3NDksImV4cCI6MjA4MjMxOTc0OX0.sPikjNOtL7_WOu4YshSlkn5rlBf01j01AJbs31sc0Z4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
