import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useDispatch } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
  connectionType: "unknown",
});

export const useNetwork = () => useContext(NetworkContext);

const NetworkProvider = ({ children }) => {
  const dispatch = useDispatch();

  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [connectionType, setConnectionType] = useState("unknown");

  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

  // Reanimated shared value for sliding banner
  const slideY = useSharedValue(-100);

  // Animate banner based on showBanner
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  useEffect(() => {
    // Subscribe to network updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? false;
      const type = state.type ?? "unknown";

      const wasOffline = !isConnected || !isInternetReachable;
      const isNowOnline = connected && reachable;

      setIsConnected(connected);
      setIsInternetReachable(reachable);
      setConnectionType(type);

      if (!connected || !reachable) {
        setBannerMessage("No internet connection. You're offline.");
        setShowBanner(true);
      } else if (wasOffline && isNowOnline) {
        setBannerMessage("Back online");
        setShowBanner(true);

        setTimeout(() => setShowBanner(false), 3000);
      }
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      setConnectionType(state.type ?? "unknown");
    });

    return () => unsubscribe();
  }, [isConnected, isInternetReachable]);

  // Animate banner in/out
  useEffect(() => {
    if (showBanner) {
      slideY.value = withSpring(0, { damping: 8, stiffness: 120 });
    } else {
      slideY.value = withTiming(-100, { duration: 300 });
    }
  }, [showBanner]);

  const contextValue = {
    isConnected,
    isInternetReachable,
    connectionType,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
      <Animated.View
        style={[
          styles.banner,
          animatedStyle,
          {
            backgroundColor:
              isConnected && isInternetReachable ? "#10b981" : "#ef4444",
          },
        ]}
      >
        <Text style={styles.bannerText}>{bannerMessage}</Text>
      </Animated.View>
    </NetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bannerText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default NetworkProvider;
