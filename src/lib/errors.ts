/** Converts any thrown/returned error into a short message safe to show users. */
export function friendlyError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const message = typeof err === "string" ? err : err && typeof err === "object" && "message" in err ? String((err as { message: unknown }).message) : "";
  const m = message.toLowerCase();
  if (m.includes("network request failed") || m.includes("failed to fetch") || m.includes("network error") || m.includes("timed out"))
    return "You appear to be offline. Check your connection and try again.";
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email address, then sign in.";
  if (m.includes("user already registered")) return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("duplicate key") && m.includes("username")) return "That username is already taken.";
  if (m.includes("profiles_username")) return "That username is not allowed or already taken.";
  if (m.includes("jwt") || m.includes("not authenticated")) return "Your session expired. Please sign in again.";
  return fallback;
}
