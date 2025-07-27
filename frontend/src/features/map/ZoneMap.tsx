import { useState } from 'react'
import { useAppSelector } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Satellite,
  Navigation,
  Users,
  AlertTriangle,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ZoneMap() {
  const { zones } = useAppSelector((state) => state.zones)
  const { selectedZone } = useAppSelector((state) => state.ui)
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street')
  const [showHeatmap, setShowHeatmap] = useState(true)

  const mockZonePositions = [
    { id: 'zone-1', name: 'Central Plaza', x: 45, y: 35, status: 'bottleneck', density: 85 },
    { id: 'zone-2', name: 'North Gate', x: 25, y: 20, status: 'normal', density: 45 },
    { id: 'zone-3', name: 'South Entrance', x: 65, y: 70, status: 'anomaly', density: 62 },
    { id: 'zone-4', name: 'West Corridor', x: 15, y: 50, status: 'normal', density: 38 },
    { id: 'zone-5', name: 'East Wing', x: 80, y: 40, status: 'anomaly', density: 71 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bottleneck': return '#dc2626'
      case 'anomaly': return '#f97316'
      case 'normal': return '#16a34a'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bottleneck': return AlertTriangle
      case 'anomaly': return Activity
      case 'normal': return Users
      default: return MapPin
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Interactive Zone Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setMapMode(mapMode === 'street' ? 'satellite' : 'street')}>
              <Satellite className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Map Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-2" />
              Layers
            </Button>
            <Button 
              variant={showHeatmap ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              Heatmap
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 rounded-lg border-2 border-dashed border-border/50 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Heatmap overlay */}
          {showHeatmap && (
            <div className="absolute inset-0 pointer-events-none">
              {mockZonePositions.map((zone) => (
                <motion.div
                  key={`heatmap-${zone.id}`}
                  className="absolute rounded-full blur-xl opacity-30"
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${zone.density}px`,
                    height: `${zone.density}px`,
                    background: `radial-gradient(circle, ${getStatusColor(zone.status)}40, transparent)`
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          )}

          {/* Zone Markers */}
          {mockZonePositions.map((zone, index) => {
            const StatusIcon = getStatusIcon(zone.status)
            const isSelected = selectedZone === zone.id
            
            return (
              <motion.div
                key={zone.id}
                className={`absolute cursor-pointer group ${isSelected ? 'z-20' : 'z-10'}`}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Marker */}
                <motion.div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                    isSelected ? 'ring-4 ring-primary/50' : ''
                  }`}
                  style={{ backgroundColor: getStatusColor(zone.status) }}
                  animate={zone.status !== 'normal' ? {
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      `0 0 0 0 ${getStatusColor(zone.status)}40`,
                      `0 0 0 10px ${getStatusColor(zone.status)}00`,
                      `0 0 0 0 ${getStatusColor(zone.status)}40`
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <StatusIcon className="h-4 w-4 text-white" />
                </motion.div>

                {/* Tooltip */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-3 min-w-48"
                    >
                      <div className="font-medium text-sm mb-2">{zone.name}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge 
                            variant={zone.status as any}
                            className="text-xs px-1.5 py-0.5"
                          >
                            {zone.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Density:</span>
                          <span className="font-medium">{zone.density}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Update:</span>
                          <span>2 min ago</span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-2 h-7 text-xs">
                        View Details
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {/* Map placeholder content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
              </motion.div>
              <p className="text-lg font-medium mb-2">Interactive Map View</p>
              <p className="text-sm">Click on zone markers to view details</p>
              <p className="text-xs mt-2">Leaflet.js integration will replace this placeholder</p>
            </div>
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Anomaly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Bottleneck</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {zones.length} zones monitored • Last updated: now
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 