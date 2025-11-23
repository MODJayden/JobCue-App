import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const URL = `${process.env.EXPO_PUBLIC_API_URL}/api/serviceArea`;

export const getAllServiceAreas = createAsyncThunk(
  "serviceArea/getAllServiceAreas",
  async () => {
    const response = await axios.get(`${URL}`);

    return response.data;
  }
);

// Update artisan services
export const updateArtisanServiceAreas = createAsyncThunk(
  "artisan/services",
  async ({ serviceAreas, userId }, thunkAPI) => {
    try {
      const response = await axios.post(`${URL}/${userId}/serviceArea`, {
        serviceAreas,
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const removeArtisanServiceArea = createAsyncThunk(
  "artisan/removeService",
  async ({ userId, serviceAreaId }, thunkAPI) => {
    try {
      console.log("Removing service:", serviceAreaId, "for user:", userId);
      const response = await axios.post(`${URL}/remove`, {
        userId,
        serviceAreaId,
      });

      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to remove service",
      });
    }
  }
);

const initialState = {
  serviceAreas: [],
  isLoading: false,
};

const serviceAreaSlice = createSlice({
  name: "serviceArea",
  initialState,
  reducers: {
    setServiceAreas: (state, action) => {
      state.serviceAreas = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllServiceAreas.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(getAllServiceAreas.fulfilled, (state, action) => {
      state.isLoading = false;
      state.serviceAreas = action.payload.data;
    });
    builder
      .addCase(getAllServiceAreas.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateArtisanServiceAreas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateArtisanServiceAreas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.serviceAreas = action?.payload?.data.services;
        state.successMessage =
          action?.payload?.message || "Artisan services updated successfully";
      })
      .addCase(updateArtisanServiceAreas.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to update artisan services";
      })
      .addCase(removeArtisanServiceArea.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(removeArtisanServiceArea.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedServiceAreas = action?.payload?.data.services;

        // Update in serviceAreas list if exists
        const index = state.serviceAreas.findIndex(
          (serviceArea) => serviceArea._id === updatedServiceAreas._id
        );
        if (index !== -1) {
          state.serviceAreas[index] = updatedServiceAreas;
        }

        state.successMessage =
          action?.payload?.message || "Service area removed successfully";
      })
      .addCase(removeArtisanServiceArea.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to remove service area";
      });
  },
});

export const { setServiceAreas } = serviceAreaSlice.actions;

export default serviceAreaSlice.reducer;
