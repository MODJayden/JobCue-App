import { View, Text } from "react-native";
import { router } from "expo-router";
import OnboardingScreen from "./OnboardingScreen";
import { useSelector } from "react-redux";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
const index = () => {
 
  return <OnboardingScreen />;
};
export default index;

// import React from "react";
// import { useSelector } from "react-redux";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import { OnboardingScreen } from "./OnboardingScreen";

// const index = () => {
//   const authState = useSelector((state) => {
//     try {
//       return state?.auth || {};
//     } catch (error) {
//       console.warn("⚠️ Error accessing auth state:", error);
//       return {};
//     }
//   });

//   const { isAuth = false, user = null, isLoading = false } = authState;

//   console.log("📱 Index Safe Render:");
//   console.log("   - isAuth:", isAuth);
//   console.log("   - isLoading:", isLoading);

//   // Handle loading state safely
//   if (isLoading) {
//     console.log("⏳ Index: Brief loading state");
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Initializing...</Text>
//       </View>
//     );
//   }

//   // For authenticated users, let AuthWrapper handle navigation
//   // Only proceed if we have both isAuth and user data
//   if (isAuth && user) {
//     console.log(
//       "🎯 Index: Authenticated user - letting AuthWrapper handle everything"
//     );
//     return null;
//   }

//   return <OnboardingScreen />;
// };
// export default index;
// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 40,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: "#8E8E93",
//     fontWeight: "500",
//     marginTop: 16,
//     textAlign: "center",
//   },
// });
