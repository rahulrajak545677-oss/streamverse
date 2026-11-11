import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

type Props = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: "primary" | "secondary" | "danger" };

export function Button({ title, onPress, loading, disabled, variant = "primary" }: Props) {
  const off = disabled || loading;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!off, busy: !!loading }} onPress={onPress} disabled={off}
      style={({ pressed }) => [s.base, variant === "primary" && s.primary, variant === "secondary" && s.secondary, variant === "danger" && s.danger, off && { opacity: 0.55 }, pressed && { opacity: 0.8 }]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[s.text, variant !== "primary" && { color: variant === "danger" ? colors.danger : "#D7CCFF" }]}>{title}</Text>}
    </Pressable>
  );
}
const s = StyleSheet.create({
  base: { borderRadius: 15, paddingVertical: 16, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 14, minHeight: 52 },
  primary: { backgroundColor: colors.accent },
  secondary: { borderWidth: 1, borderColor: "#51427B" },
  danger: { borderWidth: 1, borderColor: colors.danger },
  text: { color: "#fff", fontWeight: "800", fontSize: 14 }
});
