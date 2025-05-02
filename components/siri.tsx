"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import ReactSiriwave, { IReactSiriwaveProps } from 'react-siriwave';
import { motion, AnimatePresence } from 'framer-motion';
// Removed: import { Button } from "@/components/ui/button";
// Import cn utility and buttonVariants helper from shadcn setup
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Define CurveStyle type
type CurveStyle = "ios" | "ios9";

interface SiriProps {
  theme: CurveStyle;
  currentVolume: number;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
}

const Siri: React.FC<SiriProps> = ({
  theme,
  currentVolume,
  isSessionActive,
  handleStartStopClick
}) => {
  const [siriWaveConfig, setSiriWaveConfig] = useState<IReactSiriwaveProps>({
    theme: theme || "ios9",
    ratio: 1,
    speed: 0,
    amplitude: 0,
    frequency: 0,
    color: '#9E9E9E',
    cover: true,
    width: 300,
    height: 100,
    autostart: true,
    pixelDepth: 1,
    lerpSpeed: 0.1,
  });

  // Removed debouncing logic - Update wave config directly
  useEffect(() => {
    setSiriWaveConfig(prevConfig => ({
      ...prevConfig,
      amplitude: isSessionActive ? (currentVolume > 0.02 ? currentVolume * 50 : 0) : 0,
      speed: isSessionActive ? (currentVolume > 0.1 ? currentVolume * 50 : 0) : 0,
      frequency: isSessionActive ? (currentVolume > 0.01 ? currentVolume * 50 : 0) : 0,
    }));
  }, [currentVolume, isSessionActive]); // Depend directly on currentVolume

  const handleToggleCall = () => {
    handleStartStopClick();
  };

  // Removed: const MotionButton = motion(Button);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="flex items-center justify-center">
        {/* Reverted to motion.button */}
        <motion.button
          key="callButton"
          onClick={handleToggleCall}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          // Re-added x animation from original
          initial={{ x: 0 }}
          animate={{ x: isSessionActive ? -10 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 10, position: 'relative' }}
          // Apply button styles using cn and buttonVariants
          className={cn(
            buttonVariants({
              variant: isSessionActive ? "destructive" : "default", // Conditional variant
              size: "icon" // Icon size
            }),
            "rounded-xl" // Keep custom rounding
          )}
        >
          {/* Simplified AnimatePresence structure */}
          <AnimatePresence mode="wait">
            {!isSessionActive ? (
              <motion.div
                key="micIcon"
                initial={{ opacity: 0 }} // Keep fade for consistency
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Mic size={20} />
              </motion.div>
            ) : (
              // Render MicOff directly when active, add key for AnimatePresence
              <MicOff size={20} key="micOffIcon" />
            )}
          </AnimatePresence>
        </motion.button>
        {/* Siri Wave container */}
        <motion.div
          className="rounded-4xl overflow-hidden" // Class from previous attempts
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: isSessionActive ? siriWaveConfig.width : 0, opacity: isSessionActive ? 1 : 0 }} // Animate width based on state
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          // Removed pointerEvents: 'none'
          style={{ marginLeft: '10px' }}
        >
          {/* Conditionally render Siriwave only when active */}
          {isSessionActive && <ReactSiriwave {...siriWaveConfig} />}
        </motion.div>
      </div>
    </div>
  );
};

export default Siri;