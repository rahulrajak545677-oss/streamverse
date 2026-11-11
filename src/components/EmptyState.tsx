import { StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { colors } from "@/theme/colors";

export function EmptyState({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return <View style={s.box}>
    <Text style={s.title}>{title}</Text>
    <Text style={s.text}>{text}</Text>
    {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="secondary" /> : null}
  </View>;
}
const s = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 20, alignItems: "stretch" },
  title: { color: colors.text, fontWeight: "800", fontSize: 15, marginBottom: 6 },
  text: { color: colors.muted, fontSize: 13, lineHeight: 19 }
});
