import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../../api/client";

export const fetchMaintenanceLogs = createAsyncThunk(
  "maintenance/fetchAll",
  async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.vehicle_id) query.set("vehicle_id", params.vehicle_id);
    const qs = query.toString();
    return await apiGet(`/api/v1/maintenance/${qs ? "?" + qs : ""}`);
  },
);

export const createMaintenanceLog = createAsyncThunk(
  "maintenance/create",
  async (data, { rejectWithValue }) => {
    try {
      return await apiPost("/api/v1/maintenance/", data);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

export const completeMaintenanceLog = createAsyncThunk(
  "maintenance/complete",
  async (id, { rejectWithValue }) => {
    try {
      return await apiPost(`/api/v1/maintenance/${id}/complete`);
    } catch (err) {
      return rejectWithValue(err.data?.detail || err.message);
    }
  },
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState: { items: [], status: "idle", error: null },
  reducers: {
    clearMaintenanceError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceLogs.pending, (s) => {
        s.status = "loading";
      })
      .addCase(fetchMaintenanceLogs.fulfilled, (s, a) => {
        s.items = a.payload;
        s.status = "succeeded";
      })
      .addCase(fetchMaintenanceLogs.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      })
      .addCase(createMaintenanceLog.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
      })
      .addCase(createMaintenanceLog.rejected, (s, a) => {
        s.error = a.payload;
      })
      .addCase(completeMaintenanceLog.fulfilled, (s, a) => {
        const idx = s.items.findIndex((m) => m.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      });
  },
});

export const { clearMaintenanceError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
