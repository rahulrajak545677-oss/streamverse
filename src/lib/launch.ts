import type { StreamingService } from "../types/service";

export type LinkOpener = { openURL(url: string): Promise<unknown> };
export type LaunchResult = { via: "app" | "web" };

/**
 * Opens a service on its official destination.
 * 1) If the provider has an official app URL scheme, try it (fails if the app is not installed).
 * 2) Otherwise, or if the app is missing, open the official https website.
 * Throws if neither can be opened, so the UI can show an error.
 * This never touches playback, DRM, accounts or subscriptions.
 */
export async function launchService(service: StreamingService, linking: LinkOpener): Promise<LaunchResult> {
  if (service.appUrl) {
    try {
      await linking.openURL(service.appUrl);
      return { via: "app" };
    } catch {
      // App not installed or scheme not handled: fall back to the website.
    }
  }
  await linking.openURL(service.website);
  return { via: "web" };
}
