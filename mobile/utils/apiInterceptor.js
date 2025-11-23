import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const OFFLINE_QUEUE_KEY = "@offline_requests";
const MAX_RETRY_ATTEMPTS = 3;

class APIInterceptor {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL: baseURL,
      timeout: 30000,
    });

    this.offlineQueue = [];
    this.isProcessingQueue = false;
    this.setupInterceptors();
    this.loadOfflineQueue();
    this.setupNetworkListener();
  }

  setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add auth token
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Check network status
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected || !netInfo.isInternetReachable) {
          // Queue non-GET requests for later
          if (config.method !== "get") {
            await this.queueRequest(config);
            throw new axios.Cancel("Request queued - offline");
          }
          throw new Error("No internet connection");
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response) {
          // Server responded with error
          if (error.response.status === 401) {
            // Handle unauthorized
            await this.handleUnauthorized();
          }
        } else if (error.request) {
          // Network error
          console.log("Network error, queueing request");
        }
        return Promise.reject(error);
      }
    );
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  async handleUnauthorized() {
    // Clear token and redirect to login
    await AsyncStorage.removeItem("token");
    // Trigger logout action in your app
  }

  async queueRequest(config) {
    const queuedRequest = {
      ...config,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineQueue.push(queuedRequest);
    await this.saveOfflineQueue();
    console.log(`Request queued: ${config.method} ${config.url}`);
  }

  async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      console.error("Error saving offline queue:", error);
    }
  }

  async loadOfflineQueue() {
    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queue) {
        this.offlineQueue = JSON.parse(queue);
        console.log(`Loaded ${this.offlineQueue.length} queued requests`);
      }
    } catch (error) {
      console.error("Error loading offline queue:", error);
    }
  }

  setupNetworkListener() {
    NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("Back online - processing queued requests");
        await this.processOfflineQueue();
      }
    });
  }

  async processOfflineQueue() {
    if (this.isProcessingQueue || this.offlineQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`Processing ${this.offlineQueue.length} queued requests`);

    const failedRequests = [];

    for (const request of this.offlineQueue) {
      try {
        // Check if request is too old (24 hours)
        const age = Date.now() - request.timestamp;
        if (age > 24 * 60 * 60 * 1000) {
          console.log("Request too old, discarding");
          continue;
        }

        // Retry the request
        await this.api.request(request);
        console.log(`Successfully processed: ${request.method} ${request.url}`);
      } catch (error) {
        console.error(`Failed to process request:`, error.message);
        request.retryCount = (request.retryCount || 0) + 1;

        // Re-queue if under retry limit
        if (request.retryCount < MAX_RETRY_ATTEMPTS) {
          failedRequests.push(request);
        }
      }
    }

    // Update queue with failed requests
    this.offlineQueue = failedRequests;
    await this.saveOfflineQueue();

    this.isProcessingQueue = false;
    console.log(`Queue processing complete. ${failedRequests.length} requests remaining`);
  }

  // Public method to manually trigger queue processing
  async retryQueuedRequests() {
    await this.processOfflineQueue();
  }

  // Get API instance
  getInstance() {
    return this.api;
  }
}

// Create and export singleton instance
const apiInterceptor = new APIInterceptor(
  process.env.EXPO_PUBLIC_API_URL 
);

export const api = apiInterceptor.getInstance();
export default apiInterceptor;