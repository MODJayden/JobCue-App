import { View, Text } from "react-native";
import { Stack } from "expo-router";
import OfflineFallback from "../../../components/OfflineFallback";

const indexLayout = () => {
  return (
    <OfflineFallback>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="services"
          options={{
            title: "Services",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="serviceList"
          options={{
            title: "Services",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PopularArtisan"
          options={{
            title: "Popular Artisans",
            headerShown: true,
          }}
        />
      </Stack>
    </OfflineFallback>
  );
};
export default indexLayout;
