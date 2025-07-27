import { useAppSelector } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Users, 
  AlertTriangle,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsPanel() {
  const { metrics } = useAppSelector((state) => state.dashboard)

  const mockChartData = {
    hourlyDensity: [
      { time: '08:00', value: 45, trend: 'up' },
      { time: '09:00', value: 52, trend: 'up' },
      { time: '10:00', value: 68, trend: 'up' },
      { time: '11:00', value: 73, trend: 'up' },
      { time: '12:00', value: 85, trend: 'up' },
      { time: '13:00', value: 79, trend: 'down' },
    ],
    zonePerformance: [
      { zone: 'Central Plaza', score: 85, status: 'good' },
      { zone: 'North Gate', score: 92, status: 'excellent' },
      { zone: 'South Entrance', score: 78, status: 'warning' },
      { zone: 'West Corridor', score: 88, status: 'good' },
    ]
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <BarChart3 className="h-5 w-5 text-primary" />
            </motion.div>
            Analytics Dashboard
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-4 rounded-lg border border-blue-200/50"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.totalZones || 12}
            </div>
            <div className="text-sm text-muted-foreground">Total Zones</div>
            <Progress value={85} className="h-1.5 mt-2" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 p-4 rounded-lg border border-red-200/50"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <ArrowUpRight className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.activeAlerts || 5}
            </div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
            <Progress value={45} className="h-1.5 mt-2" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 p-4 rounded-lg border border-green-200/50"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <ArrowDownRight className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.unitsDispatched || 8}
            </div>
            <div className="text-sm text-muted-foreground">Units Deployed</div>
            <Progress value={67} className="h-1.5 mt-2" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-4 rounded-lg border border-purple-200/50"
          >
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <ArrowUpRight className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">127</div>
            <div className="text-sm text-muted-foreground">Total Incidents</div>
            <Progress value={78} className="h-1.5 mt-2" />
          </motion.div>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crowd Density Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-card to-muted/30 p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sm">Crowd Density Trend</h4>
                  <Badge variant="outline" className="text-xs">6h</Badge>
                </div>
                <div className="space-y-3">
                  {mockChartData.hourlyDensity.map((item, _index) => (
                    <div key={item.time} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-12">{item.time}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Progress value={item.value} className="h-2 flex-1" />
                          <span className="text-xs font-medium w-8">{item.value}%</span>
                        </div>
                      </div>
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Anomaly Detection */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-card to-muted/30 p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sm">Anomaly Detection</h4>
                  <Badge variant="anomaly" className="text-xs">Live</Badge>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">5</div>
                    <div className="text-xs text-muted-foreground">Active Anomalies</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Crowd Pattern</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Movement</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Density Spike</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-gradient-to-br from-card to-muted/30 p-4 rounded-lg border">
                <h4 className="font-medium text-sm mb-4">Status Distribution</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Normal</span>
                    </div>
                    <span className="text-sm font-medium">58%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Anomaly</span>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Bottleneck</span>
                    </div>
                    <span className="text-sm font-medium">17%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-card to-muted/30 p-4 rounded-lg border">
                <h4 className="font-medium text-sm mb-4">Unit Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Police</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medical</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fire</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-card to-muted/30 p-4 rounded-lg border"
            >
              <h4 className="font-medium text-sm mb-4">Zone Performance Scores</h4>
              <div className="space-y-3">
                {mockChartData.zonePerformance.map((zone, _index) => (
                  <div key={zone.zone} className="flex items-center gap-3">
                    <span className="text-sm w-24 truncate">{zone.zone}</span>
                    <div className="flex-1">
                      <Progress value={zone.score} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-8">{zone.score}</span>
                    <Badge 
                      variant={zone.status === 'excellent' ? 'normal' : zone.status === 'warning' ? 'anomaly' : 'default'}
                      className="text-xs"
                    >
                      {zone.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 