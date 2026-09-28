import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, UtensilsCrossed, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/workout', icon: Dumbbell, label: 'Workout' },
  { path: '/nutrition', icon: UtensilsCrossed, label: 'Food' },
  { path: '/progress', icon: TrendingUp, label: 'Progress' }
];

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-5 pt-1.5 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/90 to-transparent">
      <div className="max-w-[420px] mx-auto">
        <div className="glass rounded-2xl flex justify-between items-center p-1.5 px-3">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => 
                `relative px-3 py-2 rounded-xl flex-1 flex flex-col items-center justify-center transition-colors duration-300 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-1 w-full"
                >
                  {isActive && (
                    <motion.div 
                      layoutId="nav-bg"
                      className="absolute inset-0 bg-[var(--color-surface-hover)] rounded-xl -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    />
                  )}
                  <Icon size={20} className={isActive ? 'drop-shadow-[var(--shadow-glow)]' : ''} />
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
