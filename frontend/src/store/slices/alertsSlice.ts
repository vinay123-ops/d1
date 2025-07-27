import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Alert } from '@/types'

interface AlertsState {
  alerts: Alert[]
  unacknowledgedCount: number
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: AlertsState = {
  alerts: [],
  unacknowledgedCount: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'crowd',
    title: 'High Crowd Density Alert',
    message: 'Central Plaza is experiencing unusually high crowd density',
    severity: 'high',
    zoneId: 'zone-1',
    timestamp: new Date().toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-2',
    type: 'security',
    title: 'Suspicious Activity',
    message: 'Unusual patterns detected in East Wing security cameras',
    severity: 'medium',
    zoneId: 'zone-5',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
]

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      return mockAlerts
    } catch (error) {
      return rejectWithValue('Failed to fetch alerts')
    }
  }
)

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledgeAlert',
  async ({ alertId, commanderId }: { alertId: string; commanderId: string }, { rejectWithValue }) => {
    try {
      // Mock API call
      return { alertId, commanderId, timestamp: new Date().toISOString() }
    } catch (error) {
      return rejectWithValue('Failed to acknowledge alert')
    }
  }
)

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload)
      if (!action.payload.acknowledged) {
        state.unacknowledgedCount += 1
      }
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      const alertIndex = state.alerts.findIndex(a => a.id === action.payload)
      if (alertIndex !== -1) {
        const alert = state.alerts[alertIndex]
        if (!alert.acknowledged) {
          state.unacknowledgedCount -= 1
        }
        state.alerts.splice(alertIndex, 1)
      }
    },
    updateAlertSeverity: (state, action: PayloadAction<{ alertId: string; severity: Alert['severity'] }>) => {
      const { alertId, severity } = action.payload
      const alert = state.alerts.find(a => a.id === alertId)
      if (alert) {
        alert.severity = severity
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts = action.payload
        state.unacknowledgedCount = action.payload.filter(a => !a.acknowledged).length
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const { alertId, commanderId, timestamp } = action.payload
        const alert = state.alerts.find(a => a.id === alertId)
        if (alert && !alert.acknowledged) {
          alert.acknowledged = true
          alert.acknowledgedBy = commanderId
          alert.acknowledgedAt = timestamp
          state.unacknowledgedCount -= 1
        }
      })
  },
})

export const { clearError, addAlert, removeAlert, updateAlertSeverity } = alertsSlice.actions
export default alertsSlice.reducer 