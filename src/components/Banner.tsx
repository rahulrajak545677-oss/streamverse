import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export function Banner({ kind, text }: { kind: "error" | "success" | "info"; text: string }) {
  const palette = kind === "error" ? [colors.dangerBg, colors.danger] : kind === "success" ? [colors.successBg, colors.success] : ["#111624", "#9CA9BE"];
  return <View accessibilityRole="alert" style={[s.box, { backgroundColor: palette[0], borderColor: palette[1] }]}><Text style={[s.text, { color: palette[1] }]}>{text}</Text></View>;
}
const s = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 14 },
  text: { fontSize: 13, lineHeight: 19, fontWeight: "600" }
});
