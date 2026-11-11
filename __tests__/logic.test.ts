import assert from "node:assert/strict";
import { services, getService } from "../src/data/services";
import { CATEGORIES } from "../src/types/service";
import { filterServices, countByCategory } from "../src/lib/search";
import { validateEmail, validatePassword, validateUsername, validateDisplayName } from "../src/lib/validation";
import { launchService } from "../src/lib/launch";
import { friendlyError } from "../src/lib/errors";
import { parseAuthLink } from "../src/lib/authLink";
import { upsertRecent, toggleId } from "../src/lib/recent";
import { timeAgo } from "../src/lib/time";

test("directory: unique ids, https websites, valid categories", () => {
  assert.equal(new Set(services.map(s => s.id)).size, services.length);
  for (const s of services) {
    assert.ok(s.website.startsWith("https://"), s.id);
    assert.ok(s.categories.includes(s.category), s.id);
    for (const c of s.categories) assert.ok((CATEGORIES as readonly string[]).includes(c), s.id);
  }
  for (const id of ["netflix","prime-video","youtube","youtube-music","spotify","apple-music","vimeo","jiohotstar"]) assert.ok(getService(id), id);
});

test("search: name, category filter, no fake results", () => {
  assert.deepEqual(filterServices(services, "spot").map(s => s.id), ["spotify"]);
  assert.ok(filterServices(services, "", "Music").every(s => s.categories.includes("Music")));
  assert.equal(filterServices(services, "zzzzqqq").length, 0);
  assert.equal(filterServices(services, "  NETFLIX ").length, 1);
  assert.ok(filterServices(services, "", "Anime").length > 0);
  assert.equal(countByCategory(services, CATEGORIES).length, CATEGORIES.length);
});

test("validation", () => {
  assert.equal(validateEmail("a@b.co"), null);
  assert.ok(validateEmail("nope"));
  assert.ok(validateEmail(""));
  assert.equal(validatePassword("abcdef12"), null);
  assert.ok(validatePassword("short1"));
  assert.ok(validatePassword("allletters"));
  assert.equal(validateUsername(""), null);
  assert.equal(validateUsername("neo_01"), null);
  assert.ok(validateUsername("a b"));
  assert.ok(validateUsername("ab"));
  assert.ok(validateDisplayName("x".repeat(51)));
});

test("launch: app first, web fallback, throws if nothing opens", async () => {
  const spotify = getService("spotify")!;
  const calls: string[] = [];
  assert.deepEqual(await launchService(spotify, { openURL: async u => { calls.push(u); } }), { via: "app" });
  assert.deepEqual(calls, ["spotify://"]);

  const calls2: string[] = [];
  const r = await launchService(spotify, { openURL: async u => { calls2.push(u); if (u.startsWith("spotify:")) throw new Error("no app"); } });
  assert.deepEqual(r, { via: "web" });
  assert.deepEqual(calls2, ["spotify://", spotify.website]);

  const prime = getService("prime-video")!;
  const calls3: string[] = [];
  assert.deepEqual(await launchService(prime, { openURL: async u => { calls3.push(u); } }), { via: "web" });
  assert.deepEqual(calls3, [prime.website]);

  await assert.rejects(() => launchService(prime, { openURL: async () => { throw new Error("x"); } }));
});

test("friendlyError", () => {
  assert.match(friendlyError(new Error("Network request failed")), /offline/);
  assert.match(friendlyError({ message: "Invalid login credentials" }), /Incorrect/);
  assert.equal(friendlyError(null, "fb"), "fb");
});

test("parseAuthLink", () => {
  assert.deepEqual(parseAuthLink("streamverse://reset-password?code=abc123"), { kind: "code", code: "abc123" });
  assert.deepEqual(parseAuthLink("streamverse://reset-password#access_token=a&refresh_token=b&type=recovery"), { kind: "tokens", accessToken: "a", refreshToken: "b" });
  assert.equal(parseAuthLink("streamverse://reset-password#error=access_denied&error_description=Link+expired")?.kind, "error");
  assert.equal(parseAuthLink("streamverse://reset-password"), null);
  assert.equal(parseAuthLink(null), null);
});

test("recent + favorites helpers: no duplicates, newest first, capped", () => {
  let r = upsertRecent([], "a", "t1");
  r = upsertRecent(r, "b", "t2");
  r = upsertRecent(r, "a", "t3");
  assert.deepEqual(r.map(x => x.service_id), ["a", "b"]);
  assert.equal(r[0].opened_at, "t3");
  assert.equal(upsertRecent(r, "c", "t4", 2).length, 2);
  assert.deepEqual(toggleId(["a"], "b"), ["b", "a"]);
  assert.deepEqual(toggleId(["a", "b"], "a"), ["b"]);
});

test("timeAgo", () => {
  const now = Date.parse("2026-11-11T12:00:00Z");
  assert.equal(timeAgo("2026-11-11T11:59:50Z", now), "just now");
  assert.equal(timeAgo("2026-11-11T11:30:00Z", now), "30 min ago");
  assert.equal(timeAgo("2026-11-11T09:00:00Z", now), "3 h ago");
  assert.equal(timeAgo("2026-11-09T12:00:00Z", now), "2 d ago");
  assert.equal(timeAgo("2026-10-01T12:00:00Z", now), "2026-10-01");
  assert.equal(timeAgo("garbage", now), "");
});
