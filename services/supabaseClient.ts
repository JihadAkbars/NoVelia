import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars in browser without crashing
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) return process.env[key];
    // @ts-ignore
    if (typeof window !== 'undefined' && window.process && window.process.env) return window.process.env[key];
  } catch (e) {
    return undefined;
  }
  return undefined;
};

// --- CONFIGURATION ---
const SUPABASE_URL = getEnv('REACT_APP_SUPABASE_URL') || 'https://cukaoncgoafbepvsnngi.supabase.co'; 
const SUPABASE_KEY = getEnv('REACT_APP_SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1a2FvbmNnb2FmYmVwdnNubmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTk1MzIsImV4cCI6MjA4Mjc5NTUzMn0.-wOmTFO7e-Q93XEYLrgDtNoGqWMOrXMS8ahsbU_zAaQ';

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
