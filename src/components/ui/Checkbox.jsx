import React from 'react';
import { motion } from 'framer-motion';

export function Checkbox({ checked, onChange, label, className = '' }) {
  return (
    <div 
      className={`flex items-center gap-3 cursor-pointer group ${className}`}
      onClick={onChange}
    >
      <div className="relative w-6 h-6 flex-shrink-0">
        {/* Background box */}
        <motion.div 
          className="absolute inset-0 rounded-md border-2"
          animate={{
            borderColor: checked ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            backgroundColor: checked ? 'var(--color-primary)' : 'transparent',
            boxShadow: checked ? 'var(--shadow-glow)' : 'none'
          }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Checkmark icon */}
        <svg 
          className="absolute inset-0 w-full h-full p-1 text-[var(--color-background)]"
          viewBox="0 0 24 24"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </svg>
      </div>
      
      {label && (
        <span className={`text-sm select-none transition-colors duration-200 ${checked ? 'text-[var(--color-text-secondary)] line-through' : 'text-white'}`}>
          {label}
        </span>
      )}
    </div>
  );
}
