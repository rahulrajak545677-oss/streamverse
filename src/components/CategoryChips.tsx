import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { CATEGORIES } from "@/types/service";
import type { CategoryFilter } from "@/lib/search";
import { colors } from "@/theme/colors";

const OPTIONS: CategoryFilter[] = ["All", ...CATEGORIES];

export const CategoryChips = memo(function CategoryChips({ value, onChange }: { value: CategoryFilter; onChange: (c: CategoryFilter) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row} keyboardShouldPersistTaps="handled">
    {OPTIONS.map(c => {
      const active = c === value;
      return <Pressable key={c} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onChange(c)} style={[s.chip, active && s.active]}>
        <Text style={[s.text, active && s.textActive]}>{c}</Text>
      </Pressable>;
    })}
  </ScrollView>;
});
const s = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  textActive: { color: "#fff" }
});
