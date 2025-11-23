import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/booking`;

// ✅ Create Booking
export const createBooking = createAsyncThunk(
  "booking/create",
  async (data, thunkAPI) => {
    try {
      const res = await axios.post(`${BASE_URL}/create`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// ✅ Artisan proposes a price
export const proposePrice = createAsyncThunk(
  "booking/proposePrice",
  async ({ bookingId, proposedPrice, artisanId }, thunkAPI) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/${bookingId}/propose/${artisanId}`,
        {
          proposedPrice,
        }
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

// ✅ Customer approves proposed price
export const approvePrice = createAsyncThunk(
  "booking/approvePrice",
  async ({ bookingId, customerId, approved }, thunkAPI) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/${bookingId}/approve/${customerId}`,
        { approved }
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getBookingForUser = createAsyncThunk(
  "booking/getBookingForUser",
  async (userId, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/user/${userId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

export const getBookingForArtisan = createAsyncThunk(
  "booking/getBookingForArtisan",
  async (artisanId, thunkAPI) => {
    try {
      const res = await axios.get(`${BASE_URL}/artisan/${artisanId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const initialState = {
  bookings: [],
  booking: null,
  isLoading: false,
  error: null,
  successMessage: null,
  artisanBookings: [],
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    updateSingleBooking: (state, action) => {
      const updated = action.payload;
      const index = state.bookings.findIndex((b) => b._id === updated._id);

      if (index !== -1) {
        // ✅ Replace existing booking
        state.bookings[index] = { ...state.bookings[index], ...updated };
      } else {
        // ✅ If booking doesn’t exist, add it
        state.bookings.unshift(updated);
      }
    },
    clearBookings: (state) => {
      state.bookings = [];
    },
    updateSingleArtisanBooking: (state, action) => {
      const updated = action.payload;
      const index = state.artisanBookings.findIndex(
        (b) => b._id === updated._id
      );
      if (index !== -1) {
        state.artisanBookings[index] = {
          ...state.artisanBookings[index],
          ...updated,
        };
      } else {
        state.artisanBookings.unshift(updated);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Create Booking ---
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Booking created successfully.";
        state.bookings.push(action.payload.data);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Propose Price ---
      .addCase(proposePrice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(proposePrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Price proposed successfully.";
        state.booking = action.payload.data;
      })
      .addCase(proposePrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Approve Price ---
      .addCase(approvePrice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approvePrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Price approved successfully.";
        state.booking = action.payload.data;
      })
      .addCase(approvePrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // --- Get Booking for User ---
      .addCase(getBookingForUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBookingForUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Booking fetched successfully.";
        state.bookings = action.payload.data;
      })
      .addCase(getBookingForUser.rejected, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Error fetching bookings.";
        state.bookings = [];
      })
      // --- Get Booking for Artisan ---
      .addCase(getBookingForArtisan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBookingForArtisan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Booking fetched successfully.";
        state.artisanBookings = action.payload.data;
      })
      .addCase(getBookingForArtisan.rejected, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Error fetching bookings.";
        state.artisanBookings = [];
      });
  },
});

export const {
  clearMessages,
  updateSingleBooking,
  clearBookings,
  updateSingleArtisanBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
