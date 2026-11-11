export type RecentItem = { service_id: string; opened_at: string };

/** Moves/adds a service to the front with a new timestamp. One entry per service; capped length. */
export function upsertRecent(list: readonly RecentItem[], serviceId: string, nowIso: string, max = 50): RecentItem[] {
  return [{ service_id: serviceId, opened_at: nowIso }, ...list.filter(r => r.service_id !== serviceId)].slice(0, max);
}

export function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter(x => x !== id) : [id, ...ids];
}
