import { useEffect } from 'react'
import { useAppDispatch } from '@/store'
import { fetchDashboardMetrics, fetchAnalyticsData, fetchSummaryFeed } from '@/store/slices/dashboardSlice'
import ZoneMap from '@/features/map/ZoneMap'
import AnalyticsPanel from '@/features/analytics/AnalyticsPanel'
import SummaryFeed from '@/features/summary/SummaryFeed'
import LiveAlerts from '@/features/alerts/LiveAlerts'
import DispatchConsole from '@/features/dispatch/DispatchConsole'
import EventLog from '@/features/events/EventLog'

export default function MainDashboard() {
  const dispatch = useAppDispatch()

  // Load dashboard data on mount
  useEffect(() => {
    dispatch(fetchDashboardMetrics())
    dispatch(fetchAnalyticsData())
    dispatch(fetchSummaryFeed())
  }, [dispatch])

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="grid grid-cols-12 gap-4 h-full min-h-[800px]">
        {/* Live Alerts - Full width top */}
        <div className="col-span-12">
          <LiveAlerts />
        </div>

        {/* Analytics Panel - Top left */}
        <div className="col-span-12 lg:col-span-8">
          <AnalyticsPanel />
        </div>

        {/* Summary Feed - Top right */}
        <div className="col-span-12 lg:col-span-4">
          <SummaryFeed />
        </div>

        {/* Zone Map - Center */}
        <div className="col-span-12 lg:col-span-8 h-[500px]">
          <ZoneMap />
        </div>

        {/* Dispatch Console - Center right */}
        <div className="col-span-12 lg:col-span-4">
          <DispatchConsole />
        </div>

        {/* Event Log - Bottom full */}
        <div className="col-span-12">
          <EventLog />
        </div>
      </div>
    </div>
  )
} 