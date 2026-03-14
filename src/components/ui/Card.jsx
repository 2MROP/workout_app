import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, onClick, isGlowing = false, ...props }) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      onClick={onClick}
      whileTap={onClick ? { scale: 0.96 } : {}}
      className={twMerge(
        'glass rounded-2xl p-5 w-full text-left transition-all duration-300 relative overflow-hidden',
        isGlowing ? 'ring-1 ring-[var(--color-primary-glow)] drop-shadow-[var(--shadow-glow)]' : '',
        className
      )}
      {...props}
    >
      {isGlowing && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-glow)] via-transparent to-transparent opacity-30" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
}
