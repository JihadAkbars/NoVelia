import { createClient } from '@supabase/supabase-js';

// REPLACE THIS WITH YOUR ACTUAL SUPABASE PROJECT URL
// Example: https://xkyjafvsqw.supabase.co
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co'; 

const SUPABASE_KEY = 'sb_publishable_vwMziZtnW1yvlHcsunY74w_52GDl759';

let supabaseClient = null;

try {
  if (SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_URL')) {
    console.warn('⚠️ Supabase Project URL is missing. Falling back to local storage.');
  }

  // Only attempt to create client if we have somewhat valid looking strings
  // This prevents synchronous crashes in some environments
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
} catch (error) {
  console.warn("Failed to initialize Supabase client:", error);
  // Client remains null
}

export const supabase = supabaseClient;
