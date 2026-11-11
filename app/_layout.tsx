import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { colors } from "@/theme/colors";

function RootStack() {
  const { session, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.accentSoft} size="large" /></View>;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      {/* Reset-password must stay reachable: the recovery link signs the user in temporarily. */}
      <Stack.Screen name="reset-password" />
      {/* Logged-out only */}
      <Stack.Protected guard={!session}><Stack.Screen name="(auth)" /></Stack.Protected>
      {/* Logged-in only: every authenticated screen lives here */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="service/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="recent" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthProvider><UserDataProvider><StatusBar style="light" /><RootStack /></UserDataProvider></AuthProvider>;
}
