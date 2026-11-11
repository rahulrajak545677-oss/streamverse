import { memo } from "react";
import { ScrollView } from "react-native";
import type { StreamingService } from "@/types/service";
import { ServiceCard } from "./ServiceCard";

/** Horizontally scrolling row of service cards. */
export const ServiceRow = memo(function ServiceRow({ items, saved }: { items: readonly StreamingService[]; saved: ReadonlySet<string> }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 22 }}>
    {items.map(s => <ServiceCard key={s.id} service={s} saved={saved.has(s.id)} style={{ width: 150 }} />)}
  </ScrollView>;
});
