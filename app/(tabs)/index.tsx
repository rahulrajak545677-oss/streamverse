import { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Brand } from "@/components/Brand";
import { Banner } from "@/components/Banner";
import { EmptyState } from "@/components/EmptyState";
import { CardSkeletonRow } from "@/components/Skeleton";
import { ServiceRow } from "@/components/ServiceRow";
import { useUserData } from "@/context/UserDataContext";
import { FEATURED_IDS, getService, services } from "@/data/services";
import { CATEGORIES, type StreamingService } from "@/types/service";
import { countByCategory } from "@/lib/search";
import { styles } from "@/theme/styles";
import { colors } from "@/theme/colors";

const pick = (ids: readonly string[]) => ids.map(getService).filter((s): s is StreamingService => !!s);
const featured = pick(FEATURED_IDS);
const categoryCounts = countByCategory(services, CATEGORIES);

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{title}</Text>{action ? <Text style={styles.sectionAction} onPress={onAction}>{action}</Text> : null}</View>;
}

export default function HomeScreen() {
  const { status, error, favoriteIds, favoriteSet, recent, refresh } = useUserData();
  const recentServices = useMemo(() => pick(recent.map(r => r.service_id)).slice(0, 8), [recent]);
  const savedServices = useMemo(() => pick(favoriteIds).slice(0, 8), [favoriteIds]);
  const loading = status === "loading";

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.accentSoft} />}>
      <Brand subtitle="ONE UNIVERSE. EVERY DESTINATION." compact />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>DISCOVER YOUR NEXT{"\n"}FAVOURITE</Text>
        <Text style={styles.heroTitle}>Entertainment,{"\n"}without boundaries.</Text>
        <Text style={styles.muted}>Your gateway to music, movies and video platforms.</Text>
        <Pressable accessibilityRole="search" accessibilityLabel="Search services" style={local.search} onPress={() => router.push("/(tabs)/search")}>
          <Text style={local.searchText}>🔍  Search services…</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push("/(tabs)/explore")}><Text style={styles.primaryButtonText}>Explore services  →</Text></Pressable>
      </View>

      {status === "error" && error ? <><Banner kind="error" text={error} /><Pressable onPress={refresh}><Text style={[styles.link, { marginTop: 10 }]}>Tap to retry</Text></Pressable></> : null}

      <View style={styles.section}>
        <SectionHeader title="Featured services" action="See all" onAction={() => router.push("/(tabs)/explore")} />
        <ServiceRow items={featured} saved={favoriteSet} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Recently opened" action={recentServices.length ? "See all" : undefined} onAction={() => router.push("/recent")} />
        {loading ? <CardSkeletonRow /> : recentServices.length ? <ServiceRow items={recentServices} saved={favoriteSet} /> :
          <EmptyState title="Nothing opened yet" text="Services you open from StreamVerse will appear here." />}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Saved services" action={savedServices.length ? "See all" : undefined} onAction={() => router.push("/(tabs)/saved")} />
        {loading ? <CardSkeletonRow /> : savedServices.length ? <ServiceRow items={savedServices} saved={favoriteSet} /> :
          <EmptyState title="No saved services" text="Open a service and tap Save to keep it here." actionLabel="Browse services" onAction={() => router.push("/(tabs)/explore")} />}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Popular categories" />
        <View style={styles.grid}>
          {categoryCounts.map(({ category, count }) => (
            <Pressable key={category} accessibilityRole="button" accessibilityLabel={`${category}, ${count} services`} style={local.cat}
              onPress={() => router.push({ pathname: "/(tabs)/explore", params: { category } })}>
              <Text style={local.catName}>{category}</Text>
              <Text style={local.catCount}>{count} {count === 1 ? "service" : "services"}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.notice}><Text style={styles.noticeTitle}>A hub, not a replacement</Text><Text style={styles.noticeText}>StreamVerse opens official services. Their subscriptions, playback and account rules still apply.</Text></View>
    </ScrollView>
  );
}

const local = StyleSheet.create({
  search: { backgroundColor: "#100E1E", borderColor: "#39305E", borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 6 },
  searchText: { color: colors.faint, fontSize: 14 },
  cat: { width: "48%", backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14 },
  catName: { color: colors.text, fontWeight: "800", fontSize: 14 },
  catCount: { color: colors.faint, fontSize: 11, marginTop: 4 }
});
