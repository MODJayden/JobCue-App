import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const URL = `${process.env.EXPO_PUBLIC_API_URL}/api/service`;

// Get all active services
export const getAllServices = createAsyncThunk(
  "services/getAllServices",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/active`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const seedServices = createAsyncThunk(
  "services/seedServices",
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(`${URL}/seed`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get service by ID
export const getServiceById = createAsyncThunk(
  "services/getServiceById",
  async (serviceId, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/${serviceId}`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get all categories with service counts
export const getCategories = createAsyncThunk(
  "services/getCategories",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/meta/categories`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get services by category
export const getServicesByCategory = createAsyncThunk(
  "services/getServicesByCategory",
  async (category, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/category/${category}`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Create service (Admin only)
export const createService = createAsyncThunk(
  "services/createService",
  async (serviceData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.post(`${URL}`, serviceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Update service (Admin only)
export const updateService = createAsyncThunk(
  "services/updateService",
  async ({ serviceId, serviceData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.put(`${URL}/${serviceId}`, serviceData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Delete service (Soft delete - Admin only)
export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (serviceId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.delete(`${URL}/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { serviceId, ...response?.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Activate service (Admin only)
export const activateService = createAsyncThunk(
  "services/activateService",
  async (serviceId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.patch(
        `${URL}/${serviceId}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Smart search services
export const searchServices = createAsyncThunk(
  "services/searchServices",
  async (query, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/search/smart`, {
        params: { query },
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get services by issue (for AI diagnosis)
export const getServicesByIssue = createAsyncThunk(
  "services/getServicesByIssue",
  async (issue, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/issue/${issue}`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get service statistics (Admin)
export const getServiceStats = createAsyncThunk(
  "services/getServiceStats",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.get(`${URL}/meta/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState: {
    services: [],
    currentService: null,
    categories: [],
    searchResults: [],
    servicesByCategory: [],
    stats: null,
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all services
      .addCase(getAllServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action?.payload?.data;
      })
      .addCase(getAllServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to fetch services";
      })
      .addCase(seedServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(seedServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage =
          action?.payload?.message || "Services seeded successfully";
          
      })
      .addCase(seedServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to seed services";
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentService = action?.payload?.data;
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to fetch service";
      })

      // Get categories
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action?.payload?.data;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to fetch categories";
      })

      // Get services by category
      .addCase(getServicesByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServicesByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.servicesByCategory = action?.payload?.data;
      })
      .addCase(getServicesByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to fetch services by category";
      })

      // Create service
      .addCase(createService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services.push(action?.payload?.data);
        state.successMessage =
          action?.payload?.message || "Service created successfully";
      })
      .addCase(createService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to create service";
      })

      // Update service
      .addCase(updateService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedService = action?.payload?.data;
        const index = state.services.findIndex(
          (service) => service._id === updatedService._id
        );
        if (index !== -1) {
          state.services[index] = updatedService;
        }
        state.currentService = updatedService;
        state.successMessage =
          action?.payload?.message || "Service updated successfully";
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to update service";
      })

      // Delete service
      .addCase(deleteService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from services array or mark as inactive
        state.services = state.services.filter(
          (service) => service._id !== action?.payload?.serviceId
        );
        state.successMessage =
          action?.payload?.message || "Service deleted successfully";
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to delete service";
      })

      // Activate service
      .addCase(activateService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(activateService.fulfilled, (state, action) => {
        state.isLoading = false;
        const activatedService = action?.payload?.data;
        const index = state.services.findIndex(
          (service) => service._id === activatedService._id
        );
        if (index !== -1) {
          state.services[index] = activatedService;
        } else {
          // Add back to services if it was filtered out
          state.services.push(activatedService);
        }
        state.successMessage =
          action?.payload?.message || "Service activated successfully";
      })
      .addCase(activateService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to activate service";
      })

      // Search services
      .addCase(searchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action?.payload?.data;
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Search failed";
      })

      // Get services by issue
      .addCase(getServicesByIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServicesByIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action?.payload?.data;
      })
      .addCase(getServicesByIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to fetch services by issue";
      })

      // Get service statistics
      .addCase(getServiceStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServiceStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action?.payload?.data;
      })
      .addCase(getServiceStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to fetch statistics";
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  clearSearchResults,
  clearCurrentService,
} = servicesSlice.actions;

export default servicesSlice.reducer;
