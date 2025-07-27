import { useAppSelector } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ScrollText, 
  Filter, 
  Download, 
  Clock,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'

export default function EventLog() {
  const { events, isLoading } = useAppSelector((state) => state.events)

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'bottleneck':
        return '🚧'
      case 'anomaly':
        return '⚠️'
      case 'dispatch':
        return '🚚'
      case 'alert':
        return '🚨'
      case 'resolution':
        return '✅'
      default:
        return '📝'
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'bottleneck':
        return 'bottleneck' as const
      case 'anomaly':
        return 'anomaly' as const
      case 'dispatch':
        return 'normal' as const
      case 'alert':
        return 'critical' as const
      case 'resolution':
        return 'normal' as const
      default:
        return 'secondary' as const
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'critical' as const
      case 'high':
        return 'bottleneck' as const
      case 'medium':
        return 'anomaly' as const
      case 'low':
        return 'normal' as const
      default:
        return 'secondary' as const
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Event Log
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-auto scrollbar-thin">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ScrollText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No events recorded</p>
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id}
                className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="text-lg mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{event.description}</span>
                    {event.resolved ? (
                      <CheckCircle className="h-4 w-4 text-status-normal" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Zone {event.zoneId.split('-')[1]}
                    </div>
                    {event.unitId && (
                      <div>Unit: {event.unitId}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge 
                    variant={getTypeVariant(event.type)}
                    className="text-xs"
                  >
                    {event.type}
                  </Badge>
                  <Badge 
                    variant={getSeverityVariant(event.severity)}
                    className="text-xs"
                  >
                    {event.severity}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 