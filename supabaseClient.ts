
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zsqhpscvlqmarqxnerql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzcWhwc2N2bHFtYXJxeG5lcnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTIzMzUsImV4cCI6MjA4MjgyODMzNX0.t1RqUyshVRbcHm7f0wOlAqB6ICcwWPv9iRBwjo0JPak';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL Schema for Reference:
 * 
 * create table stories (
 *   id uuid default uuid_generate_v4() primary key,
 *   title text not null,
 *   genre text,
 *   synopsis text,
 *   author_bio text,
 *   cover_url text,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * create table chapters (
 *   id uuid default uuid_generate_v4() primary key,
 *   story_id uuid references stories(id) on delete cascade,
 *   title text not null,
 *   content text not null,
 *   order_index integer not null,
 *   created_at timestamp with time zone default now()
 * );
 */
