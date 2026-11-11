export const CATEGORIES = ["Movies", "TV Shows", "Music", "Anime", "Live TV", "Video"] as const;
export type ServiceCategory = (typeof CATEGORIES)[number];

export type StreamingService = {
  id: string;
  name: string;
  /** Primary category (matches services.category in the database). */
  category: ServiceCategory;
  /** All categories this service is listed under. */
  categories: readonly ServiceCategory[];
  icon: string;
  /** Official website. Always https. Used as the fallback destination. */
  website: string;
  /**
   * Optional official app URL scheme. Only set where the provider documents
   * or widely supports it. When absent, the https website is opened and the OS
   * may hand it to the installed official app via universal/app links.
   */
  appUrl?: string;
  description: string;
};
