import { useAppSelector } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function SummaryFeed() {
  const { summaryFeed, isLoading } = useAppSelector((state) => state.dashboard)

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
        return 'default' as const
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Summary Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-auto scrollbar-thin">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : summaryFeed.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          summaryFeed.map((entry) => (
            <div 
              key={entry.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{entry.zoneName}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(entry.timestamp), 'HH:mm')}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {entry.combinedSummary}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge 
                    variant={getStatusVariant(entry.status)}
                    className="text-xs"
                  >
                    {entry.status}
                  </Badge>
                  <Badge 
                    variant={getSeverityVariant(entry.severity)}
                    className="text-xs"
                  >
                    {entry.severity}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {entry.crowdDensity}% density
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
} 