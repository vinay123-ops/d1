import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { loginCommander } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Eye, Shield, CheckCircle, Loader2, Users, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('commander@drishti.com')
  const [password, setPassword] = useState('password')
  const [autoLoginProgress, setAutoLoginProgress] = useState(0)
  const [showFeatures, setShowFeatures] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginCommander({ email, password }))
  }

  // Auto-login progress and timer
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setAutoLoginProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          if (!loading) {
            dispatch(loginCommander({ email, password }))
          }
          return 100
        }
        return prev + 2
      })
    }, 40) // 2% every 40ms = 100% in 2 seconds

    // Show features after 1 second
    const featuresTimer = setTimeout(() => {
      setShowFeatures(true)
    }, 1000)

    return () => {
      clearInterval(progressTimer)
      clearTimeout(featuresTimer)
    }
  }, [dispatch, email, password, loading])

  const features = [
    { icon: Activity, title: 'Real-time Monitoring', desc: 'Live crowd density tracking' },
    { icon: Users, title: 'Unit Management', desc: 'Dispatch and coordinate teams' },
    { icon: Eye, title: 'Anomaly Detection', desc: 'AI-powered threat identification' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center lg:text-left space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Drishti
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Advanced Command & Control Dashboard
              </p>
              <p className="text-sm text-muted-foreground">
                Real-time crowd monitoring for field commanders
              </p>
            </div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showFeatures ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Key Features</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: showFeatures ? 1 : 0, x: showFeatures ? 0 : -20 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center gap-2 justify-center text-xl">
                <Eye className="h-5 w-5 text-primary" />
                Commander Access
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Secure login to command center
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commander@drishti.com"
                    className="h-11"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11"
                    required
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-destructive">{error}</span>
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Sign In to Command Center
                    </>
                  )}
                </Button>
              </form>

              {/* Auto-login indicator */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Auto-login Demo</span>
                  <Badge variant="outline" className="text-xs">
                    {autoLoginProgress.toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={autoLoginProgress} className="h-2" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Demo credentials pre-filled • Auto-login in progress
                </div>
              </div>

              {/* Demo credentials */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Badge variant="secondary" className="text-xs">Demo</Badge>
                  Test Credentials
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div><strong>Email:</strong> commander@drishti.com</div>
                  <div><strong>Password:</strong> password</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            Drishti Dashboard © 2024 • Secure Command System
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 