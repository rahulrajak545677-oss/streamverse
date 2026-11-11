import type { StreamingService } from "../types/service";

// Official destinations only. Keep in sync with the seed in
// supabase/migrations/0001_streamverse_complete.sql (service ids are foreign keys).
export const services: StreamingService[] = [
  { id: "netflix", name: "Netflix", category: "Movies", categories: ["Movies", "TV Shows", "Anime"], icon: "N", website: "https://www.netflix.com/", appUrl: "nflx://www.netflix.com/", description: "Movies, series, anime and documentaries." },
  { id: "prime-video", name: "Prime Video", category: "Movies", categories: ["Movies", "TV Shows", "Anime"], icon: "P", website: "https://www.primevideo.com/", description: "Movies and series from Amazon." },
  { id: "jiohotstar", name: "JioHotstar", category: "Movies", categories: ["Movies", "TV Shows", "Live TV"], icon: "✦", website: "https://www.jiohotstar.com/", description: "Entertainment, sports and live programming in India." },
  { id: "youtube", name: "YouTube", category: "Video", categories: ["Video", "Live TV"], icon: "▶", website: "https://www.youtube.com/", appUrl: "youtube://", description: "Videos, creators and live streams." },
  { id: "vimeo", name: "Vimeo", category: "Video", categories: ["Video"], icon: "V", website: "https://vimeo.com/", appUrl: "vimeo://", description: "Creative video and filmmaker content." },
  { id: "spotify", name: "Spotify", category: "Music", categories: ["Music"], icon: "♫", website: "https://open.spotify.com/", appUrl: "spotify://", description: "Music, playlists and podcasts." },
  { id: "youtube-music", name: "YouTube Music", category: "Music", categories: ["Music"], icon: "♪", website: "https://music.youtube.com/", appUrl: "youtubemusic://", description: "Songs, music videos and mixes." },
  { id: "apple-music", name: "Apple Music", category: "Music", categories: ["Music"], icon: "♬", website: "https://music.apple.com/", appUrl: "music://", description: "Apple’s music streaming service." }
];

export const servicesById: Record<string, StreamingService> = Object.fromEntries(services.map(s => [s.id, s]));
export const getService = (id: string | undefined): StreamingService | undefined => (id ? servicesById[id] : undefined);

/** Shown in the Home "Featured" row. */
export const FEATURED_IDS = ["netflix", "youtube", "spotify", "prime-video", "youtube-music", "jiohotstar"] as const;
