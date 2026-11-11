import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@/theme/colors";

type Props = TextInputProps & { label: string; error?: string | null; secure?: boolean };

export function Field({ label, error, secure, ...rest }: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.row, error ? { borderColor: colors.danger } : null]}>
        <TextInput {...rest} accessibilityLabel={label} placeholderTextColor={colors.faint} secureTextEntry={secure ? hidden : false} style={s.input} />
        {secure ? <Pressable accessibilityRole="button" accessibilityLabel={hidden ? "Show password" : "Hide password"} onPress={() => setHidden(h => !h)} hitSlop={10}><Text style={s.toggle}>{hidden ? "SHOW" : "HIDE"}</Text></Pressable> : null}
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { marginTop: 14 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: "#302D48", borderRadius: 14, paddingHorizontal: 16 },
  input: { flex: 1, color: colors.text, paddingVertical: 15, fontSize: 15 },
  toggle: { color: colors.accentSoft, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  error: { color: colors.danger, fontSize: 12, marginTop: 6 }
});
