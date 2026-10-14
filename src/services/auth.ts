import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isAuthConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// The placeholder keeps the module importable so the UI can show a setup error
// instead of crashing when a local .env file has not been created yet.
export const authClient = createClient(
  supabaseUrl || "https://missing-supabase-config.invalid",
  supabaseAnonKey || "missing-supabase-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);
