import { Stack } from "expo-router";

const profileLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="skills"
        options={{
          title: "Select Your Services",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ServiceArea"
        options={{
          title: "Select Service Areas",
          headerShown: true,
        }}
      />
    </Stack>
  );
};

export default profileLayout;
