import { createClient } from '@supabase/supabase-js';

// REPLACE THIS WITH YOUR ACTUAL SUPABASE PROJECT URL
// Example: https://xkyjafvsqw.supabase.co
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co'; 

const SUPABASE_KEY = 'sb_publishable_vwMziZtnW1yvlHcsunY74w_52GDl759';

let supabaseClient = null;

const isPlaceholderUrl = SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_URL');

if (isPlaceholderUrl) {
  console.warn('⚠️ Supabase Project URL is missing. App is running in offline fallback mode.');
  supabaseClient = null;
} else {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.warn("Failed to initialize Supabase client:", error);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient;
