import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type IconProps = { name: IconName; color: string; size: number };

function TabIcon({ name, color, size }: IconProps) {
  return <Ionicons name={name} color={color} size={size} />;
}
const homeIcon = ({ color, size }: { color: string; size: number }) => <TabIcon name="home-outline" color={color} size={size} />;
const searchIcon = ({ color, size }: { color: string; size: number }) => <TabIcon name="search-outline" color={color} size={size} />;
const exploreIcon = ({ color, size }: { color: string; size: number }) => <TabIcon name="compass-outline" color={color} size={size} />;
const savedIcon = ({ color, size }: { color: string; size: number }) => <TabIcon name="bookmark-outline" color={color} size={size} />;
const profileIcon = ({ color, size }: { color: string; size: number }) => <TabIcon name="person-outline" color={color} size={size} />;

// Auth protection is enforced by Stack.Protected in app/_layout.tsx.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarActiveTintColor: colors.accentSoft, tabBarInactiveTintColor: colors.faint,
      tabBarStyle: { backgroundColor: "#10101D", borderTopColor: "#242239", height: 64, paddingTop: 8, paddingBottom: 8 },
      tabBarLabelStyle: { fontSize: 10 }
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: homeIcon }} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: searchIcon }} />
      <Tabs.Screen name="explore" options={{ title: "Explore", tabBarIcon: exploreIcon }} />
      <Tabs.Screen name="saved" options={{ title: "Saved", tabBarIcon: savedIcon }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: profileIcon }} />
    </Tabs>
  );
}
