import { useAppSelector, useAppDispatch } from '@/store'
import { setSelectedZone } from '@/store/slices/uiSlice'
import { fetchZoneDetails } from '@/store/slices/zonesSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Radio,
  Filter,
  Activity,
  Search,
  MoreVertical,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { STATUS_COLORS } from '@/utils/constants'
import { motion, AnimatePresence } from 'framer-motion'

interface AccessibilityMode {
  largeText: boolean;
  highContrast: boolean;
  voiceEnabled: boolean;
  simplifiedUI: boolean;
}

interface SidebarProps {
  accessibilityMode: AccessibilityMode;
}

export default function Sidebar({ accessibilityMode: _accessibilityMode }: SidebarProps) {
  const dispatch = useAppDispatch()
  const { zones, isLoading: zonesLoading } = useAppSelector((state) => state.zones)
  const { metrics, summaryFeed, isLoading: dashboardLoading } = useAppSelector((state) => state.dashboard)
  const { selectedZone } = useAppSelector((state) => state.ui)

  const handleZoneSelect = (zoneId: string) => {
    dispatch(setSelectedZone(zoneId))
    dispatch(fetchZoneDetails(zoneId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bottleneck':
        return <AlertTriangle className="h-4 w-4" />
      case 'anomaly':
        return <Activity className="h-4 w-4" />
      case 'normal':
        return <MapPin className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'bottleneck':
        return 'bottleneck' as const
      case 'anomaly':
        return 'anomaly' as const
      case 'normal':
        return 'normal' as const
      default:
        return 'default' as const
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'bottleneck':
        return 'High Traffic'
      case 'anomaly':
        return 'Anomaly'
      case 'normal':
        return 'Normal'
      default:
        return status
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border/50"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg"
          >
            <Radio className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h2 className="font-semibold text-lg">Control Center</h2>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="p-4 space-y-6">
          {/* Dashboard Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardLoading || !metrics ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <motion.div 
                      className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200/50"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="font-bold text-xl text-blue-600">{metrics.totalZones}</div>
                      <div className="text-muted-foreground text-xs">Total Zones</div>
                      <Progress value={(metrics.totalZones / 15) * 100} className="h-1 mt-2" />
                    </motion.div>
                    <motion.div 
                      className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-lg border border-red-200/50"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="font-bold text-xl text-red-600">{metrics.bottlenecks}</div>
                      <div className="text-muted-foreground text-xs">Bottlenecks</div>
                      <Progress value={(metrics.bottlenecks / 5) * 100} className="h-1 mt-2" />
                    </motion.div>
                    <motion.div 
                      className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg border border-orange-200/50"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="font-bold text-xl text-orange-600">{metrics.anomalies}</div>
                      <div className="text-muted-foreground text-xs">Anomalies</div>
                      <Progress value={(metrics.anomalies / 8) * 100} className="h-1 mt-2" />
                    </motion.div>
                    <motion.div 
                      className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg border border-green-200/50"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="font-bold text-xl text-green-600">{metrics.unitsDispatched}</div>
                      <div className="text-muted-foreground text-xs">Dispatched</div>
                      <Progress value={(metrics.unitsDispatched / 12) * 100} className="h-1 mt-2" />
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Zone List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Active Zones ({zones.length})
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Search className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {zonesLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <AnimatePresence>
                    {zones.map((zone, index) => (
                      <motion.div
                        key={zone.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full p-3 h-auto flex items-center justify-between text-left hover:bg-accent/50 transition-all duration-200",
                            selectedZone === zone.id && "bg-primary/10 border border-primary/20"
                          )}
                          onClick={() => handleZoneSelect(zone.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <motion.div
                                animate={{ 
                                  scale: zone.status !== 'normal' ? [1, 1.2, 1] : 1,
                                  rotate: zone.status === 'bottleneck' ? [0, 5, -5, 0] : 0
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: zone.status !== 'normal' ? Infinity : 0 
                                }}
                              >
                                {getStatusIcon(zone.status)}
                              </motion.div>
                              <span className="font-medium text-sm truncate">
                                {zone.name}
                              </span>
                              <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant={getStatusVariant(zone.status)}
                                className="text-xs px-2 py-0.5"
                              >
                                {getStatusText(zone.status)}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {zone.crowdDensity}%
                              </div>
                            </div>
                            <div className="w-full">
                              <Progress 
                                value={zone.crowdDensity} 
                                className="h-1.5"
                              />
                            </div>
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full ml-3 flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: STATUS_COLORS[zone.status] }}
                          />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dashboardLoading || summaryFeed.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {summaryFeed.slice(0, 3).map((entry, index) => (
                        <motion.div 
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 4 }}
                          className="text-xs p-3 bg-gradient-to-r from-card to-muted/30 rounded-lg border-l-3 hover:shadow-sm transition-all duration-200"
                          style={{ borderLeftColor: STATUS_COLORS[entry.status] }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-foreground">
                              {entry.zoneName}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          <div className="text-muted-foreground line-clamp-2 mb-2">
                            {entry.combinedSummary}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge 
                                variant={getStatusVariant(entry.status)}
                                className="text-xs px-1.5 py-0.5"
                              >
                                {entry.severity}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {entry.crowdDensity}% capacity
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 