import { View, Text } from "react-native";
import { Stack } from "expo-router";
const MessageLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          title: "Chats",
          headerShown: false,
        }}
      />
    </Stack>
  );
};
export default MessageLayout;
