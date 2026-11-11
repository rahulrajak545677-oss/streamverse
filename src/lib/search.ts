import type { ServiceCategory, StreamingService } from "../types/service";

export type CategoryFilter = ServiceCategory | "All";

/** Case-insensitive search over the real service directory. Never returns fabricated results. */
export function filterServices(
  list: readonly StreamingService[],
  query: string,
  category: CategoryFilter = "All"
): StreamingService[] {
  const q = query.trim().toLowerCase();
  return list.filter(s => {
    if (category !== "All" && !s.categories.includes(category)) return false;
    if (!q) return true;
    return `${s.name} ${s.categories.join(" ")} ${s.description}`.toLowerCase().includes(q);
  });
}

export function countByCategory(list: readonly StreamingService[], categories: readonly ServiceCategory[]) {
  return categories.map(c => ({ category: c, count: list.filter(s => s.categories.includes(c)).length }));
}
