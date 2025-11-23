import { Stack } from "expo-router";
import { View, Text } from "react-native";
const customerProfileLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Update Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: "Edit Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="favoriteArtisan"
        options={{
          title: "Edit Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Help"
        options={{
          title: "Edit Profile",
          headerShown: false,
        }}
      />
    </Stack>
  );
};
export default customerProfileLayout;
