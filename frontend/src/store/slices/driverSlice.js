/**
 * Driver slice — CRUD + compliance operations.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, apiPatch } from "../../api/client";

export const fetchDrivers = createAsyncThunk(
  "drivers/fetchAll",
  async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    if (params.status_filter) query.set("status_filter", params.status_filter);
    const qs = query.toString();
    return await apiGet(`/api/v1/drivers/${qs ? "?" + qs : ""}`);
  },
);

export const fetchDriver = createAsyncThunk("drivers/fetchOne", async (id) => {
  return await apiGet(`/api/v1/drivers/${id}`);
});

export const fetchAvailableDrivers = createAsyncThunk(
  "drivers/fetchAvailable",
  async () => {
    return await apiGet("/api/v1/drivers/available");
  },
);

export const fetchExpiringLicenses = createAsyncThunk(
  "drivers/fetchExpiring",
  async (days = 30) => {
    return await apiGet(
      `/api/v1/drivers/expiring-licenses?within_days=${days}`,
    );
  },
);

export const createDriver = createAsyncThunk(
  "drivers/create",
  async (data, { rejectWithValue }) => {
    try {
      return await apiPost("/api/v1/drivers/", data);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

export const updateDriver = createAsyncThunk(
  "drivers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await apiPatch(`/api/v1/drivers/${id}`, data);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

const driverSlice = createSlice({
  name: "drivers",
  initialState: {
    items: [],
    available: [],
    expiring: [],
    totalCount: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    clearDriverError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchAvailableDrivers.fulfilled, (state, action) => {
        state.available = action.payload;
      })
      .addCase(fetchExpiringLicenses.fulfilled, (state, action) => {
        state.expiring = action.payload;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        const idx = state.items.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { clearDriverError } = driverSlice.actions;
export default driverSlice.reducer;
