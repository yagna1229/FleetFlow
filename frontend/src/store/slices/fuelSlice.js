import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../../api/client";

export const fetchFuelLogs = createAsyncThunk(
  "fuel/fetchAll",
  async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.vehicle_id) query.set("vehicle_id", params.vehicle_id);
    const qs = query.toString();
    return await apiGet(`/api/v1/fuel/${qs ? "?" + qs : ""}`);
  },
);

export const createFuelLog = createAsyncThunk(
  "fuel/create",
  async (data, { rejectWithValue }) => {
    try {
      return await apiPost("/api/v1/fuel/", data);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

const fuelSlice = createSlice({
  name: "fuel",
  initialState: { items: [], status: "idle", error: null },
  reducers: {
    clearFuelError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFuelLogs.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchFuelLogs.fulfilled, (s, a) => {
        s.items = a.payload;
        s.status = "succeeded";
      })
      .addCase(fetchFuelLogs.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      })
      .addCase(createFuelLog.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(createFuelLog.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export const { clearFuelError } = fuelSlice.actions;
export default fuelSlice.reducer;
