import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Zone, ZoneDetails } from '@/types'

interface ZonesState {
  zones: Zone[]
  selectedZone: ZoneDetails | null
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: ZonesState = {
  zones: [],
  selectedZone: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// Mock zone data
const mockZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'Central Plaza',
    coordinates: [28.6139, 77.2090],
    status: 'bottleneck',
    crowdDensity: 85,
    lastUpdated: new Date().toISOString(),
    area: 2500,
  },
  {
    id: 'zone-2',
    name: 'North Gate',
    coordinates: [28.6180, 77.2100],
    status: 'normal',
    crowdDensity: 45,
    lastUpdated: new Date().toISOString(),
    area: 1800,
  },
  {
    id: 'zone-3',
    name: 'South Entrance',
    coordinates: [28.6100, 77.2080],
    status: 'anomaly',
    crowdDensity: 62,
    lastUpdated: new Date().toISOString(),
    area: 2100,
  },
  {
    id: 'zone-4',
    name: 'West Corridor',
    coordinates: [28.6120, 77.2050],
    status: 'normal',
    crowdDensity: 38,
    lastUpdated: new Date().toISOString(),
    area: 1600,
  },
  {
    id: 'zone-5',
    name: 'East Wing',
    coordinates: [28.6160, 77.2120],
    status: 'anomaly',
    crowdDensity: 71,
    lastUpdated: new Date().toISOString(),
    area: 2200,
  },
]

export const fetchZones = createAsyncThunk(
  'zones/fetchZones',
  async (_, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      return mockZones
    } catch (error) {
      return rejectWithValue('Failed to fetch zones')
    }
  }
)

export const fetchZoneDetails = createAsyncThunk(
  'zones/fetchZoneDetails',
  async (zoneId: string, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      const zone = mockZones.find(z => z.id === zoneId)
      if (!zone) {
        throw new Error('Zone not found')
      }
      
      const zoneDetails: ZoneDetails = {
        ...zone,
        summary: `Zone ${zone.name} is currently experiencing ${zone.status} conditions with ${zone.crowdDensity}% capacity.`,
        events: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            zoneId: zone.id,
            type: 'anomaly',
            severity: 'medium',
            description: 'Unusual crowd pattern detected',
            resolved: false,
          },
        ],
        nearbyUnits: [
          {
            id: 'unit-1',
            type: 'police',
            name: 'Police Unit Alpha',
            status: 'available',
            location: [zone.coordinates[0] + 0.001, zone.coordinates[1] + 0.001],
            lastUpdated: new Date().toISOString(),
          },
        ],
      }
      
      return zoneDetails
    } catch (error) {
      return rejectWithValue('Failed to fetch zone details')
    }
  }
)

const zonesSlice = createSlice({
  name: 'zones',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelectedZone: (state) => {
      state.selectedZone = null
    },
    updateZoneStatus: (state, action: PayloadAction<{ zoneId: string; status: Zone['status']; crowdDensity?: number }>) => {
      const { zoneId, status, crowdDensity } = action.payload
      const zone = state.zones.find(z => z.id === zoneId)
      if (zone) {
        zone.status = status
        if (crowdDensity !== undefined) {
          zone.crowdDensity = crowdDensity
        }
        zone.lastUpdated = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch zones
      .addCase(fetchZones.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.isLoading = false
        state.zones = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch zone details
      .addCase(fetchZoneDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchZoneDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedZone = action.payload
      })
      .addCase(fetchZoneDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearSelectedZone, updateZoneStatus } = zonesSlice.actions
export default zonesSlice.reducer 