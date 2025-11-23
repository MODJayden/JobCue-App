import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth`;

export const registerUser = createAsyncThunk(
  "/users/register",
  async (user, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/register`, user, {
        withCredentials: true,
      });
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeToken = createAsyncThunk("auth/removeToken", async () => {
  try {
    if (Platform.OS === "web") {
      await localStorage.removeItem("token");
    } else {
      // Check if SecureStore is available first
      const isAvailable = await SecureStore.isAvailableAsync();

      if (isAvailable) {
        await SecureStore.deleteItemAsync("token");
      } else {
        throw new Error("SecureStore not available");
      }
    }
    // Also clear from AsyncStorage if it exists there

    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.log(error);
  }
});

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (user, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/login`, user, {
        withCredentials: true,
      });
      console.log(res?.data);
      await dispatch(saveToken(res?.data?.token));
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/users/middleware",
  async (token, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/middleware`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveToken = createAsyncThunk(
  "auth/saveToken",
  async (token, { rejectWithValue }) => {
    try {
      if (!token) throw new Error("No token provided");

      if (Platform.OS === "web") {
        localStorage.setItem("token", token);
        console.log("✅ Token saved to localStorage");
      } else {
        const available = await SecureStore.isAvailableAsync();
        console.log("🔐 SecureStore available:", available);

        if (available) {
          await SecureStore.setItemAsync("token", token);
          console.log("✅ Token saved to SecureStore");
        } else {
          console.warn(
            "⚠️ SecureStore not available. Using AsyncStorage fallback."
          );
          await AsyncStorage.setItem("token", token);
          console.log("✅ Token saved to AsyncStorage");
        }
      }

      return token;
    } catch (error) {
      console.error("❌ Error saving token:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (user, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/update/${user.id}`, user.data);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const toggleFavoriteArtisan = createAsyncThunk(
  "auth/toggleFavoriteArtisan",
  async (artisan, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API_URL}/toggleFavorite/${artisan.userId}`,
        artisan
      );
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getFavorites = createAsyncThunk(
  "customer/getFavorites",
  async (id) => {
    try {
      const res = await axios.get(`${API_URL}/favorites/${id}`);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
const initialState = {
  token: null,
  user: null,
  error: null,
  isLoading: false,
  isAuth: false,
  updatedUser: null,
  isUpdateUserLoading: false,
  isToggleFavoriteLoading: false,
  isGetFavoritesLoading: false,
  favorites: [],
  isOfflineMode: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOfflineAuth: (state, action) => {
      state.token = action.payload.token;
      state.isAuth = true;
    },
    // Add this reducer for offline authentication
    setOfflineAuth: (state, action) => {
      state.token = action.payload.token;
      state.isAuth = true;
      state.isOfflineMode = true;
      // If you have cached user data, you can set it here
      // state.user = action.payload.user;
      console.log("Offline auth mode enabled");
    },

    // Clear offline mode when back online
    clearOfflineMode: (state) => {
      state.isOfflineMode = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state, action) => {
      state.isLoading = true;
    });
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.user = action.payload;
      })
      .addCase(loginUser.pending, (state, action) => {
        state.isLoading = true;
      });
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload?.token;
        state.user = action.payload?.user;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuth = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isOfflineMode = false; // Clear offline mode on successful auth
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Don't clear auth if we're offline
        if (!state.isOfflineMode) {
          state.isAuth = false;
          state.token = null;
        }
      })
      .addCase(removeToken.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(removeToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuth = false;
      })
      .addCase(removeToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      /*     builder.addCase(checkAuth.pending, (state, action) => {
      state.isLoading = true;
    });
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuth = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      }) */
      .addCase(updateUser.pending, (state, action) => {
        state.isUpdateUserLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdateUserLoading = false;
        state.updatedUser = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdateUserLoading = false;
        state.error = action.error.message;
      })
      .addCase(toggleFavoriteArtisan.pending, (state, action) => {
        state.isToggleFavoriteLoading = true;
      })
      .addCase(toggleFavoriteArtisan.fulfilled, (state, action) => {
        state.isToggleFavoriteLoading = false;
        state.favorites = action.payload.data.favoriteArtisans;
      })
      .addCase(toggleFavoriteArtisan.rejected, (state, action) => {
        state.isToggleFavoriteLoading = false;
        state.error = action.error.message;
      });
    builder.addCase(getFavorites.pending, (state, action) => {
      state.isGetFavoritesLoading = true;
    });
    builder
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.isGetFavoritesLoading = false;
        state.favorites = action.payload.data;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.isGetFavoritesLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setToken,
  setUser,
  clearError,
  setOfflineAuth,
  clearOfflineMode,
} = authSlice.actions;

export default authSlice.reducer;
