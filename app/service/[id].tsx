import { useCallback, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { useUserData } from "@/context/UserDataContext";
import { getService } from "@/data/services";
import { launchService } from "@/lib/launch";
import { styles } from "@/theme/styles";

type Msg = { kind: "info" | "success" | "error"; text: string } | null;

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = getService(id);
  const { favoriteSet, toggleFavorite, trackOpen } = useUserData();
  const [opening, setOpening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const saved = service ? favoriteSet.has(service.id) : false;

  const open = useCallback(async () => {
    if (!service) return;
    setOpening(true);
    setMsg({ kind: "info", text: `Opening ${service.name}…` });
    try {
      const result = await launchService(service, Linking);
      trackOpen(service.id);
      setMsg(result.via === "app"
        ? { kind: "success", text: `Opened in the ${service.name} app.` }
        : { kind: "success", text: service.appUrl ? `The ${service.name} app isn’t installed, so we opened the official website.` : `Opened the official ${service.name} website.` });
    } catch {
      setMsg({ kind: "error", text: `${service.name} couldn’t be opened on this device. Check your connection and try again.` });
    } finally { setOpening(false); }
  }, [service, trackOpen]);

  const toggle = useCallback(async () => {
    if (!service) return;
    setSaving(true); setMsg(null);
    const err = await toggleFavorite(service.id);
    setSaving(false);
    if (err) setMsg({ kind: "error", text: err });
  }, [service, toggleFavorite]);

  if (!service) return <View style={styles.pageContent}>
    <Stack.Screen options={{ title: "Not found", headerShown: true, headerTintColor: "#FFFFFF", headerStyle: { backgroundColor: "#10101D" } }} />
    <Text style={styles.pageTitle}>Service not found</Text>
    <Text style={styles.muted}>This service isn’t in the StreamVerse directory.</Text>
    <Button title="Back to Home" onPress={() => router.replace("/(tabs)")} variant="secondary" />
  </View>;

  return <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
    <Stack.Screen options={{ title: service.name, headerShown: true, headerTintColor: "#FFFFFF", headerStyle: { backgroundColor: "#10101D" } }} />
    <Text style={styles.serviceIcon}>{service.icon}</Text>
    <Text style={styles.pageTitle}>{service.name}</Text>
    <Text style={styles.pill}>{service.categories.join("  ·  ").toUpperCase()}</Text>
    <Text style={styles.muted}>{service.description}</Text>
    <View style={styles.notice}><Text style={styles.noticeTitle}>Official destination</Text><Text style={styles.noticeText}>You will continue to {service.name}. Availability, sign-in, subscriptions and playback are managed by that provider.</Text></View>
    {msg ? <Banner kind={msg.kind} text={msg.text} /> : null}
    <Button title={`Open ${service.name} ↗`} onPress={open} loading={opening} />
    <Button title={saved ? "★  Saved — tap to remove" : "☆  Save to favourites"} onPress={toggle} loading={saving} variant="secondary" />
  </ScrollView>;
}
