import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { EventLogEntry } from '@/types'

interface EventsState {
  events: EventLogEntry[]
  filteredEvents: EventLogEntry[]
  filters: {
    zoneId?: string
    severity?: string[]
    type?: string[]
    timeRange?: [string, string]
    resolved?: boolean
  }
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: EventsState = {
  events: [],
  filteredEvents: [],
  filters: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// Mock events data
const mockEvents: EventLogEntry[] = [
  {
    id: 'event-1',
    timestamp: new Date().toISOString(),
    zoneId: 'zone-1',
    type: 'bottleneck',
    severity: 'high',
    description: 'Crowd bottleneck detected at Central Plaza entrance',
    details: { crowdDensity: 85, cameraId: 'cam-001' },
    resolved: false,
  },
  {
    id: 'event-2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    zoneId: 'zone-2',
    type: 'dispatch',
    severity: 'medium',
    description: 'Medical unit dispatched to North Gate',
    details: { unitId: 'unit-2', eta: '8 minutes' },
    unitId: 'unit-2',
    resolved: false,
  },
  {
    id: 'event-3',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    zoneId: 'zone-3',
    type: 'anomaly',
    severity: 'medium',
    description: 'Unusual crowd pattern detected in South Entrance',
    details: { confidence: 0.85, pattern: 'circular_movement' },
    resolved: true,
    resolvedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
]

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params: { limit?: number; zoneId?: string } = {}, { rejectWithValue }) => {
    try {
      // Mock API call with optional filtering
      let filteredEvents = [...mockEvents]
      
      if (params.zoneId) {
        filteredEvents = filteredEvents.filter(e => e.zoneId === params.zoneId)
      }
      
      if (params.limit) {
        filteredEvents = filteredEvents.slice(0, params.limit)
      }
      
      return filteredEvents
    } catch (error) {
      return rejectWithValue('Failed to fetch events')
    }
  }
)

export const resolveEvent = createAsyncThunk(
  'events/resolveEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      // Mock API call
      return { eventId, resolvedAt: new Date().toISOString() }
    } catch (error) {
      return rejectWithValue('Failed to resolve event')
    }
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    addEvent: (state, action: PayloadAction<EventLogEntry>) => {
      state.events.unshift(action.payload)
      // Apply current filters to the new event
      state.filteredEvents = applyFilters(state.events, state.filters)
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload
      state.filteredEvents = applyFilters(state.events, state.filters)
    },
    clearFilters: (state) => {
      state.filters = {}
      state.filteredEvents = state.events
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.events = action.payload
        state.filteredEvents = applyFilters(action.payload, state.filters)
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(resolveEvent.fulfilled, (state, action) => {
        const { eventId, resolvedAt } = action.payload
        const event = state.events.find(e => e.id === eventId)
        if (event) {
          event.resolved = true
          event.resolvedAt = resolvedAt
        }
        state.filteredEvents = applyFilters(state.events, state.filters)
      })
  },
})

// Helper function to apply filters
function applyFilters(events: EventLogEntry[], filters: typeof initialState.filters): EventLogEntry[] {
  let filtered = [...events]
  
  if (filters.zoneId) {
    filtered = filtered.filter(e => e.zoneId === filters.zoneId)
  }
  
  if (filters.severity && filters.severity.length > 0) {
    filtered = filtered.filter(e => filters.severity!.includes(e.severity))
  }
  
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(e => filters.type!.includes(e.type))
  }
  
  if (filters.resolved !== undefined) {
    filtered = filtered.filter(e => e.resolved === filters.resolved)
  }
  
  if (filters.timeRange) {
    const [start, end] = filters.timeRange
    filtered = filtered.filter(e => e.timestamp >= start && e.timestamp <= end)
  }
  
  return filtered
}

export const { clearError, addEvent, setFilters, clearFilters } = eventsSlice.actions
export default eventsSlice.reducer 