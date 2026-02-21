/**
 * Auth slice — user session with role, authentication state.
 * Uses /auth/me to check auth and get role.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGet, apiPost } from '../../api/client'

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    try {
        const data = await apiGet('/auth/me')
        return data // { user_id, email, role }
    } catch (err) {
        return rejectWithValue(err.message)
    }
})

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const data = await apiPost('/auth/login', credentials)
        return data // { message, role }
    } catch (err) {
        return rejectWithValue(err.data?.detail || err.message)
    }
})

export const signupUser = createAsyncThunk('auth/signup', async (credentials, { rejectWithValue }) => {
    try {
        const data = await apiPost('/auth/signup', credentials)
        return data // { message, role }
    } catch (err) {
        return rejectWithValue(err.data?.detail || err.message)
    }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    await apiPost('/auth/logout')
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,       // { user_id, email, role }
        role: null,        // 'manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst'
        isAuthenticated: false,
        status: 'idle',    // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        clearAuthError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // checkAuth — /auth/me returns { user_id, email, role }
            .addCase(checkAuth.pending, (state) => { state.status = 'loading' })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true
                state.user = action.payload
                state.role = action.payload.role
                state.status = 'succeeded'
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isAuthenticated = false
                state.user = null
                state.role = null
                state.status = 'failed'
            })
            // login — returns { message, role }
            .addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = null })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isAuthenticated = true
                state.role = action.payload.role
                state.status = 'succeeded'
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // signup — returns { message, role }
            .addCase(signupUser.pending, (state) => { state.status = 'loading'; state.error = null })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isAuthenticated = true
                state.role = action.payload.role
                state.status = 'succeeded'
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.role = null
                state.isAuthenticated = false
                state.status = 'idle'
            })
    },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
