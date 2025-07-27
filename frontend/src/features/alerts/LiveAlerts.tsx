import { useAppSelector, useAppDispatch } from '@/store'
import { acknowledgeAlert } from '@/store/slices/alertsSlice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

export default function LiveAlerts() {
  const dispatch = useAppDispatch()
  const { alerts } = useAppSelector((state) => state.alerts)
  const { commander } = useAppSelector((state) => state.auth)

  const activeAlerts = alerts.filter(alert => !alert.acknowledged).slice(0, 3)

  const handleAcknowledge = (alertId: string) => {
    if (commander) {
      dispatch(acknowledgeAlert({ alertId, commanderId: commander.id }))
    }
  }

  const getAlertIcon = (_type: string, severity: string) => {
    if (severity === 'critical') {
      return <AlertTriangle className="h-5 w-5 text-destructive" />
    }
    return <AlertTriangle className="h-5 w-5 text-orange-500" />
  }

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'critical' as const
      case 'high':
        return 'bottleneck' as const
      case 'medium':
        return 'anomaly' as const
      default:
        return 'secondary' as const
    }
  }

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-status-normal/10 border border-status-normal/20 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-status-normal" />
          <span className="text-sm font-medium text-status-normal">
            All systems operational - No active alerts
          </span>
          <Badge variant="normal" className="ml-auto">
            Status: Normal
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {activeAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type, alert.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{alert.title}</h3>
                  <Badge variant={getAlertVariant(alert.severity)} className="text-xs">
                    {alert.severity}
                  </Badge>
                  {alert.zoneId && (
                    <Badge variant="outline" className="text-xs">
                      Zone {alert.zoneId.split('-')[1]}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {alert.message}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(alert.timestamp), 'HH:mm:ss')}
                  </div>
                  <div className="capitalize">
                    {alert.type} Alert
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcknowledge(alert.id)}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Acknowledge
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
} 