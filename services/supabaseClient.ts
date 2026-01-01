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
// Using the keys provided by the user
const rawUrl = getEnv('REACT_APP_SUPABASE_URL') || 'https://cukaoncgoafbepvsnngi.supabase.co';
const rawKey = getEnv('REACT_APP_SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1a2FvbmNnb2FmYmVwdnNubmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTk1MzIsImV4cCI6MjA4Mjc5NTUzMn0.-wOmTFO7e-Q93XEYLrgDtNoGqWMOrXMS8ahsbU_zAaQ';

// Clean keys to ensure no whitespace issues
const SUPABASE_URL = rawUrl.trim();
const SUPABASE_KEY = rawKey.trim();

let supabaseClient = null;

try {
  // Check if URL is valid
  const isValidUrl = SUPABASE_URL && SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes('YOUR_SUPABASE');

  if (!isValidUrl) {
    console.warn('⚠️ Supabase URL is invalid. App running in Offline/Local Storage mode.');
    supabaseClient = null;
  } else {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log("Supabase client initialized successfully");
  }
} catch (error) {
  console.warn("Failed to initialize Supabase client (using offline mode):", error);
  supabaseClient = null;
}

export const supabase = supabaseClient;
