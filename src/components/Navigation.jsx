import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/workout', icon: Dumbbell, label: 'Workout' }
];

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)] to-transparent">
      <div className="max-w-[420px] mx-auto">
        <div className="glass rounded-2xl flex justify-center gap-12 items-center p-2 px-6">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 
                `relative p-3 rounded-xl flex flex-col items-center justify-center transition-colors duration-300 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center gap-1"
                >
                  {isActive && (
                    <motion.div 
                      layoutId="nav-bg"
                      className="absolute inset-0 bg-[var(--color-surface-hover)] rounded-xl -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={24} className={isActive ? 'drop-shadow-[var(--shadow-glow)]' : ''} />
                  <span className="text-[10px] font-medium tracking-wide">
                    {label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
