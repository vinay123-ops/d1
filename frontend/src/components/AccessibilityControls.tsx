import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Type, Eye, Volume2, Layout, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilityMode {
  largeText: boolean;
  highContrast: boolean;
  voiceEnabled: boolean;
  simplifiedUI: boolean;
}

interface AccessibilityControlsProps {
  accessibilityMode: AccessibilityMode;
  onToggleMode: (mode: keyof AccessibilityMode) => void;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  accessibilityMode,
  onToggleMode,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  // Toggle visibility with Alt+A
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 w-80"
        >
          <Card className="bg-card/95 backdrop-blur-sm border border-border shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Accessibility Controls
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={accessibilityMode.largeText ? "default" : "outline"}
                  onClick={() => onToggleMode('largeText')}
                  className="justify-start h-12"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Large Text
                  {accessibilityMode.largeText && (
                    <Badge variant="secondary" className="ml-auto">ON</Badge>
                  )}
                </Button>

                <Button
                  variant={accessibilityMode.highContrast ? "default" : "outline"}
                  onClick={() => onToggleMode('highContrast')}
                  className="justify-start h-12"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  High Contrast
                  {accessibilityMode.highContrast && (
                    <Badge variant="secondary" className="ml-auto">ON</Badge>
                  )}
                </Button>

                <Button
                  variant={accessibilityMode.voiceEnabled ? "default" : "outline"}
                  onClick={() => onToggleMode('voiceEnabled')}
                  className="justify-start h-12"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Voice Assistant
                  {accessibilityMode.voiceEnabled && (
                    <Badge variant="secondary" className="ml-auto">ON</Badge>
                  )}
                </Button>

                <Button
                  variant={accessibilityMode.simplifiedUI ? "default" : "outline"}
                  onClick={() => onToggleMode('simplifiedUI')}
                  className="justify-start h-12"
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Simplified UI
                  {accessibilityMode.simplifiedUI && (
                    <Badge variant="secondary" className="ml-auto">ON</Badge>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Press Alt+A to toggle this panel
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccessibilityControls; 