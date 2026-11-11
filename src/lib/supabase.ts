import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** False when .env is missing; screens show a clear setup message instead of failing obscurely. */
export const isSupabaseConfigured = Boolean(url && anonKey && !url.includes("YOUR_PROJECT"));

// Only the public anon key is ever used here. RLS protects the data.
export const supabase = createClient(
  isSupabaseConfigured ? (url as string) : "https://not-configured.invalid",
  isSupabaseConfigured ? (anonKey as string) : "not-configured",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);
