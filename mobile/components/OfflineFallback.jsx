import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useNetwork } from "./NetworkProvider";
import NetInfo from "@react-native-community/netinfo";

// Enhanced offline fallback with better UX
const OfflineFallback = ({ children, showMinimal = false, allowCachedContent = true }) => {
  const { isConnected, isInternetReachable } = useNetwork();
  const [retrying, setRetrying] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const isOnline = isConnected && isInternetReachable;

  useEffect(() => {
    if (!isOnline) {
      // Pulse animation for offline indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isOnline]);

  const handleRetry = async () => {
    setRetrying(true);
    // Force a network check
    await NetInfo.fetch();
    setTimeout(() => setRetrying(false), 2000);
  };

  // If online, show content normally
  if (isOnline) {
    return children;
  }

  // If offline but cached content is allowed, show minimal banner

    return (
      <View style={styles.container}>
        <View style={styles.minimalBanner}>
          <Animated.Text style={[styles.minimalIcon, { opacity: pulseAnim }]}>
            📡
          </Animated.Text>
          <View style={styles.minimalTextContainer}>
            <Text style={styles.minimalText}>Offline Mode</Text>
            <Text style={styles.minimalSubtext}>
              Showing cached content
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={retrying}
          >
            <Text style={styles.retryButtonText}>
              {retrying ? "..." : "↻"}
            </Text>
          </TouchableOpacity>
        </View>
        {children}
      </View>
    );
  

/*   // Full offline screen for pages that absolutely need internet
  return (
    <View style={styles.fullContainer}>
      <View style={styles.content}>
        <Animated.Text style={[styles.icon, { opacity: pulseAnim }]}>
          📡
        </Animated.Text>
        <Text style={styles.title}>You're Offline</Text>
        <Text style={styles.message}>
          This feature requires an internet connection. Please check your
          connection and try again.
        </Text>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Quick fixes:</Text>
          <Text style={styles.tip}>• Turn off Airplane Mode</Text>
          <Text style={styles.tip}>• Check WiFi connection</Text>
          <Text style={styles.tip}>• Enable Mobile Data</Text>
          <Text style={styles.tip}>• Restart your device</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, retrying && styles.buttonDisabled]}
          onPress={handleRetry}
          disabled={retrying}
        >
          <Text style={styles.buttonText}>
            {retrying ? "Checking..." : "Try Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ); */
};

// Hook to check online status and get connection info
export const useOnlineStatus = () => {
  const { isConnected, isInternetReachable } = useNetwork();
  return {
    isOnline: isConnected && isInternetReachable,
    isConnected,
    isInternetReachable,
  };
};

// HOC to wrap screens that need offline handling
export const withOfflineProtection = (Component, options = {}) => {
  return (props) => {
    const { showMinimal = false, allowCachedContent = true } = options;
    
    return (
      <OfflineFallback 
        showMinimal={showMinimal} 
        allowCachedContent={allowCachedContent}
      >
        <Component {...props} />
      </OfflineFallback>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  minimalBanner: {
    backgroundColor: '#FFE4B5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D2691E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  minimalIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  minimalTextContainer: {
    flex: 1,
  },
  minimalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D2E0F',
  },
  minimalSubtext: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 69, 19, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 18,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  fullContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D2E0F',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  tips: {
    backgroundColor: '#FFF8DC',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE4B5',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D2E0F',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#D2691E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#C0C0C0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OfflineFallback;