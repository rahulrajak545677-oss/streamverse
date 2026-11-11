import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useUserData } from "@/context/UserDataContext";
import { getService } from "@/data/services";
import { timeAgo } from "@/lib/time";
import { styles } from "@/theme/styles";
import { colors } from "@/theme/colors";

export default function RecentActivityScreen() {
  const { status, error, recent, refresh, clearHistory } = useUserData();
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const rows = useMemo(() => recent.map(r => ({ r, s: getService(r.service_id) })).filter(x => !!x.s), [recent]);

  function confirmClear() {
    Alert.alert("Clear history?", "This permanently removes your recent activity from your account.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => { setClearing(true); setActionError(null); const e = await clearHistory(); setClearing(false); if (e) setActionError(e); } }
    ]);
  }

  return <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}
    refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.accentSoft} />}>
    <Stack.Screen options={{ title: "Recent activity", headerShown: true, headerTintColor: "#FFFFFF", headerStyle: { backgroundColor: "#10101D" } }} />
    <Text style={styles.pageTitle}>Recent activity</Text>
    <Text style={styles.muted}>Services you opened from StreamVerse. Only you can see this.</Text>
    {actionError ? <Banner kind="error" text={actionError} /> : null}
    {status === "loading" ? <View style={{ gap: 10 }}>{[0, 1, 2].map(i => <Skeleton key={i} height={64} radius={16} />)}</View> : null}
    {status === "error" ? <><Banner kind="error" text={error ?? "Could not load activity."} /><Pressable onPress={refresh}><Text style={[styles.link, { marginTop: 10 }]}>Tap to retry</Text></Pressable></> : null}
    {status === "ready" && rows.length === 0 ? <EmptyState title="No recent activity" text="When you open a service, it shows up here." actionLabel="Explore services" onAction={() => router.push("/(tabs)/explore")} /> : null}
    {status === "ready" && rows.length > 0 ? <>
      <View style={{ gap: 10 }}>
        {rows.map(({ r, s }) => <Pressable key={r.service_id} accessibilityRole="button" accessibilityLabel={`${s!.name}, opened ${timeAgo(r.opened_at)}`}
          onPress={() => router.push({ pathname: "/service/[id]", params: { id: s!.id } })} style={({ pressed }) => [local.row, pressed && { opacity: 0.75 }]}>
          <Text style={local.icon}>{s!.icon}</Text>
          <View style={{ flex: 1 }}><Text style={local.name}>{s!.name}</Text><Text style={local.when}>{timeAgo(r.opened_at)}</Text></View>
          <Text style={local.arrow}>›</Text>
        </Pressable>)}
      </View>
      <Button title="Clear history" onPress={confirmClear} loading={clearing} variant="danger" />
    </> : null}
  </ScrollView>;
}
const local = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14 },
  icon: { color: "#C7B5FF", fontSize: 24, fontWeight: "900", width: 32, textAlign: "center" },
  name: { color: colors.text, fontWeight: "800", fontSize: 15 },
  when: { color: colors.faint, fontSize: 12, marginTop: 2 },
  arrow: { color: colors.faint, fontSize: 22 }
});
