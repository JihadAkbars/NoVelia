import { createClient } from '@supabase/supabase-js';

// REPLACE THIS WITH YOUR ACTUAL SUPABASE PROJECT URL
// Example: https://xkyjafvsqw.supabase.co
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co'; 

const SUPABASE_KEY = 'sb_publishable_vwMziZtnW1yvlHcsunY74w_52GDl759';

if (SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_URL')) {
  console.warn('⚠️ Supabase Project URL is missing. Please update services/supabaseClient.ts with your actual project URL.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});