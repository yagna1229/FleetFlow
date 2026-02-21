/**
 * Vehicle slice — CRUD + status operations.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost, apiPatch } from '../../api/client'

export const fetchVehicles = createAsyncThunk('vehicles/fetchAll', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.per_page) query.set('per_page', params.per_page)
    if (params.status_filter) query.set('status_filter', params.status_filter)
    const qs = query.toString()
    return await apiGet(`/api/v1/vehicles/${qs ? '?' + qs : ''}`)
})

export const fetchAvailableVehicles = createAsyncThunk('vehicles/fetchAvailable', async () => {
    return await apiGet('/api/v1/vehicles/available')
})

export const createVehicle = createAsyncThunk('vehicles/create', async (data, { rejectWithValue }) => {
    try {
        return await apiPost('/api/v1/vehicles/', data)
    } catch (err) {
        return rejectWithValue(err.data?.detail || err.message)
    }
})

export const updateVehicle = createAsyncThunk('vehicles/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        return await apiPatch(`/api/v1/vehicles/${id}`, data)
    } catch (err) {
        return rejectWithValue(err.data?.detail || err.message)
    }
})

export const retireVehicle = createAsyncThunk('vehicles/retire', async (id, { rejectWithValue }) => {
    try {
        return await apiPost(`/api/v1/vehicles/${id}/retire`)
    } catch (err) {
        return rejectWithValue(err.data?.detail || err.message)
    }
})

const vehicleSlice = createSlice({
    name: 'vehicles',
    initialState: {
        items: [],
        available: [],
        totalCount: 0,
        status: 'idle',
        error: null,
    },
    reducers: {
        clearVehicleError(state) { state.error = null },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.pending, (state) => { state.status = 'loading' })
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.items = action.payload
                state.status = 'succeeded'
            })
            .addCase(fetchVehicles.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(fetchAvailableVehicles.fulfilled, (state, action) => {
                state.available = action.payload
            })
            .addCase(createVehicle.fulfilled, (state, action) => {
                state.items.unshift(action.payload)
            })
            .addCase(createVehicle.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(updateVehicle.fulfilled, (state, action) => {
                const idx = state.items.findIndex(v => v.id === action.payload.id)
                if (idx !== -1) state.items[idx] = action.payload
            })
            .addCase(retireVehicle.fulfilled, (state, action) => {
                const idx = state.items.findIndex(v => v.id === action.payload.id)
                if (idx !== -1) state.items[idx] = action.payload
            })
    },
})

export const { clearVehicleError } = vehicleSlice.actions
export default vehicleSlice.reducer
