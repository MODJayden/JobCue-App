import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Upload to Cloudinary with default folder
export const uploadImageDirect = createAsyncThunk(
  "imageUpload/uploadImageDirect",
  async (imageUri, thunkAPI) => {
    try {

     
      // Create FormData CORRECTLY
      const formData = new FormData();

      // Extract filename from URI
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // IMPORTANT: Create the file object correctly for React Native
      const file = {
        uri: imageUri,
        type: type,
        name: filename || `upload_${Date.now()}.jpg`,
      };

      // Append the file object directly (not as an object)
      formData.append("image", file);

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/imageUploader/direct`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data) => data,
          timeout: 30000,
        }
      );

      return response?.data?.data;


    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload image";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

// Upload profile picture (combines direct upload + artisan update)
export const uploadProfilePicture = createAsyncThunk(
  "imageUpload/uploadProfilePicture",
  async ({ artisanId, imageUri }, thunkAPI) => {
    try {
      // First upload to Cloudinary
      const uploadResult = await thunkAPI.dispatch(uploadImageDirect(imageUri));

      // Then update artisan profile with the new image URL
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/artisan/${artisanId}/profile-picture`,
        {
          imageUrl: uploadResult?.payload.secure_url,
        }
      );

      return {
        secure_url: uploadResult.payload.secure_url,
        message: "Profile picture updated successfully",
        artisanData: response.data,
      };
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        `Failed to upload profile picture ${error.message}`;
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const deleteImage = createAsyncThunk(
  "imageUpload/deleteImage",
  async ({ imageUrl }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/artisan/delete`,
        {
          imageUrl,
        }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete image";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);
// Upload portfolio image
export const uploadPortfolioImage = createAsyncThunk(
  "imageUpload/uploadPortfolioImage",
  async (portfolioData, thunkAPI) => {
    try {
      const {
        category,
        description,
        type,
        imageUri, // For single images
        beforeImageUri, // For before/after
        afterImageUri, // For before/after
        artisanId,
      } = portfolioData;

      let requestData = {
        category,
        description: description || "",
        type,
      };

      // Handle before/after pair
      if (type === "before_after_pair") {
        if (!beforeImageUri || !afterImageUri) {
          return thunkAPI.rejectWithValue({
            message: "Both before and after images are required",
          });
        }

        // Upload before image to Cloudinary
        const beforeUploadResult = await thunkAPI
          .dispatch(uploadImageDirect(beforeImageUri))
          .unwrap();

        // Upload after image to Cloudinary
        const afterUploadResult = await thunkAPI
          .dispatch(uploadImageDirect(afterImageUri))
          .unwrap();

        requestData = {
          ...requestData,
          beforeImage: beforeUploadResult.secure_url,
          afterImage: afterUploadResult.secure_url,
        };
      }
      // Handle single image
      else if (type === "single") {
        if (!imageUri) {
          return thunkAPI.rejectWithValue({
            message: "Image is required",
          });
        }

        // Upload single image to Cloudinary
        const uploadResult = await thunkAPI
          .dispatch(uploadImageDirect(imageUri))
          .unwrap();

        requestData = {
          ...requestData,
          image: uploadResult.secure_url,
        };
      } else {
        return thunkAPI.rejectWithValue({
          message: "Invalid portfolio type",
        });
      }

      // Send to backend
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/artisan/${artisanId}/portfolio`,
        requestData
      );

      return {
        success: true,
        message: response.data.message || "Portfolio item added successfully",
        portfolioItem: response.data.data.portfolioItem,
        totalItems: response.data.data.totalItems,
        remainingSlots: response.data.data.remainingSlots,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload portfolio image";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const uploadGhanaCardFront = createAsyncThunk(
  "imageUpload/uploadGhanaCardFront",
  async ({ artisanId, imageUri }, thunkAPI) => {
    try {
      // Upload image to Cloudinary
      const uploadResult = await thunkAPI
        .dispatch(uploadImageDirect(imageUri))
        .unwrap();

      // Update artisan with Ghana Card front image

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/artisan/${artisanId}/ghana-card/image`,
        {
          frontImage: uploadResult.secure_url,
        }
      );

      return {
        ...uploadResult,
        message: "Ghana Card front image uploaded successfully",
        frontImage: uploadResult.secure_url,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload Ghana Card front image";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);
export const uploadGhanaCardBack = createAsyncThunk(
  "imageUpload/uploadGhanaCardFront",
  async ({ artisanId, imageUri }, thunkAPI) => {
    try {
      // Upload image to Cloudinary
      const uploadResult = await thunkAPI
        .dispatch(uploadImageDirect(imageUri))
        .unwrap();

      // Update artisan with Ghana Card front image

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/artisan/${artisanId}/ghana-card/image`,
        {
          backImage: uploadResult.secure_url,
        }
      );

      return {
        ...uploadResult,
        message: "Ghana Card back image uploaded successfully",
        backImage: uploadResult.secure_url,
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload Ghana Card front image";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const removePortfolioItem = createAsyncThunk(
  "imageUpload/removePortfolioItem",
  async ({ artisanId, portfolioItemId }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/artisan/${artisanId}/remove-portfolio-item/${portfolioItemId}`
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove portfolio item";
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

const imageUploadSlice = createSlice({
  name: "imageUpload",
  initialState: {
    imageUrl: null,
    isLoading: false,
    error: null,
    successMessage: null,
    uploadProgress: 0,
    isUploading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearImageUrl: (state) => {
      state.imageUrl = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadState: (state) => {
      state.imageUrl = null;
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
      state.uploadProgress = 0;
      state.isUploading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Image Direct
      .addCase(uploadImageDirect.pending, (state) => {
        state.isLoading = true;
        state.isUploading = true;
        state.error = null;
        state.successMessage = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadImageDirect.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUploading = false;
        state.imageUrl = action?.payload?.secure_url;
        state.successMessage = "Image uploaded successfully";
        state.uploadProgress = 100;
      })
      .addCase(uploadImageDirect.rejected, (state, action) => {
        state.isLoading = false;
        state.isUploading = false;
        state.error = action?.payload?.message || "Failed to upload image";
        state.uploadProgress = 0;
      })

      // Upload Profile Picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.isLoading = true;
        state.isUploading = true;
        state.error = null;
        state.successMessage = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUploading = false;
        state.imageUrl = action?.payload?.secure_url;
        state.successMessage =
          action?.payload?.message || "Profile picture updated successfully";
        state.uploadProgress = 100;
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.isLoading = false;
        state.isUploading = false;
        state.error =
          action?.payload?.message || "Failed to upload profile picture";
        state.uploadProgress = 0;
      })
      // Upload Portfolio Image
      .addCase(uploadPortfolioImage.pending, (state) => {
        state.isLoading = true;
        state.isUploading = true;
        state.error = null;
        state.successMessage = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadPortfolioImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUploading = false;
        state.imageUrl = action?.payload?.secure_url;
        state.successMessage =
          action?.payload?.message || "Portfolio image uploaded successfully";
        state.uploadProgress = 100;
      })
      .addCase(uploadPortfolioImage.rejected, (state, action) => {
        state.isLoading = false;
        state.isUploading = false;
        state.error =
          action?.payload?.message || "Failed to upload portfolio image";
        state.uploadProgress = 0;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  clearImageUrl,
  setUploadProgress,
  resetUploadState,
} = imageUploadSlice.actions;

export default imageUploadSlice.reducer;
