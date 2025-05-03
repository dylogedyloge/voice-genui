"use client";

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react'; // Re-import Mic and MicOff
import ReactSiriwave, { IReactSiriwaveProps } from 'react-siriwave';
import { motion, AnimatePresence } from 'framer-motion'; // Re-import AnimatePresence
// Removed: import { Button } from "@/components/ui/button";
// Import cn utility and buttonVariants helper from shadcn setup
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
// Removed: import Image from 'next/image';

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

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="flex items-center justify-center gap-6">
        <motion.button
          key="callButton"
          onClick={handleToggleCall}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          initial={{ x: 0 }}
          animate={{ x: isSessionActive ? -10 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 10, position: 'relative' }}
          className={cn(
            buttonVariants({
              variant: isSessionActive ? "destructive" : "default", // Conditional variant still applies
              size: "icon"
            }),
            
          )}
        >
          {/* Restore AnimatePresence for icon transition */}
          <AnimatePresence mode="wait">
            {!isSessionActive ? (
              <motion.div
                key="micIcon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Mic size={20} /> {/* Restore Mic icon */}
              </motion.div>
            ) : (
              // Use motion.div for consistency if exit animation is desired for MicOff too
              <motion.div
                key="micOffIcon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                 <MicOff size={20} /> {/* Restore MicOff icon */}
              </motion.div>
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
        >
          {/* Conditionally render Siriwave only when active */}
          {isSessionActive && <ReactSiriwave {...siriWaveConfig} />}
        </motion.div>
      </div>
    </div>
  );
};

export default Siri;