import { createClient } from '@supabase/supabase-js';
require('dotenv').config();
const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase client for user authentication (with anon key)
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'];
if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key. Please check your environment variables.');
}

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

