import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { addFavorite, clearRecent, fetchFavoriteIds, fetchRecent, recordOpen, removeFavorite, type RecentEntry } from "@/lib/api";
import { friendlyError } from "@/lib/errors";
import { toggleId, upsertRecent } from "@/lib/recent";

type Status = "loading" | "ready" | "error";
type Value = {
  status: Status; error: string | null;
  favoriteIds: string[]; favoriteSet: ReadonlySet<string>; recent: RecentEntry[];
  refresh: () => Promise<void>;
  /** Resolves to an error message, or null on success. */
  toggleFavorite: (serviceId: string) => Promise<string | null>;
  trackOpen: (serviceId: string) => void;
  clearHistory: () => Promise<string | null>;
};

const Ctx = createContext<Value | null>(null);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const favRef = useRef<string[]>([]);
  favRef.current = favoriteIds;

  const refresh = useCallback(async () => {
    if (!userId) { setFavoriteIds([]); setRecent([]); setStatus("ready"); setError(null); return; }
    setStatus(s => (s === "ready" ? s : "loading"));
    try {
      const [favs, rec] = await Promise.all([fetchFavoriteIds(userId), fetchRecent(userId)]);
      setFavoriteIds(favs); setRecent(rec); setError(null); setStatus("ready");
    } catch (e) {
      setError(friendlyError(e, "Could not load your saved services and activity.")); setStatus("error");
    }
  }, [userId]);

  // Reload whenever the signed-in user changes (also clears the previous user's data on logout).
  useEffect(() => { setFavoriteIds([]); setRecent([]); setStatus("loading"); void refresh(); }, [refresh]);

  const toggleFavorite = useCallback(async (serviceId: string) => {
    if (!userId) return "Please sign in again.";
    const before = favRef.current;
    const adding = !before.includes(serviceId);
    setFavoriteIds(toggleId(before, serviceId)); // optimistic
    try {
      if (adding) await addFavorite(userId, serviceId); else await removeFavorite(userId, serviceId);
      return null;
    } catch (e) {
      setFavoriteIds(before); // roll back
      return friendlyError(e, adding ? "Could not save this service." : "Could not remove this service.");
    }
  }, [userId]);

  const trackOpen = useCallback((serviceId: string) => {
    if (!userId) return;
    setRecent(prev => upsertRecent(prev, serviceId, new Date().toISOString()));
    recordOpen(serviceId).catch(() => { /* history is best-effort; never block opening a service */ });
  }, [userId]);

  const clearHistory = useCallback(async () => {
    if (!userId) return "Please sign in again.";
    try { await clearRecent(userId); setRecent([]); return null; }
    catch (e) { return friendlyError(e, "Could not clear your history."); }
  }, [userId]);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const value = useMemo<Value>(() => ({ status, error, favoriteIds, favoriteSet, recent, refresh, toggleFavorite, trackOpen, clearHistory }),
    [status, error, favoriteIds, favoriteSet, recent, refresh, toggleFavorite, trackOpen, clearHistory]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUserData(): Value {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUserData must be used inside UserDataProvider");
  return v;
}
