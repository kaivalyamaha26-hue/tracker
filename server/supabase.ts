import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'psnbiesvvwbbemsjksly';
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://psnbiesvvwbbemsjksly.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_kVuHItuA-LYouLtYKHGz2A_xBkYcw1a';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
