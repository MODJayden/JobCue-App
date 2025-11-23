import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import store from "../store/store";
import AuthWrapper from "../components/AuthWrapper";
import NetworkProvider from "../components/NetworkProvider";
import ErrorBoundary from "../components/ErrorBoundary";
import "../global.css";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Provider store={store}>
            <NetworkProvider>
              <AuthWrapper>
                <Stack screenOptions={{ headerShown: false }} />
              </AuthWrapper>
            </NetworkProvider>
          </Provider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
