# StreamVerse

A futuristic streaming **hub** (React Native + Expo SDK 54 + TypeScript + Supabase). StreamVerse opens the **official** apps and websites of streaming providers. It does not stream, scrape, proxy or bypass any provider's subscription, DRM or sign-in.

Supported destinations: Netflix, Prime Video, YouTube, YouTube Music, Spotify, Apple Music, Vimeo, JioHotstar.

## Verification status (read this first)

This code was written and syntax-checked in an environment **without network access**. Dependencies could not be installed, so the following have **NOT** been run:
`npm install`, `tsc` against the full project, `expo lint`, the Jest suite under `jest-expo`, the app on a device/emulator, the SQL against a real Supabase project, the Edge Function, and any EAS build (APK, AAB, iOS).

What *was* verified: all 40 TS/TSX files parse without syntax errors; the pure logic modules (`src/lib/*`, `src/data/services.ts`) pass a strict TypeScript check; 8 logic tests pass (run with Node's built-in TypeScript support). Run the checks below on your machine before trusting a build.

## 1. Setup

```bash
npm install                 # commit the generated package-lock.json (CI uses `npm ci` when present)
cp .env.example .env        # then fill in your Supabase URL + anon key
npm run typecheck && npm run lint && npm test
npx expo start
```

## 2. Supabase

1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/migrations/0001_streamverse_complete.sql` (safe to re-run). It creates `profiles`, `services`, `favorites`, `recent_activity`, constraints, indexes, RLS policies, the signup trigger and `record_service_open()`.
3. Authentication → URL Configuration → **Redirect URLs**: add `streamverse://reset-password` (and the `exp://…/--/reset-password` URL shown in Expo Go if you test there).
4. Authentication → Providers → Email: decide whether "Confirm email" is on. The app handles both.
5. Deploy account deletion (needs the [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase login && supabase link --project-ref YOUR_REF
   supabase functions deploy delete-account
   ```
   Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` into the function. **The service-role key is never placed in the app.**

## 3. Features

Auth (register, login, logout, session persistence, password reset, route guards), Home dashboard, Search, Explore (Movies / TV Shows / Music / Anime / Live TV / Video), service detail with official app/website launch, Saved (Supabase), Recent activity with clear history, Profile (edit details, privacy, version, delete account).

**Search scope:** it searches the StreamVerse service directory only. No external catalog API is integrated, so no API keys are needed. See `src/integrations/README.md` before adding one.

**Deep links:** an official app URL scheme is used for Netflix, YouTube, YouTube Music, Spotify, Apple Music and Vimeo; if the app is missing the official website opens. Prime Video and JioHotstar open their official websites (no app scheme is set; the OS may hand the link to the installed app). Every scheme must be verified on real Android and iOS devices.

## 4. Builds (EAS)

```bash
npm i -g eas-cli && eas login && eas init     # links the project; may add extra.eas.projectId to app.json
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://YOUR_PROJECT.supabase.co --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY --visibility plaintext
# repeat both for --environment production
```

| Goal | Command | Output |
|---|---|---|
| Test APK | `npm run build:android` (profile `apk`) | `.apk` |
| Play Store bundle | `npm run build:android:aab` (profile `production`) | `.aab` |
| iOS | `npm run build:ios` (profile `production`) | `.ipa` |

Android application ID and iOS bundle identifier are both `com.streamverse.app`; display name is `StreamVerse`. The `environment` field in `eas.json` needs EAS CLI ≥ 16.

### iOS requirements
- Apple Developer Program membership (paid, USD 99/year).
- Bundle ID `com.streamverse.app` registered (EAS can do this on first build).
- First iOS build must be run interactively once (`eas build -p ios`) so EAS can create certificates/profiles; after that CI can reuse them.
- An App Store Connect app record for TestFlight/App Store (`eas submit -p ios`).
- iOS builds require EAS cloud (or a Mac); they cannot be built on Windows/Linux locally.

### Android release
Play Console developer account (one-time USD 25), a Play app record with the same package name, and `eas submit -p android` (needs a Google service-account key; keep it out of git).

## 5. GitHub Actions

- `.github/workflows/ci.yml` — on push/PR: install, `tsc`, lint, tests, Expo config check.
- `.github/workflows/eas-build.yml` — manual (Actions → EAS Build → Run workflow): builds an Android APK or AAB on EAS, downloads it and uploads it as a downloadable **artifact** (kept 14 days). The iOS option starts an EAS build only.

Repository secrets (Settings → Secrets and variables → Actions):

| Secret | Required for | How to get it |
|---|---|---|
| `EXPO_TOKEN` | EAS Build workflow | expo.dev → Account settings → Access tokens |

Supabase URL/anon key for builds live in **EAS environment variables** (section 4), not in GitHub. The workflow never echoes secrets. Never add the Supabase service-role key to GitHub or EAS for the app.

## 6. Feature checklist

| Feature | Implemented | Run/tested |
|---|---|---|
| Email/password sign-up, login, logout, session persistence | ✅ | ❌ needs device + Supabase |
| Password reset (email link → new password) | ✅ | ❌ |
| Protected routes / redirect to login | ✅ | ❌ |
| RLS on all tables, no client writes to `services` | ✅ SQL | ❌ not run against a database |
| Home (featured, recent, saved, categories, search access) | ✅ | ❌ |
| Search + category filters + empty states | ✅ | ✅ filtering logic only |
| Explore by category | ✅ | ❌ |
| Official launch with app→website fallback | ✅ | ✅ launcher logic only; ❌ real devices |
| Favorites in Supabase (no duplicates) | ✅ | ❌ |
| Recent activity (no duplicates, clear history) | ✅ | ✅ ordering logic only |
| Profile edit, privacy, version | ✅ | ❌ |
| Delete account (Edge Function, typed confirmation) | ✅ | ❌ not deployed |
| EAS profiles: APK, AAB, iOS | ✅ config | ❌ no build was run |
| GitHub Actions CI + APK artifact | ✅ | ❌ not executed |

## 7. Still requires you

Supabase project + keys; running the SQL; deploying the Edge Function; adding the redirect URL; an Expo account + `EXPO_TOKEN`; EAS env vars; Apple Developer account (iOS); Google Play account (store release); final brand artwork (current icons are placeholders); a privacy policy URL and store listings; verifying each deep link on real devices; committing `package-lock.json`.
