import { useState, useEffect } from 'react'
import { Menu, Bell, Settings, LogOut, Wifi, WifiOff, Clock, Zap, ChevronDown } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store'
// toggleSidebar is now passed as a prop
import { logoutCommander } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import VideoUpload from './VideoUpload';

interface AccessibilityMode {
  largeText: boolean;
  highContrast: boolean;
  voiceEnabled: boolean;
  simplifiedUI: boolean;
}

interface TopbarProps {
  onToggleSidebar: () => void;
  accessibilityMode: AccessibilityMode;
  onToggleAccessibility: (mode: keyof AccessibilityMode) => void;
}

export default function Topbar({ 
  onToggleSidebar, 
  accessibilityMode: _accessibilityMode, 
  onToggleAccessibility: _onToggleAccessibility 
}: TopbarProps) {
  const dispatch = useAppDispatch()
  const { commander } = useAppSelector((state) => state.auth)
  const { unacknowledgedCount } = useAppSelector((state) => state.alerts)
  const { sidebarOpen } = useAppSelector((state) => state.ui)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showNotificationPulse, setShowNotificationPulse] = useState(false)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Pulse notification when alerts change
  useEffect(() => {
    if (unacknowledgedCount > 0) {
      setShowNotificationPulse(true)
      const timer = setTimeout(() => setShowNotificationPulse(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [unacknowledgedCount])

  const handleLogout = () => {
    dispatch(logoutCommander())
  }

  const getCommanderInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.header 
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      className="h-full flex items-center justify-between px-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-border/50 backdrop-blur-sm"
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-10 w-10 hover:bg-primary/10 transition-colors"
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </motion.div>

        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Drishti
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-primary"
            >
              <Zap className="h-4 w-4" />
            </motion.div>
          </div>
          <Badge variant="outline" className="text-xs font-medium px-2 py-1">
            Command Center
          </Badge>
        </motion.div>
      </div>

      {/* Center section - Real-time clock */}
      <motion.div 
        className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-lg border border-border/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-primary"
        >
          <Clock className="h-4 w-4" />
        </motion.div>
        <div className="text-sm font-mono">
          <time className="font-semibold text-foreground">
            {format(currentTime, 'HH:mm:ss')}
          </time>
          <span className="text-muted-foreground ml-2">
            {format(currentTime, 'MMM dd, yyyy')}
          </span>
        </div>
      </motion.div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Sync status */}
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {isOnline ? (
              <motion.div
                key="online"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wifi className="h-4 w-4 text-green-500" />
                </motion.div>
                <span className="text-sm text-green-600 font-medium hidden sm:inline">
                  Online
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="offline"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium hidden sm:inline">
                  Offline
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Notifications */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" size="icon" className="relative h-10 w-10 hover:bg-primary/10">
            <motion.div
              animate={showNotificationPulse ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Bell className="h-5 w-5" />
            </motion.div>
            <AnimatePresence>
              {unacknowledgedCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge 
                    variant="destructive" 
                    className="h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">
              Notifications ({unacknowledgedCount} unread)
            </span>
          </Button>
        </motion.div>

        {/* Video Upload */}
        <VideoUpload />

        {/* Commander menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="ghost" className="flex items-center gap-3 px-3 h-10 hover:bg-primary/10">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    {commander ? getCommanderInitials(commander.name) : 'CM'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium">
                    {commander?.name || 'Commander'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {commander?.rank || 'Senior Commander'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex flex-col space-y-1 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <p className="text-sm font-medium">
                {commander?.name || 'Commander'}
              </p>
              <p className="text-xs text-muted-foreground">
                {commander?.division || 'Central Operations'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">Active Session</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings & Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
} 