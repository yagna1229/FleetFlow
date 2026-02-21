import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet } from '../../api/client'

export const fetchDashboardKPIs = createAsyncThunk('analytics/dashboard', async () => {
    return await apiGet('/api/v1/analytics/dashboard')
})

export const fetchVehicleCosts = createAsyncThunk('analytics/vehicleCosts', async (vehicleId) => {
    return await apiGet(`/api/v1/analytics/vehicle/${vehicleId}/costs`)
})

export const fetchFuelEfficiency = createAsyncThunk('analytics/fuelEfficiency', async (vehicleId) => {
    return await apiGet(`/api/v1/analytics/vehicle/${vehicleId}/fuel-efficiency`)
})

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: {
        dashboard: null,
        vehicleCosts: null,
        fuelEfficiency: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardKPIs.pending, (s) => { s.status = 'loading' })
            .addCase(fetchDashboardKPIs.fulfilled, (s, a) => { s.dashboard = a.payload; s.status = 'succeeded' })
            .addCase(fetchDashboardKPIs.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message })
            .addCase(fetchVehicleCosts.fulfilled, (s, a) => { s.vehicleCosts = a.payload })
            .addCase(fetchFuelEfficiency.fulfilled, (s, a) => { s.fuelEfficiency = a.payload })
    },
})

export default analyticsSlice.reducer
