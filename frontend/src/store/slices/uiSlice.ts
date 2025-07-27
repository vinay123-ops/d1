import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { UIState } from '@/types'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/utils/constants'

const initialState: UIState = {
  sidebarOpen: true,
  selectedZone: null,
  mapCenter: DEFAULT_MAP_CENTER,
  mapZoom: DEFAULT_MAP_ZOOM,
  filterCriteria: {},
  theme: 'light',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setSelectedZone: (state, action: PayloadAction<string | null>) => {
      state.selectedZone = action.payload
    },
    setMapCenter: (state, action: PayloadAction<[number, number]>) => {
      state.mapCenter = action.payload
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload
    },
    setMapView: (state, action: PayloadAction<{ center: [number, number]; zoom: number }>) => {
      state.mapCenter = action.payload.center
      state.mapZoom = action.payload.zoom
    },
    setFilterCriteria: (state, action: PayloadAction<UIState['filterCriteria']>) => {
      state.filterCriteria = action.payload
    },
    clearFilterCriteria: (state) => {
      state.filterCriteria = {}
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setSelectedZone,
  setMapCenter,
  setMapZoom,
  setMapView,
  setFilterCriteria,
  clearFilterCriteria,
  setTheme,
  toggleTheme,
} = uiSlice.actions

export default uiSlice.reducer 