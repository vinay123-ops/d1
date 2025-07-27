import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { DashboardMetrics, AnalyticsData, SummaryEntry } from '@/types'

interface DashboardState {
  metrics: DashboardMetrics | null
  analytics: AnalyticsData | null
  summaryFeed: SummaryEntry[]
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: DashboardState = {
  metrics: null,
  analytics: null,
  summaryFeed: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// Async thunks for API calls
export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      // Mock data for now - replace with actual API call
      const metrics: DashboardMetrics = {
        totalZones: 12,
        bottlenecks: 3,
        anomalies: 5,
        unitsDispatched: 8,
        activeAlerts: 2,
        lastUpdated: new Date().toISOString(),
      }
      return metrics
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard metrics')
    }
  }
)

export const fetchAnalyticsData = createAsyncThunk(
  'dashboard/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      // Mock data for now - replace with actual API call
      const analytics: AnalyticsData = {
        crowdDensityTrend: [
          { timestamp: '10:00', value: 45 },
          { timestamp: '10:30', value: 52 },
          { timestamp: '11:00', value: 68 },
          { timestamp: '11:30', value: 73 },
          { timestamp: '12:00', value: 85 },
        ],
        anomalyTrend: [
          { timestamp: '10:00', value: 2 },
          { timestamp: '10:30', value: 3 },
          { timestamp: '11:00', value: 5 },
          { timestamp: '11:30', value: 4 },
          { timestamp: '12:00', value: 6 },
        ],
        dispatchTrend: [
          { timestamp: '10:00', value: 1 },
          { timestamp: '10:30', value: 2 },
          { timestamp: '11:00', value: 3 },
          { timestamp: '11:30', value: 2 },
          { timestamp: '12:00', value: 4 },
        ],
        zoneStatusDistribution: {
          normal: 7,
          anomaly: 3,
          bottleneck: 2,
          critical: 0,
        },
      }
      return analytics
    } catch (error) {
      return rejectWithValue('Failed to fetch analytics data')
    }
  }
)

export const fetchSummaryFeed = createAsyncThunk(
  'dashboard/fetchSummaryFeed',
  async (_, { rejectWithValue }) => {
    try {
      // Mock data for now - replace with actual API call
      const summaryFeed: SummaryEntry[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          zoneId: 'zone-1',
          zoneName: 'Central Plaza',
          combinedSummary: 'High crowd density detected with minor anomalies',
          crowdDensity: 85,
          anomalyCount: 2,
          severity: 'high',
          status: 'bottleneck',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          zoneId: 'zone-2',
          zoneName: 'North Gate',
          combinedSummary: 'Normal crowd flow, no incidents reported',
          crowdDensity: 45,
          anomalyCount: 0,
          severity: 'low',
          status: 'normal',
        },
      ]
      return summaryFeed
    } catch (error) {
      return rejectWithValue('Failed to fetch summary feed')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addSummaryEntry: (state, action: PayloadAction<SummaryEntry>) => {
      state.summaryFeed.unshift(action.payload)
      // Keep only the latest 100 entries
      state.summaryFeed = state.summaryFeed.slice(0, 100)
    },
    updateMetrics: (state, action: PayloadAction<Partial<DashboardMetrics>>) => {
      if (state.metrics) {
        state.metrics = { ...state.metrics, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false
        state.metrics = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch analytics
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.isLoading = false
        state.analytics = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch summary feed
      .addCase(fetchSummaryFeed.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSummaryFeed.fulfilled, (state, action) => {
        state.isLoading = false
        state.summaryFeed = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchSummaryFeed.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, addSummaryEntry, updateMetrics } = dashboardSlice.actions
export default dashboardSlice.reducer 