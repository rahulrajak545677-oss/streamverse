import { memo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { router } from "expo-router";
import type { StreamingService } from "@/types/service";
import { colors } from "@/theme/colors";

type Props = { service: StreamingService; saved?: boolean; style?: StyleProp<ViewStyle> };

export const ServiceCard = memo(function ServiceCard({ service, saved, style }: Props) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${service.name}, ${service.category}${saved ? ", saved" : ""}`}
    onPress={() => router.push({ pathname: "/service/[id]", params: { id: service.id } })}
    style={({ pressed }) => [s.card, style, pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] }]}>
    <View style={s.top}><Text style={s.icon}>{service.icon}</Text><Text style={[s.arrow, saved && { color: colors.accentSoft }]}>{saved ? "★" : "↗"}</Text></View>
    <View><Text style={s.name} numberOfLines={1}>{service.name}</Text><Text style={s.cat} numberOfLines={1}>{service.categories.join(" · ")}</Text></View>
  </Pressable>;
});
const s = StyleSheet.create({
  card: { minHeight: 118, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 19, padding: 15, justifyContent: "space-between" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  icon: { color: "#C7B5FF", fontSize: 25, fontWeight: "900" },
  arrow: { color: "#79738F", fontSize: 18 },
  name: { color: colors.text, fontWeight: "800", fontSize: 15, marginTop: 14 },
  cat: { color: "#918CA8", fontSize: 11, marginTop: 4 }
});
