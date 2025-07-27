import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuthState, Commander } from '@/types'

const initialState: AuthState = {
  isAuthenticated: false,
  commander: null,
  loading: false,
  error: null,
}

// Mock commander data
const mockCommander: Commander = {
  id: 'cmd-001',
  name: 'Commander Sarah Johnson',
  rank: 'Senior Commander',
  division: 'Central Operations',
  lastActive: new Date().toISOString(),
  permissions: ['VIEW_ALL', 'DISPATCH_UNITS', 'ACKNOWLEDGE_ALERTS', 'EXPORT_DATA'],
}

export const loginCommander = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Mock authentication - replace with actual API call
      if (email === 'commander@drishti.com' && password === 'password') {
        return mockCommander
      }
      throw new Error('Invalid credentials')
    } catch (error) {
      return rejectWithValue('Authentication failed')
    }
  }
)

export const logoutCommander = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Mock logout - replace with actual API call
      return true
    } catch (error) {
      return rejectWithValue('Logout failed')
    }
  }
)

export const updateFCMToken = createAsyncThunk(
  'auth/updateFCMToken',
  async (fcmToken: string, { rejectWithValue }) => {
    try {
      // Mock API call to update FCM token
      return fcmToken
    } catch (error) {
      return rejectWithValue('Failed to update FCM token')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateLastActive: (state) => {
      if (state.commander) {
        state.commander.lastActive = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginCommander.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginCommander.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.commander = action.payload
      })
      .addCase(loginCommander.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logoutCommander.fulfilled, (state) => {
        state.isAuthenticated = false
        state.commander = null
        state.error = null
      })
      // Update FCM token
      .addCase(updateFCMToken.fulfilled, (state, action) => {
        if (state.commander) {
          state.commander.fcmToken = action.payload
        }
      })
  },
})

export const { clearError, updateLastActive } = authSlice.actions
export default authSlice.reducer 