import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleSidebar } from '@/store/slices/uiSlice';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import AccessibilityControls from './AccessibilityControls';
import VoiceAssistant from './VoiceAssistant';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const [accessibilityMode, setAccessibilityMode] = useState({
    largeText: false,
    highContrast: false,
    voiceEnabled: false,
    simplifiedUI: false,
  });

  const sidebarWidth = sidebarOpen ? 'w-80' : 'w-0';
  const contentMargin = sidebarOpen ? 'ml-80' : 'ml-0';

  const toggleAccessibilityMode = (mode: keyof typeof accessibilityMode) => {
    setAccessibilityMode(prev => ({
      ...prev,
      [mode]: !prev[mode]
    }));
  };

  return (
    <div className={`h-screen flex bg-gradient-to-br from-background via-background to-muted/20 ${
      accessibilityMode.largeText ? 'large-text' : ''
    } ${
      accessibilityMode.highContrast ? 'high-contrast' : ''
    }`}>
      {/* Enhanced Sidebar with larger touch targets */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full ${sidebarWidth} bg-card/95 backdrop-blur-sm border-r border-border/50 z-30 shadow-xl`}
      >
        <Sidebar accessibilityMode={accessibilityMode} />
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${contentMargin}`}>
        {/* Enhanced Topbar with accessibility controls */}
        <header className="h-16 border-b border-border/50 bg-card/95 backdrop-blur-sm">
          <Topbar 
            onToggleSidebar={() => dispatch(toggleSidebar())}
            accessibilityMode={accessibilityMode}
            onToggleAccessibility={toggleAccessibilityMode}
          />
        </header>

        {/* Accessibility Controls Panel */}
        <AccessibilityControls 
          accessibilityMode={accessibilityMode}
          onToggleMode={toggleAccessibilityMode}
        />

        {/* Main Content with enhanced padding for readability */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={accessibilityMode.simplifiedUI ? 'space-y-8' : 'space-y-6'}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Voice Assistant for elderly users */}
      <AnimatePresence>
        {accessibilityMode.voiceEnabled && (
          <VoiceAssistant 
            onClose={() => toggleAccessibilityMode('voiceEnabled')}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Navigation Hints */}
      <div className="sr-only">
        <p>Press Tab to navigate, Enter to select, Escape to cancel</p>
        <p>Press Alt+A for accessibility controls, Alt+V for voice assistant</p>
        <p>Press Alt+S to toggle sidebar, Alt+H for help</p>
      </div>
    </div>
  );
};

export default DashboardLayout; 