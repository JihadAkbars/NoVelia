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
const rawUrl = getEnv('REACT_APP_SUPABASE_URL') || 'https://cukaoncgoafbepvsnngi.supabase.co';
const rawKey = getEnv('REACT_APP_SUPABASE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1a2FvbmNnb2FmYmVwdnNubmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTk1MzIsImV4cCI6MjA4Mjc5NTUzMn0.-wOmTFO7e-Q93XEYLrgDtNoGqWMOrXMS8ahsbU_zAaQ';

const SUPABASE_URL = rawUrl ? rawUrl.trim() : '';
const SUPABASE_KEY = rawKey ? rawKey.trim() : '';

let supabaseClient = null;

try {
  const isValidUrl = SUPABASE_URL && SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes('YOUR_SUPABASE');

  if (!isValidUrl) {
    console.warn('[NoVelia] Supabase URL is invalid or missing. Falling back to local storage mode.');
    supabaseClient = null;
  } else {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: { 'x-application-name': 'novelia' },
      }
    });
    console.log("[NoVelia] Supabase client initialized.");
  }
} catch (error) {
  console.error("[NoVelia] Supabase initialization failed:", error);
  supabaseClient = null;
}

export const supabase = supabaseClient;
