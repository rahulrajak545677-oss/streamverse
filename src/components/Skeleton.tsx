import { useEffect, useRef } from "react";
import { Animated, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";

export function Skeleton({ width = "100%", height = 16, radius = 10, style }: { width?: DimensionValue; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true })
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View accessibilityLabel="Loading" style={[{ width, height, borderRadius: radius, backgroundColor: "#23203A", opacity }, style]} />;
}

export function CardSkeletonRow({ count = 3 }: { count?: number }) {
  return <View style={{ flexDirection: "row", gap: 12 }}>{Array.from({ length: count }, (_, i) => <Skeleton key={i} width={150} height={118} radius={19} />)}</View>;
}
