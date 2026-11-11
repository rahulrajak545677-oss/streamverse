import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { CategoryChips } from "@/components/CategoryChips";
import { EmptyState } from "@/components/EmptyState";
import { ServiceCard } from "@/components/ServiceCard";
import { useUserData } from "@/context/UserDataContext";
import { services } from "@/data/services";
import { filterServices, type CategoryFilter } from "@/lib/search";
import { styles } from "@/theme/styles";
import { colors } from "@/theme/colors";

export default function SearchScreen() {
  const { favoriteSet } = useUserData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const results = useMemo(() => filterServices(services, query, category), [query, category]);
  const filtered = query.trim() !== "" || category !== "All";

  return (
    <FlatList
      style={styles.page} contentContainerStyle={styles.pageContent}
      data={results} keyExtractor={s => s.id} numColumns={2}
      columnWrapperStyle={{ gap: 12, marginBottom: 12 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      renderItem={({ item }) => <ServiceCard service={item} saved={favoriteSet.has(item.id)} style={local.card} />}
      ListHeaderComponent={<View>
        <Text style={styles.pageTitle}>Search</Text>
        <Text style={styles.muted}>Find a streaming destination by name or category.</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Try Spotify, movies, anime…" placeholderTextColor={colors.faint}
          style={[styles.searchInput, { marginTop: 4, marginBottom: 14 }]} autoCapitalize="none" autoCorrect={false} returnKeyType="search" clearButtonMode="while-editing" accessibilityLabel="Search services" />
        <CategoryChips value={category} onChange={setCategory} />
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{filtered ? `${results.length} matching ${results.length === 1 ? "service" : "services"}` : "All services"}</Text>
      </View>}
      ListEmptyComponent={<EmptyState title="No matching services"
        text={query.trim() ? `Nothing in the StreamVerse directory matches “${query.trim()}”${category !== "All" ? ` in ${category}` : ""}.` : `No services are listed under ${category} yet.`}
        actionLabel="Clear search and filters" onAction={() => { setQuery(""); setCategory("All"); }} />}
      ListFooterComponent={<View style={styles.notice}><Text style={styles.noticeText}>Search covers the StreamVerse directory of official services. It does not search inside Netflix, Spotify or other providers’ catalogs.</Text></View>}
    />
  );
}
const local = StyleSheet.create({ card: { flex: 1, maxWidth: "48.5%" } });
