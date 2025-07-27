import { useAppSelector } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Truck, 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  Heart, 
  Flame,
  AlertTriangle
} from 'lucide-react'

export default function DispatchConsole() {
  const { units, isLoading } = useAppSelector((state) => state.units)

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'police':
        return <Shield className="h-4 w-4" />
      case 'medical':
        return <Heart className="h-4 w-4" />
      case 'fire':
        return <Flame className="h-4 w-4" />
      case 'security':
        return <Users className="h-4 w-4" />
      default:
        return <Truck className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'normal' as const
      case 'dispatched':
        return 'anomaly' as const
      case 'busy':
        return 'bottleneck' as const
      case 'offline':
        return 'secondary' as const
      default:
        return 'default' as const
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-status-normal'
      case 'dispatched':
        return 'text-status-anomaly'
      case 'busy':
        return 'text-status-bottleneck'
      case 'offline':
        return 'text-muted-foreground'
      default:
        return 'text-foreground'
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Dispatch Console
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-lg font-semibold text-status-normal">
              {units.filter(u => u.status === 'available').length}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-lg font-semibold text-status-anomaly">
              {units.filter(u => u.status === 'dispatched').length}
            </div>
            <div className="text-xs text-muted-foreground">Dispatched</div>
          </div>
        </div>

        {/* Unit List */}
        <div className="space-y-3 max-h-64 overflow-auto scrollbar-thin">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : (
            units.map((unit) => (
              <div 
                key={unit.id}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={getStatusColor(unit.status)}>
                      {getUnitIcon(unit.type)}
                    </div>
                    <span className="font-medium text-sm">{unit.name}</span>
                  </div>
                  <Badge 
                    variant={getStatusVariant(unit.status)}
                    className="text-xs"
                  >
                    {unit.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {unit.location[0].toFixed(3)}, {unit.location[1].toFixed(3)}
                  </div>
                  {unit.estimatedArrival && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ETA: {new Date(unit.estimatedArrival).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>

                {unit.status === 'available' && (
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Dispatch Unit
                  </Button>
                )}

                {unit.assignedZone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    Assigned: Zone {unit.assignedZone.split('-')[1]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Recommendations */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Recommendations
          </h4>
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                Central Plaza - High Priority
              </div>
              <div className="text-orange-700 dark:text-orange-300 text-xs">
                Recommend dispatching Medical Team Beta (8 min ETA)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 