import { Text, View } from "react-native";
import { styles } from "@/theme/styles";
export function Brand({ subtitle, compact = false }: { subtitle: string; compact?: boolean }) {
  return <View style={{ marginBottom: compact ? 16 : 34 }}>
    <Text style={styles.brand}>STREAM<Text style={styles.brandAccent}>VERSE</Text></Text>
    <Text style={styles.brandSubtitle}>{subtitle}</Text>
  </View>;
}
