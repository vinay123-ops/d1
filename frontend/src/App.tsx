import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchZones } from '@/store/slices/zonesSlice'
import { fetchUnits } from '@/store/slices/unitsSlice'
import { fetchAlerts } from '@/store/slices/alertsSlice'
import DashboardLayout from '@/components/DashboardLayout'
import LoginPage from '@/features/auth/LoginPage'
import MainDashboard from '@/features/dashboard/MainDashboard'
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  // Initialize data on app start
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchZones())
      dispatch(fetchUnits())
      dispatch(fetchAlerts())
    }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <Routes>
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </ErrorBoundary>
  )
}

export default App 