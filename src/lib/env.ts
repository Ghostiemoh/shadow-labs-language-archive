// Public values. Safe in the browser: row level security in the database controls access.
// Environment variables override them (e.g. for a staging database).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://asbxctqqtrkjkorgksfe.supabase.co";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_zwC6BXW_83yIqzW479pQiA_HjuZZ0nW";
