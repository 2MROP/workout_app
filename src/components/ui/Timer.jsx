import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

export function Timer({ defaultSeconds = 60, isRunning, onToggle, onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);

  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      if (onComplete) onComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onComplete]);

  // Reset the timer cleanly when it is stopped externally or locally
  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(defaultSeconds);
    }
  }, [isRunning, defaultSeconds]);

  const progress = (secondsLeft / defaultSeconds) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors duration-300 overflow-hidden border ${
        isRunning 
          ? 'border-[var(--color-primary)] text-[var(--color-primary)] shadow-[var(--shadow-glow)]' 
          : 'border-[var(--color-surface-border)] text-[var(--color-text-secondary)] hover:text-white bg-[var(--color-surface)]'
      }`}
    >
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 1 }}
            className="absolute left-0 top-0 bottom-0 bg-[var(--color-primary)] opacity-10 z-0"
          />
        )}
      </AnimatePresence>
      
      <div className="relative z-10 flex items-center gap-2">
        <Clock size={16} className={isRunning ? 'animate-pulse' : ''} />
        <span className="tabular-nums">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </motion.button>
  );
}
