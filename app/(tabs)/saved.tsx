import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Banner } from "@/components/Banner";
import { EmptyState } from "@/components/EmptyState";
import { ServiceCard } from "@/components/ServiceCard";
import { Skeleton } from "@/components/Skeleton";
import { useUserData } from "@/context/UserDataContext";
import { getService } from "@/data/services";
import type { StreamingService } from "@/types/service";
import { styles } from "@/theme/styles";
import { colors } from "@/theme/colors";

export default function SavedScreen() {
  const { status, error, favoriteIds, favoriteSet, refresh, toggleFavorite } = useUserData();
  const [actionError, setActionError] = useState<string | null>(null);
  const saved = useMemo(() => favoriteIds.map(getService).filter((s): s is StreamingService => !!s), [favoriteIds]);

  async function remove(id: string) {
    setActionError(null);
    const err = await toggleFavorite(id);
    if (err) setActionError(err);
  }

  return <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}
    refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.accentSoft} />}>
    <Text style={styles.pageTitle}>Saved</Text>
    <Text style={styles.muted}>Your favourite destinations.</Text>
    {actionError ? <Banner kind="error" text={actionError} /> : null}
    {status === "loading" ? <View style={styles.grid}>{[0, 1, 2, 3].map(i => <Skeleton key={i} width="48%" height={150} radius={19} />)}</View> : null}
    {status === "error" ? <><Banner kind="error" text={error ?? "Could not load saved services."} /><Pressable onPress={refresh}><Text style={[styles.link, { marginTop: 10 }]}>Tap to retry</Text></Pressable></> : null}
    {status === "ready" && saved.length === 0 ? <EmptyState title="No saved services yet" text="Open a service and tap Save. Your saved services are kept on your account." actionLabel="Browse services" onAction={() => router.push("/(tabs)/explore")} /> : null}
    {status === "ready" && saved.length > 0 ? <View style={styles.grid}>
      {saved.map(s => <View key={s.id} style={{ width: "48%" }}>
        <ServiceCard service={s} saved={favoriteSet.has(s.id)} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${s.name} from saved`} onPress={() => remove(s.id)} hitSlop={6} style={{ paddingVertical: 10 }}>
          <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "700", textAlign: "center" }}>Remove</Text>
        </Pressable>
      </View>)}
    </View> : null}
  </ScrollView>;
}
