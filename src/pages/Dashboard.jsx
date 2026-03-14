import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Flame, RotateCcw } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';
import { ProgressCircle } from '../components/ui/ProgressCircle';
import { workoutPlan, parseSets } from '../data/workouts';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { completedSets, resetWeek } = useAppContext();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Custom logic to get today's day key ('monday', etc.)
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIndex = new Date().getDay();
  const todayKey = days[todayIndex];

  const getDayProgress = (dayKey) => {
    const data = workoutPlan[dayKey];
    if (!data || !completedSets[dayKey]) return 0;
    
    let totalSets = 0;
    let completed = 0;
    
    data.exercises.forEach((ex, idx) => {
      const numSets = parseSets(ex);
      totalSets += numSets;
      const exArray = completedSets[dayKey][idx] || [];
      completed += exArray.filter(Boolean).length;
    });

    return totalSets === 0 ? 0 : (completed / totalSets) * 100;
  };

  const todayProgress = getDayProgress(todayKey);
  const isRestDay = !workoutPlan[todayKey];

  return (
    <PageTransition>
      <div className="p-6 pb-24 space-y-8">
        
        {/* Header Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Let's train <span className="inline-block animate-bounce">🔥</span></h1>
            <p className="text-[var(--color-text-secondary)] mt-1">Ready to crush your goals?</p>
          </div>
        </motion.div>

        {/* Today's Highlight Card */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="text-[var(--color-primary)]" size={20} />
            <h2 className="text-lg font-semibold">Today's Session</h2>
          </div>
          
          <Card 
            isGlowing={true} 
            onClick={() => navigate('/workout?day=' + todayKey)}
            className="flex items-center justify-between"
          >
            <div>
              <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wider">
                {todayKey}
              </span>
              <h3 className="text-2xl font-bold mt-1">
                {isRestDay ? 'Rest Day' : workoutPlan[todayKey].title}
              </h3>
              {!isRestDay && (
                <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                  {workoutPlan[todayKey].duration} • {workoutPlan[todayKey].exercises.length} Exercises
                </p>
              )}
            </div>
            
            {!isRestDay ? (
              <ProgressCircle progress={todayProgress} size={70} strokeWidth={6} />
            ) : (
              <div className="w-[70px] h-[70px] flex items-center justify-center bg-[var(--color-surface)] rounded-full">
                <span className="text-2xl">☕</span>
              </div>
            )}
          </Card>
        </section>

        {/* Weekly Overview */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-secondary)]">This Week</h2>
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
              if (day === todayKey) return null; // Already highlighted above
              const dayData = workoutPlan[day];
              
              return (
                <motion.div 
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    onClick={() => navigate('/workout?day=' + day)}
                    className="flex justify-between items-center group py-4"
                  >
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] uppercase font-semibold tracking-wider">
                        {day}
                      </p>
                      <p className="font-medium text-lg mt-1 group-hover:text-[var(--color-primary)] transition-colors">
                        {dayData ? dayData.title : 'Rest Day'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {dayData && (
                        <div className="flex flex-col items-end">
                           <span className="text-xs text-[var(--color-text-secondary)]">
                             {Math.round(getDayProgress(day))}%
                           </span>
                           <div className="w-12 h-1 bg-[var(--color-surface-border)] rounded-full mt-1 overflow-hidden">
                             <div 
                               className="h-full bg-[var(--color-primary)]" 
                               style={{ width: `${getDayProgress(day)}%` }}
                             />
                           </div>
                        </div>
                      )}
                      <ChevronRight className="text-[var(--color-text-secondary)] group-hover:text-white transition-colors" size={20} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Action Zone at the bottom */}
        <section className="pt-8 pb-4 flex justify-center">
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[#ff3366] hover:bg-[#ff3366]/10 transition-colors border border-transparent hover:border-[#ff3366]/20"
          >
            <RotateCcw size={16} />
            Reset This Week's Progress
          </button>
        </section>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Reset Progress?</h3>
                  <p className="text-[var(--color-text-secondary)] mt-2 text-sm leading-relaxed">
                    Are you sure you want to reset all workout progress for this week? This cannot be undone.
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-medium bg-[var(--color-surface-hover)] text-white hover:bg-[var(--color-surface-border)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      resetWeek();
                      setShowResetConfirm(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-medium bg-[#ff3366]/10 text-[#ff3366] hover:bg-[#ff3366]/20 border border-[#ff3366]/20 transition-colors"
                  >
                    Yes, Reset
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
