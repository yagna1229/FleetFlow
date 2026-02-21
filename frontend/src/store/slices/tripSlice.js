/**
 * Trip slice — full dispatch lifecycle.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../../api/client";

export const fetchTrips = createAsyncThunk(
  "trips/fetchAll",
  async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    if (params.status_filter) query.set("status_filter", params.status_filter);
    const qs = query.toString();
    return await apiGet(`/api/v1/trips/${qs ? "?" + qs : ""}`);
  },
);

export const fetchTripDetail = createAsyncThunk(
  "trips/fetchDetail",
  async (id) => {
    return await apiGet(`/api/v1/trips/${id}`);
  },
);

export const createTrip = createAsyncThunk(
  "trips/create",
  async (data, { rejectWithValue }) => {
    try {
      return await apiPost("/api/v1/trips/", data);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

export const dispatchTrip = createAsyncThunk(
  "trips/dispatch",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await apiPost(`/api/v1/trips/${id}/dispatch`, data);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

export const completeTrip = createAsyncThunk(
  "trips/complete",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await apiPost(`/api/v1/trips/${id}/complete`, data);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

export const cancelTrip = createAsyncThunk(
  "trips/cancel",
  async (id, { rejectWithValue }) => {
    try {
      return await apiPost(`/api/v1/trips/${id}/cancel`);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

const tripSlice = createSlice({
  name: "trips",
  initialState: {
    items: [],
    currentTrip: null,
    totalCount: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    clearTripError(state) {
      state.error = null;
    },
    clearCurrentTrip(state) {
      state.currentTrip = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchTripDetail.fulfilled, (state, action) => {
        state.currentTrip = action.payload;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(dispatchTrip.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentTrip?.id === action.payload.id)
          state.currentTrip = action.payload;
      })
      .addCase(completeTrip.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentTrip?.id === action.payload.id)
          state.currentTrip = action.payload;
      })
      .addCase(cancelTrip.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentTrip?.id === action.payload.id)
          state.currentTrip = action.payload;
      });
  },
});

export const { clearTripError, clearCurrentTrip } = tripSlice.actions;
export default tripSlice.reducer;
