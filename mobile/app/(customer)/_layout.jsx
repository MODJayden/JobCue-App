import { Tabs } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import OfflineFallBack from "@/components/OfflineFallback";

const CustomerLayout = () => {
  return (
    <SafeAreaProvider>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#6F4E37",
          tabBarInactiveTintColor: "#B8A394",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F5E6D3",
            paddingTop: 8,
            paddingBottom: 8,
            height: 65,
            elevation: 8,
            shadowColor: "#6F4E37",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="artisans"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                }}
              >
                <View
                  style={{
                    backgroundColor: focused
                      ? "rgba(111, 78, 55, 0.1)"
                      : "transparent",
                    borderRadius: 16,
                    padding: 8,
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={24}
                    color={color}
                  />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                }}
              >
                <View
                  style={{
                    backgroundColor: focused
                      ? "rgba(111, 78, 55, 0.1)"
                      : "transparent",
                    borderRadius: 16,
                    padding: 8,
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "calendar" : "calendar-outline"}
                    size={24}
                    color={color}
                  />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="messages"
          options={{
            title: "Messages",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                }}
              >
                <View
                  style={{
                    backgroundColor: focused
                      ? "rgba(111, 78, 55, 0.1)"
                      : "transparent",
                    borderRadius: 16,
                    padding: 8,
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "chatbubbles" : "chatbubbles-outline"}
                    size={24}
                    color={color}
                  />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                }}
              >
                <View
                  style={{
                    backgroundColor: focused
                      ? "rgba(111, 78, 55, 0.1)"
                      : "transparent",
                    borderRadius: 16,
                    padding: 8,
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "person" : "person-outline"}
                    size={24}
                    color={color}
                  />
                </View>
              </View>
            ),
          }}
        />
      </Tabs>

    </SafeAreaProvider>
  );
};

export default CustomerLayout;
