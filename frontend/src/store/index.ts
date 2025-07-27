import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

import dashboardSlice from './slices/dashboardSlice'
import zonesSlice from './slices/zonesSlice'
import unitsSlice from './slices/unitsSlice'
import alertsSlice from './slices/alertsSlice'
import eventsSlice from './slices/eventsSlice'
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice,
    zones: zonesSlice,
    units: unitsSlice,
    alerts: alertsSlice,
    events: eventsSlice,
    auth: authSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Custom hooks with proper typing
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store 