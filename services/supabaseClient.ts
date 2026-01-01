import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION INSTRUCTIONS ---
// 1. Go to Supabase Dashboard -> Project Settings -> API
// 2. Copy "Project URL" and paste it into SUPABASE_URL below
// 3. Copy "anon public" key and paste it into SUPABASE_KEY below

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co'; 
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;

try {
  // Check if URL is still the default placeholder
  const isPlaceholderUrl = !SUPABASE_URL || SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_URL');

  if (isPlaceholderUrl) {
    console.warn('⚠️ Supabase URL not set. App running in Offline/Local Storage mode.');
    supabaseClient = null;
  } else {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
} catch (error) {
  console.warn("Failed to initialize Supabase client (using offline mode):", error);
  supabaseClient = null;
}

export const supabase = supabaseClient;
