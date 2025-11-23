// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { checkAuth, setToken, setOfflineAuth } from "../store/user";
// import { useRouter, SplashScreen } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import { View, ActivityIndicator, Platform } from "react-native";
// import NetInfo from "@react-native-community/netinfo";

// const AuthWrapper = ({ children }) => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const { isAuth, isLoading, token } = useSelector((state) => state?.auth);

//   const [initialCheckComplete, setInitialCheckComplete] = useState(false);

//   const getStoredToken = async () => {
//     try {
//       if (Platform.OS === "web") {
//         return localStorage.getItem("token");
//       } else {
//         const isAvailable = await SecureStore.isAvailableAsync();

//         if (isAvailable) {
//           return await SecureStore.getItemAsync("token");
//         } else {
//           const AsyncStorage =
//             require("@react-native-async-storage/async-storage").default;
//           return await AsyncStorage.getItem("token");
//         }
//       }
//     } catch (error) {
//       console.error("Error getting token:", error);
//       try {
//         const AsyncStorage =
//           require("@react-native-async-storage/async-storage").default;
//         return await AsyncStorage.getItem("token");
//       } catch (fallbackError) {
//         console.error("AsyncStorage fallback failed:", fallbackError);
//         return null;
//       }
//     }
//   };

//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         const storedToken = await getStoredToken();

//         if (storedToken) {
//           // Set token in Redux state
//           dispatch(setToken(storedToken));

//           // Check network connectivity
//           const netInfoState = await NetInfo.fetch();

//           if (netInfoState.isConnected) {
//             if (isAuth) {
//               dispatch(checkAuth(storedToken));
//             }
//           } else {
//             dispatch(setOfflineAuth({ token: storedToken }));
//           }
//         }
//       } catch (error) {
//         console.log("Auth check failed:", error);
//       } finally {
//         setInitialCheckComplete(true);
//         SplashScreen.hideAsync();
//       }
//     };

//     SplashScreen.preventAutoHideAsync();
//     verifyAuth();
//   }, [dispatch]);

//   useEffect(() => {
//     if (!initialCheckComplete || isLoading) return;

//     // Get stored token to check if user should be authenticated
//     const checkStoredAuth = async () => {
//       const storedToken = await getStoredToken();

//       // Only redirect to login if there's no token stored
//       if (!isAuth && !storedToken && !token) {
//         console.log("No token found, redirecting to login");
//         router.replace("../auth/login");
//       }
//     };

//     checkStoredAuth();
//   }, [isAuth, token, initialCheckComplete, isLoading, router]);

//   useEffect(() => {
//     // Subscribe to network state changes
//     const unsubscribe = NetInfo.addEventListener(async (state) => {
//       if (state.isConnected && token && !isAuth) {
//         // Just came back online and have a token - verify it
//         dispatch(checkAuth(token));
//       }
//     });

//     return () => unsubscribe();
//   }, [token, isAuth, dispatch]);

//   if (!initialCheckComplete || isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="green" />
//       </View>
//     );
//   }

//   return children;
// };

// export default AuthWrapper;

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, setToken, setOfflineAuth } from "../store/user";
import { useRouter, SplashScreen } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Animated,
  Platform,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  Easing
} from "react-native";
import { useNetwork } from "./NetworkProvider";

let hasShownSplash = false;
let hasInitializedAuth = false;

const ProfessionalSplash = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("🎬 Starting professional splash animation");

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Bouncing animation for the marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Wave animation (expanding circle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Wave circles */}
        <View style={styles.waveContainer}>
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ scale: waveScale }],
                opacity: waveOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              styles.waveDelayed,
              {
                transform: [
                  {
                    scale: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1.8],
                    }),
                  },
                ],
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.4, 0.2, 0],
                }),
              },
            ]}
          />
        </View>

        {/* Bouncing map marker */}
        <Animated.View
          style={[
            styles.markerContainer,
            {
              transform: [{ translateY: bounceAnim }],
            },
          ]}
        >
          {/* Map marker shape */}
          <View style={styles.marker}>
            <View style={styles.markerCircle}>
              <Text style={styles.markerIcon}>🔨</Text>
            </View>
            <View style={styles.markerPointer} />
          </View>
        </Animated.View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Gathering Artisans</Text>
          <Text style={styles.subText}>Connecting skilled professionals</Text>
        </View>
      </Animated.View>
    </View>
  );
};
 

const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuth, isLoading, token, user } = useSelector(
    (state) => state?.auth
  );
  const { isConnected, isInternetReachable } = useNetwork();

  // State management
  const [showSplash, setShowSplash] = useState(!hasShownSplash);
  const [authCheckDone, setAuthCheckDone] = useState(hasInitializedAuth);
  const hasNavigated = useRef(false);
  const tokenCache = useRef(null);

  // Mark splash as shown when component mounts
  useEffect(() => {
    if (showSplash) {
      hasShownSplash = true;
      console.log("🎬 First app launch - showing professional splash");
    } else {
      console.log("🔄 Re-mounting AuthWrapper - skipping splash");
    }
  }, []);
  useEffect(() => {
  // Reset navigation flag when user logs out
  if (!isAuth && !token) {
    hasNavigated.current = false;
    tokenCache.current = null;  
  }
}, [isAuth, token]);

  const getStoredToken = async () => {
    if (tokenCache.current !== null) return tokenCache.current;

    try {
      let storedToken = null;

      if (Platform.OS === "web") {
        storedToken = localStorage.getItem("token");
      } else {
        const isAvailable = await SecureStore.isAvailableAsync();
        if (isAvailable) {
          storedToken = await SecureStore.getItemAsync("token");
        } else {
          const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;
          storedToken = await AsyncStorage.getItem("token");
        }
      }

      tokenCache.current = storedToken;
  
      return storedToken;
    } catch (error) {
      console.error("❌ Error getting token:", error);
      tokenCache.current = null;
      return null;
    }
  };

  // Enhanced auth check with seamless experience
  useEffect(() => {
    if (hasInitializedAuth) {
      console.log("⏭️ Auth already initialized globally, skipping...");
      setAuthCheckDone(true);
      return;
    }

    hasInitializedAuth = true;
    console.log("🔍 Starting seamless auth verification...");

    const verifyAuth = async () => {
      try {
        // Always prevent auto-hide until we're ready
        if (showSplash) {
          await SplashScreen.preventAutoHideAsync();
          console.log("🛡️ Splash auto-hide prevented");
        }

        const storedToken = await getStoredToken();
        const isOnline = isConnected && isInternetReachable;

        console.log("🌐 Network status:", isOnline ? "Online" : "Offline");

        if (storedToken) {
          dispatch(setToken(storedToken));

          if (isOnline) {
            await dispatch(checkAuth(storedToken));
          } else {
            console.log("📴 Offline mode activated");
            dispatch(setOfflineAuth({ token: storedToken }));
          }
        } else {
          console.log("❌ No stored token found");
        }

        console.log("✅ Auth check completed - ready for seamless navigation");
      } catch (error) {
        console.error("❗ Auth verification error:", error);
      } finally {
        setAuthCheckDone(true);

        // Hide splash only after auth check is done
        if (showSplash) {
          await SplashScreen.hideAsync();
          setShowSplash(false); // Update state to hide splash component
          console.log("🎬 Splash hidden - ready for instant navigation");
        }
      }
    };

    verifyAuth();
  }, []); // Empty deps - only run once

  // Handle reconnection
  useEffect(() => {
    if (!authCheckDone) return;

    const handleReconnection = async () => {
      const isOnline = isConnected && isInternetReachable;

      if (isOnline && tokenCache.current && !isAuth) {
        dispatch(checkAuth(tokenCache.current));
      }
    };

    handleReconnection();
  }, [isConnected, isInternetReachable, authCheckDone]);

  // Seamless navigation - NO intermediate loading states
  useEffect(() => {
    // Wait for both splash to be hidden AND auth check to be done
    if (!authCheckDone || showSplash) {
      return;
    }

    if (hasNavigated.current) {
      return;
    }

    const isOnline = isConnected && isInternetReachable;

    // Get fresh token on every navigation decision
    const makeNavigationDecision = async () => {
      const currentToken = await getStoredToken();
      const hasToken = !!currentToken || !!token;


      // Authenticated user - navigate immediately
      if (isAuth && user) {
        hasNavigated.current = true;

        if (user.role === "customer") {
          router.replace("/(customer)/artisans");
        } else if (user.role === "artisan") {
          router.replace("/(artisan)");
        } else if (user.role === "admin") {
          router.replace("/(admin)");
        }
        return;
      }

      // No token - go to onboarding immediately
      if (!hasToken) {
        console.log("❌ Seamless navigation to onboarding");
        hasNavigated.current = true;
        router.replace("/auth/login");
        return;
      }

      // Has token but offline - stay in app
      if (hasToken && !isOnline) {
        hasNavigated.current = true;
        return;
      }

      // Has token but not authenticated - go to login
      if (hasToken && !isAuth) {
        hasNavigated.current = true;
        router.replace("/auth/login");
        return;
      }

      // Still loading - wait (this should be very brief)
      if (isLoading) {
        return <ProfessionalSplash />;
      }

      // Default fallback - go to onboarding
      console.log("🎯 Seamless fallback - going to onboarding");
      hasNavigated.current = true;
      router.replace("/");
    };

    makeNavigationDecision();
  }, [
    authCheckDone,
    showSplash,
    isAuth,
    user,
    token,
    isLoading,
    isConnected,
    isInternetReachable,
  ]);

  // Show professional splash screen ONLY
  if (showSplash) {
    return <ProfessionalSplash />;
  }

  return children;
};

const styles = StyleSheet.create({
  // Professional splash screen styling
  splashContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  imageLoadingOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackIconContainer: {
    alignItems: "center",
  },
  fallbackIcon: {
    fontSize: 50,
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "600",
  },
  appInfo: {
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 17,
    color: "#8E8E93",
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  loadingSection: {
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
    marginTop: 16,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  waveContainer: {
    position: "absolute",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  wave: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  waveDelayed: {
    borderColor: "#4A9EFF",
  },
  markerContainer: {
    marginBottom: 60,
    zIndex: 10,
  },
  marker: {
    alignItems: "center",
  },
  markerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  markerIcon: {
    fontSize: 28,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#007AFF",
    marginTop: -2,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  mainText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subText: {
    fontSize: 15,
    color: "#666666",
    fontWeight: "400",
  },
});

export default AuthWrapper;
