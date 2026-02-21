import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost } from '../../api/client'

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (params = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.trip_id) query.set('trip_id', params.trip_id)
    const qs = query.toString()
    return await apiGet(`/api/v1/expenses/${qs ? '?' + qs : ''}`)
})

export const createExpense = createAsyncThunk('expenses/create', async (data, { rejectWithValue }) => {
    try { return await apiPost('/api/v1/expenses/', data) }
    catch (err) { return rejectWithValue(err.data?.detail || err.message) }
})

const expenseSlice = createSlice({
    name: 'expenses',
    initialState: { items: [], status: 'idle', error: null },
    reducers: { clearExpenseError(state) { state.error = null } },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (s) => { s.status = 'loading' })
            .addCase(fetchExpenses.fulfilled, (s, a) => { s.items = a.payload; s.status = 'succeeded' })
            .addCase(fetchExpenses.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message })
            .addCase(createExpense.fulfilled, (s, a) => { s.items.unshift(a.payload) })
            .addCase(createExpense.rejected, (s, a) => { s.error = a.payload })
    },
})

export const { clearExpenseError } = expenseSlice.actions
export default expenseSlice.reducer
