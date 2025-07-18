// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fbqavmueexjlltbtdqcd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicWF2bXVlZXhqbGx0YnRkcWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMzU1NDAsImV4cCI6MjA2NzgxMTU0MH0.2uoKnf1oIqZG9h7TH3EPHLpelazb-Km0egL0vsZil5Y";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});