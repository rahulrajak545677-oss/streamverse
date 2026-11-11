import { supabase } from "./supabase";

export type Profile = { id: string; username: string | null; display_name: string | null };
export type RecentEntry = { service_id: string; opened_at: string };

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

// All queries are explicitly scoped by user_id as defence in depth; RLS enforces it server-side too.

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const rows = check(await supabase.from("favorites").select("service_id").eq("user_id", userId).order("created_at", { ascending: false }));
  return (rows ?? []).map(r => r.service_id as string);
}

export async function addFavorite(userId: string, serviceId: string): Promise<void> {
  const { error } = await supabase.from("favorites").upsert({ user_id: userId, service_id: serviceId }, { onConflict: "user_id,service_id", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

export async function removeFavorite(userId: string, serviceId: string): Promise<void> {
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("service_id", serviceId);
  if (error) throw new Error(error.message);
}

export async function fetchRecent(userId: string, limit = 20): Promise<RecentEntry[]> {
  const rows = check(await supabase.from("recent_activity").select("service_id, opened_at").eq("user_id", userId).order("opened_at", { ascending: false }).limit(limit));
  return (rows ?? []) as RecentEntry[];
}

/** Upserts one row per (user, service); newest open time wins. */
export async function recordOpen(serviceId: string): Promise<void> {
  const { error } = await supabase.rpc("record_service_open", { p_service_id: serviceId });
  if (error) throw new Error(error.message);
}

export async function clearRecent(userId: string): Promise<void> {
  const { error } = await supabase.from("recent_activity").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("id, username, display_name").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Profile | null) ?? null;
}

export async function updateProfile(userId: string, patch: { username: string | null; display_name: string | null }): Promise<void> {
  const { error } = await supabase.from("profiles").upsert({ id: userId, ...patch });
  if (error) throw new Error(error.message);
}

/** Calls the delete-account Edge Function (service-role key stays server-side). */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
  if (error) throw new Error(error.message);
  await supabase.auth.signOut();
}
