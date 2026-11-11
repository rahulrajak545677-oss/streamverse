const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

export const normalizeEmail = (v: string) => v.trim().toLowerCase();

export function validateEmail(v: string): string | null {
  const e = normalizeEmail(v);
  if (!e) return "Enter your email address.";
  if (e.length > 254 || !EMAIL_RE.test(e)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(v: string): string | null {
  if (!v) return "Enter a password.";
  if (v.length < 8) return "Password must be at least 8 characters.";
  if (v.length > 72) return "Password must be 72 characters or fewer.";
  if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return "Use at least one letter and one number.";
  return null;
}

/** Empty string is allowed (clears the username). */
export function validateUsername(v: string): string | null {
  const u = v.trim();
  if (!u) return null;
  if (!USERNAME_RE.test(u)) return "Username must be 3–24 letters, numbers or underscores.";
  return null;
}

export function validateDisplayName(v: string): string | null {
  const d = v.trim();
  if (!d) return null;
  if (d.length > 50) return "Display name must be 50 characters or fewer.";
  return null;
}
