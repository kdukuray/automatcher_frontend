/**
 * Supabase client singleton.
 *
 * Initialises the Supabase JS client with the project URL and anonymous key
 * from environment variables. This client is used across the frontend for all
 * auth operations (signup, login, logout, session management) and is imported
 * by lib/api.ts to attach JWT tokens to Django API requests.
 *
 * The anon key is safe to expose in the browser — Supabase Row Level Security
 * (RLS) protects actual data access.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
