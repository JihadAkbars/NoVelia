import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION INSTRUCTIONS ---
// 1. Go to Supabase Dashboard -> Project Settings -> API
// 2. Copy "Project URL" and paste it into SUPABASE_URL below
// 3. Copy "anon public" key and paste it into SUPABASE_KEY below

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://cukaoncgoafbepvsnngi.supabase.co'; 
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1a2FvbmNnb2FmYmVwdnNubmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTk1MzIsImV4cCI6MjA4Mjc5NTUzMn0.-wOmTFO7e-Q93XEYLrgDtNoGqWMOrXMS8ahsbU_zAaQ';

let supabaseClient = null;

try {
  // Check if URL is still the default placeholder
  const isPlaceholderUrl = !SUPABASE_URL || SUPABASE_URL.includes('https://cukaoncgoafbepvsnngi.supabase.co');

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
