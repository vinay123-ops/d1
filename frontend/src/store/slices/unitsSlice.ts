import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Unit, DispatchRecommendation } from '@/types'

interface UnitsState {
  units: Unit[]
  recommendations: DispatchRecommendation[]
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: UnitsState = {
  units: [],
  recommendations: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
}

// Mock units data
const mockUnits: Unit[] = [
  {
    id: 'unit-1',
    type: 'police',
    name: 'Police Unit Alpha',
    status: 'available',
    location: [28.6140, 77.2095],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'unit-2',
    type: 'medical',
    name: 'Medical Team Beta',
    status: 'dispatched',
    location: [28.6150, 77.2080],
    assignedZone: 'zone-1',
    estimatedArrival: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'unit-3',
    type: 'fire',
    name: 'Fire Unit Gamma',
    status: 'available',
    location: [28.6110, 77.2110],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'unit-4',
    type: 'security',
    name: 'Security Team Delta',
    status: 'busy',
    location: [28.6170, 77.2070],
    assignedZone: 'zone-3',
    lastUpdated: new Date().toISOString(),
  },
]

export const fetchUnits = createAsyncThunk(
  'units/fetchUnits',
  async (_, { rejectWithValue }) => {
    try {
      return mockUnits
    } catch (error) {
      return rejectWithValue('Failed to fetch units')
    }
  }
)

export const dispatchUnit = createAsyncThunk(
  'units/dispatchUnit',
  async ({ unitId, zoneId }: { unitId: string; zoneId: string }, { rejectWithValue }) => {
    try {
      // Mock API call for dispatch
      return { unitId, zoneId, timestamp: new Date().toISOString() }
    } catch (error) {
      return rejectWithValue('Failed to dispatch unit')
    }
  }
)

const unitsSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUnitStatus: (state, action: PayloadAction<{ unitId: string; status: Unit['status']; location?: [number, number] }>) => {
      const { unitId, status, location } = action.payload
      const unit = state.units.find(u => u.id === unitId)
      if (unit) {
        unit.status = status
        if (location) {
          unit.location = location
        }
        unit.lastUpdated = new Date().toISOString()
      }
    },
    addRecommendation: (state, action: PayloadAction<DispatchRecommendation>) => {
      state.recommendations.push(action.payload)
    },
    removeRecommendation: (state, action: PayloadAction<string>) => {
      state.recommendations = state.recommendations.filter(r => r.zoneId !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.isLoading = false
        state.units = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(dispatchUnit.fulfilled, (state, action) => {
        const { unitId, zoneId } = action.payload
        const unit = state.units.find(u => u.id === unitId)
        if (unit) {
          unit.status = 'dispatched'
          unit.assignedZone = zoneId
          unit.estimatedArrival = new Date(Date.now() + 10 * 60 * 1000).toISOString()
          unit.lastUpdated = new Date().toISOString()
        }
      })
  },
})

export const { clearError, updateUnitStatus, addRecommendation, removeRecommendation } = unitsSlice.actions
export default unitsSlice.reducer 