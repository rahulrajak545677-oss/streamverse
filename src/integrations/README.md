# Provider integrations

StreamVerse currently ships **no provider catalog integrations**. Search covers the StreamVerse service directory only (`src/data/services.ts`).

If you add catalog search later, use only official, licensed APIs (for example the Spotify Web API or TMDB, each with its own terms and keys), keep secrets off the device (proxy through a Supabase Edge Function), and never scrape private endpoints, reverse engineer authenticated APIs, bypass DRM, or proxy protected media.
