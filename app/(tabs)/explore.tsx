import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { CategoryChips } from "@/components/CategoryChips";
import { EmptyState } from "@/components/EmptyState";
import { ServiceCard } from "@/components/ServiceCard";
import { useUserData } from "@/context/UserDataContext";
import { services } from "@/data/services";
import { CATEGORIES } from "@/types/service";
import { filterServices, type CategoryFilter } from "@/lib/search";
import { styles } from "@/theme/styles";

const isCategory = (v: unknown): v is CategoryFilter => v === "All" || (CATEGORIES as readonly unknown[]).includes(v);

export default function ExploreScreen() {
  const { favoriteSet } = useUserData();
  const params = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState<CategoryFilter>("All");
  // Home's "Popular categories" links here with ?category=
  useEffect(() => { if (isCategory(params.category)) setCategory(params.category); }, [params.category]);

  const sections = useMemo(() => (category === "All" ? CATEGORIES : [category]).map(c => ({ category: c, list: filterServices(services, "", c) })).filter(s => s.list.length > 0), [category]);

  return <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
    <Text style={styles.pageTitle}>Explore</Text>
    <Text style={styles.muted}>Choose a destination and continue on its official platform.</Text>
    <CategoryChips value={category} onChange={setCategory} />
    {sections.length === 0 ? <View style={styles.section}><EmptyState title={`Nothing in ${category} yet`} text="No official services are listed under this category yet." actionLabel="Show all categories" onAction={() => setCategory("All")} /></View> : null}
    {sections.map(({ category: c, list }) => <View key={c} style={styles.section}>
      <Text style={styles.sectionTitle}>{c}</Text>
      <View style={styles.grid}>{list.map(s => <ServiceCard key={s.id} service={s} saved={favoriteSet.has(s.id)} style={{ width: "48%" }} />)}</View>
    </View>)}
  </ScrollView>;
}
