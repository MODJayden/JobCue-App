import { View, Text } from "react-native";
import { Stack } from "expo-router";
import OfflineFallback from "../../../components/OfflineFallback";
const MessageLayout = () => {
  return (
    <OfflineFallback>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Chats",
            headerShown: false,
          }}
        />
      </Stack>
    </OfflineFallback>
  );
};
export default MessageLayout;
