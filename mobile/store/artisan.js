import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadImageDirect } from "./imageUpload";

const URL = `${process.env.EXPO_PUBLIC_API_URL}/api/artisan`;

// Get all artisans with filtering and pagination
export const getAllArtisans = createAsyncThunk(
  "artisans/getAllArtisans",
  async (queryParams = {}, thunkAPI) => {
    try {
      const response = await axios.get(URL, { params: queryParams });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

//create a customer
export const createCustomer = createAsyncThunk(
  "artisans/createCustomer",
  async (customerData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/customer/customer/create`,
        customerData
      );
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "artisans/updateCustomer",
  async (customerData, thunkAPI) => {
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/customer/${customerData.id}`,
        customerData
      );
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.message);
    }
  }
);

//get customer by userId
export const getCustomerByUserId = createAsyncThunk(
  "artisans/getCustomerByUserId",
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/customer/user/${userId}`
      );
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get artisan by ID
export const getArtisanProfileById = createAsyncThunk(
  "artisans/getArtisanProfileById",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/${id}/profile-info`);

      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get artisan by user ID
export const getArtisanByUserId = createAsyncThunk(
  "artisans/getArtisanByUserId",
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/user/${userId}`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Create artisan profile
export const createArtisan = createAsyncThunk(
  "artisans/createArtisan",
  async (artisanData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.post(URL, artisanData, {
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

// Update artisan profile
export const updateArtisan = createAsyncThunk(
  "artisans/updateArtisan",
  async ({ artisanId, artisanData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.put(`${URL}/${artisanId}`, artisanData, {
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

// Update profile picture
export const updateProfilePicture = createAsyncThunk(
  "artisans/updateProfilePicture",
  async ({ artisanId, imageUrl }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.put(
        `${URL}/${artisanId}/profile-picture`,
        { imageUrl },
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

// Update availability
export const updateAvailability = createAsyncThunk(
  "artisans/updateAvailability",
  async ({ artisanId, availabilityData }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${URL}/${artisanId}/availability`, // This should match your backend route
        availabilityData // This should be { emergencyAvailable, isAvailable }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Add certification
export const addCertification = createAsyncThunk(
  "artisans/addCertification",
  async ({ artisanId, certificationData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.post(
        `${URL}/${artisanId}/certifications`,
        certificationData,
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

// Update Ghana Card
export const updateGhanaCard = createAsyncThunk(
  "artisans/updateGhanaCard",
  async ({ artisanId, number }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${URL}/${artisanId}/ghana-card/number`,
        {
          number: number,
        }
      );
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
export const updateBussinessName = createAsyncThunk(
  "artisans/bussinessName",
  async ({ artisanId, bussinessName }, thunkAPI) => {
    try {
      const response = await axios.patch(`${URL}/${artisanId}/business-name`, {
        businessName: bussinessName,
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
export const updateExperience = createAsyncThunk(
  "artisans/bussinessName",
  async ({ artisanId, experience }, thunkAPI) => {
    try {
      const response = await axios.patch(`${URL}/${artisanId}/experience`, {
        experience: experience,
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Update artisan status (Admin)
export const updateArtisanStatus = createAsyncThunk(
  "artisans/updateArtisanStatus",
  async ({ artisanId, statusData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.put(
        `${URL}/${artisanId}/status`,
        statusData,
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

// Verify Ghana Card (Admin)
export const verifyGhanaCard = createAsyncThunk(
  "artisans/verifyGhanaCard",
  async ({ artisanId, verified }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.put(
        `${URL}/${artisanId}/verify-ghana-card`,
        { verified },
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

// Update earnings
export const updateEarnings = createAsyncThunk(
  "artisans/updateEarnings",
  async ({ artisanId, earningsData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.put(
        `${URL}/${artisanId}/earnings`,
        earningsData,
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

// Add badge
export const addBadge = createAsyncThunk(
  "artisans/addBadge",
  async ({ artisanId, badge }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.post(
        `${URL}/${artisanId}/badges`,
        { badge },
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

// Upload media/portfolio
export const uploadMedia = createAsyncThunk(
  "artisans/uploadMedia",
  async ({ artisanId, mediaData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().user?.token;
      const response = await axios.post(
        `${URL}/${artisanId}/media`,
        mediaData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get artisans by service
export const getArtisansByService = createAsyncThunk(
  "artisans/getArtisansByService",
  async (serviceId, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/${serviceId}/services`);
      if (response.data.success === false) {
        // No artisans found - return empty array
        return [];
      }
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Get artisans by location
export const getArtisansByLocation = createAsyncThunk(
  "artisans/getArtisansByLocation",
  async (location, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/location/${location}`);
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Search artisans
export const searchArtisans = createAsyncThunk(
  "artisans/searchArtisans",
  async (query, thunkAPI) => {
    try {
      const response = await axios.get(`${URL}/search`, {
        params: { query },
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

// Update artisan services
export const updateArtisanServices = createAsyncThunk(
  "artisan/services",
  async ({ services, userId }, thunkAPI) => {
    try {
      const response = await axios.post(`${URL}/${userId}/services`, {
        services,
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const removeArtisanService = createAsyncThunk(
  "artisan/removeService",
  async ({ userId, serviceId }, thunkAPI) => {
    try {
      console.log("Removing service:", serviceId, "for user:", userId);
      const response = await axios.post(`${URL}/services/remove`, {
        userId,
        serviceId,
      });

      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || "Failed to remove service",
      });
    }
  }
);
export const getPopularArtisans = createAsyncThunk(
  "/popular",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${URL}/popular`);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.message);
    }
  }
);
const artisansSlice = createSlice({
  name: "artisans",
  initialState: {
    artisans: [],
    currentArtisan: null,
    artisan: null,
    artisansByService: [],
    artisansByLocation: [],
    searchResults: [],
    artisanServices: [],
    pagination: null,
    isLoading: false,
    loadingService: false,
    error: null,
    loadingPopular: false,
    successMessage: null,
    hasLoaded: false,
    popular: [],
    customer: null,
    loadingArtisanProfile: false,
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
    clearCurrentArtisan: (state) => {
      state.currentArtisan = null;
    },
    clearArtisans: (state) => {
      state.artisans = [];
      state.pagination = null;
    },
    updateArtisanInList: (state, action) => {
      const updatedArtisan = action.payload;
      const index = state.artisans.findIndex(
        (artisan) => artisan._id === updatedArtisan._id
      );
      if (index !== -1) {
        state.artisans[index] = updatedArtisan;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all artisans
      .addCase(getAllArtisans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllArtisans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.artisans = action?.payload?.data;
        state.pagination = action?.payload?.pagination;
        state.hasLoaded = true;
      })
      .addCase(getAllArtisans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to fetch artisans";
      })

      // Get artisan by ID
      .addCase(getArtisanProfileById.pending, (state) => {
        state.loadingArtisanProfile = true;
        state.error = null;
      })
      .addCase(getArtisanProfileById.fulfilled, (state, action) => {
        state.loadingArtisanProfile = false;
        const newArtisan = action?.payload?.data;
        // ✅ Prevents rerender loops caused by identical data
        if (state.currentArtisan?._id !== newArtisan?._id) {
          state.currentArtisan = newArtisan;
        }
      })
      .addCase(getArtisanProfileById.rejected, (state, action) => {
        state.loadingArtisanProfile = false;
        state.error = action?.payload?.message || "Failed to fetch artisan";
      })
      //get all popular artisans
      .addCase(getPopularArtisans.pending, (state) => {
        state.loadingPopular = true;
        state.error = null;
      })
      .addCase(getPopularArtisans.fulfilled, (state, action) => {
        state.loadingPopular = false;
        state.popular = action?.payload?.data;
      })
      .addCase(getPopularArtisans.rejected, (state, action) => {
        state.loadingPopular = false;
        state.error =
          action?.payload?.message || "Failed to fetch popular artisans";
      })

      // Get artisan by user ID
      .addCase(getArtisanByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getArtisanByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.artisan = action?.payload?.data;
      })
      .addCase(getArtisanByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to fetch artisan profile";
      })

      // Create artisan
      .addCase(createArtisan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createArtisan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentArtisan = action?.payload?.data;
        state.successMessage =
          action?.payload?.message || "Artisan profile created successfully";
      })
      .addCase(createArtisan.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to create artisan profile";
      })

      // Update artisan
      .addCase(updateBussinessName.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateBussinessName.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedArtisan = action?.payload?.data;
        state.currentArtisan = updatedArtisan;

        // Update in artisans list if exists
        const index = state.artisans.findIndex(
          (artisan) => artisan._id === updatedArtisan._id
        );
        if (index !== -1) {
          state.artisans[index] = updatedArtisan;
        }

        state.successMessage =
          action?.payload?.message || "Artisan profile updated successfully";
      })
      .addCase(updateBussinessName.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to update artisan profile";
      })

      //update services
      .addCase(updateArtisanServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateArtisanServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.artisanServices = action?.payload?.data.services;
        state.successMessage =
          action?.payload?.message || "Artisan services updated successfully";
      })
      .addCase(updateArtisanServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to update artisan services";
      })

      // Update availability
      .addCase(updateAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentArtisan) {
          state.currentArtisan.availability = action?.payload?.data;
        }
        state.successMessage =
          action?.payload?.message || "Availability updated successfully";
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to update availability";
      })

      // Add certification
      .addCase(addCertification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addCertification.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentArtisan) {
          state.currentArtisan.certifications = action?.payload?.data;
        }
        state.successMessage =
          action?.payload?.message || "Certification added successfully";
      })
      .addCase(addCertification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to add certification";
      })

      // Update Ghana Card
      .addCase(updateGhanaCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateGhanaCard.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentArtisan) {
          state.currentArtisan.ghanaCard = action?.payload?.data;
        }
        state.successMessage =
          action?.payload?.message || "Ghana Card updated successfully";
      })
      .addCase(updateGhanaCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to update Ghana Card";
      })

      // Update artisan status
      .addCase(updateArtisanStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateArtisanStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedArtisan = action?.payload?.data;

        // Update current artisan if it's the one being updated
        if (
          state.currentArtisan &&
          state.currentArtisan._id === updatedArtisan._id
        ) {
          state.currentArtisan = updatedArtisan;
        }

        // Update in artisans list
        const index = state.artisans.findIndex(
          (artisan) => artisan._id === updatedArtisan._id
        );
        if (index !== -1) {
          state.artisans[index] = updatedArtisan;
        }

        state.successMessage =
          action?.payload?.message || "Artisan status updated successfully";
      })
      .addCase(updateArtisanStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to update artisan status";
      })

      // Verify Ghana Card
      .addCase(verifyGhanaCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(verifyGhanaCard.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentArtisan) {
          state.currentArtisan.ghanaCard = action?.payload?.data;
        }
        state.successMessage =
          action?.payload?.message || "Ghana Card verification updated";
      })
      .addCase(verifyGhanaCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to verify Ghana Card";
      })

      // Update earnings
      .addCase(updateEarnings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentArtisan) {
          state.currentArtisan.earnings = action?.payload?.data;
        }
        state.successMessage =
          action?.payload?.message || "Earnings updated successfully";
      })
      .addCase(updateEarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to update earnings";
      })

      // Add badge
      .addCase(addBadge.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addBadge.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentArtisan) {
          state.currentArtisan.badges = action?.payload?.data;
        }
        state.successMessage =
          action?.payload?.message || "Badge added successfully";
      })
      .addCase(addBadge.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to add badge";
      })

      // Upload media
      .addCase(uploadMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentArtisan) {
          // Update media in current artisan
          state.currentArtisan.media = action?.payload?.data;
        }
        state.successMessage =
          action?.payload?.message || "Media uploaded successfully";
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to upload media";
      })

      // Get artisans by service
      .addCase(getArtisansByService.pending, (state) => {
        state.loadingService = true;
        // IMPORTANT: Clear old data immediately
        state.artisansByService = [];
        state.error = null;
      })
      .addCase(getArtisansByService.fulfilled, (state, action) => {
        state.loadingService = false;
        state.artisansByService = action.payload || [];
        state.error = null;
      })
      .addCase(getArtisansByService.rejected, (state, action) => {
        state.loadingService = false;
        // IMPORTANT: Clear old data on error too
        state.artisansByService = [];
        state.error = action.payload;
      })

      // Get artisans by location
      .addCase(getArtisansByLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getArtisansByLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.artisansByLocation = action?.payload?.data;
      })
      .addCase(getArtisansByLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action?.payload?.message || "Failed to fetch artisans by location";
      })

      // Search artisans
      .addCase(searchArtisans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchArtisans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action?.payload?.data;
      })
      .addCase(searchArtisans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Search failed";
      })
      .addCase(getCustomerByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCustomerByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customer = action?.payload?.data;
      })
      .addCase(getCustomerByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to fetch customer";
      });
  },
});
export const {
  clearError,
  clearSuccessMessage,
  clearSearchResults,
  clearCurrentArtisan,
  clearArtisans,
  updateArtisanInList,
} = artisansSlice.actions;

export default artisansSlice.reducer;
