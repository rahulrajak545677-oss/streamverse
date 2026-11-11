export type AuthLink =
  | { kind: "code"; code: string }
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  | { kind: "error"; message: string };

/** Parses a Supabase auth redirect (PKCE ?code=… or implicit #access_token=…). Returns null if neither. */
export function parseAuthLink(url: string | null | undefined): AuthLink | null {
  if (!url) return null;
  const hashIdx = url.indexOf("#");
  const base = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  const hash = hashIdx >= 0 ? url.slice(hashIdx + 1) : "";
  const qIdx = base.indexOf("?");
  const query = qIdx >= 0 ? base.slice(qIdx + 1) : "";
  const q = new URLSearchParams(query);
  const h = new URLSearchParams(hash);
  const get = (k: string) => q.get(k) ?? h.get(k);

  const err = get("error_description") ?? get("error");
  if (err) return { kind: "error", message: err.replace(/\+/g, " ") };
  const code = q.get("code");
  if (code) return { kind: "code", code };
  const at = h.get("access_token");
  const rt = h.get("refresh_token");
  if (at && rt) return { kind: "tokens", accessToken: at, refreshToken: rt };
  return null;
}
