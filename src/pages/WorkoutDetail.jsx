import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, CheckCircle2, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { Timer } from '../components/ui/Timer';
import { workoutPlan, parseSets, exerciseImages } from '../data/workouts';
import { useAppContext } from '../context/AppContext';

function AnimatedExerciseImage({ basePath, altText }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive(prev => !prev);
    }, 1200); // 1.2s per frame switch
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-[var(--color-surface-border)] bg-black/50">
      <img 
        src={`${basePath}/0.jpg`} 
        alt={`${altText} start`} 
        className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-70'}`}
        loading="lazy"
      />
      <img 
        src={`${basePath}/1.jpg`} 
        alt={`${altText} active`} 
        className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-300 ${isActive ? 'opacity-70' : 'opacity-0'}`}
        loading="lazy"
      />
    </div>
  );
}

export default function WorkoutDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completedSets, toggleSet } = useAppContext();
  
  // Get day from URL, default to today
  const defaultDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
  const day = searchParams.get('day') || defaultDay;
  const data = workoutPlan[day];

  const [expandedId, setExpandedId] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null); // { id: exerciseIndex, seconds: 60 }

  // Rest Timer defaults
  const REST_TIMES = [30, 60, 90];

  useEffect(() => {
    if (!data) return;

    // Check if workout just got totally completed
    let totalSetsNum = 0;
    let completedSetsNum = 0;

    data.exercises.forEach((ex, idx) => {
      const numSets = parseSets(ex);
      totalSetsNum += numSets;
      const exArray = (completedSets[day] && completedSets[day][idx]) || [];
      completedSetsNum += exArray.filter(Boolean).length;
    });

    if (totalSetsNum > 0 && completedSetsNum === totalSetsNum) {
      if (!showCelebration) {
        setShowCelebration(true);
        triggerConfetti();
      }
    } else {
      setShowCelebration(false);
    }
  }, [completedSets, day, data, showCelebration]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00ff88', '#00d4ff', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00ff88', '#00d4ff', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  if (!data) {
    return (
      <PageTransition>
        <div className="p-6 pt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Rest Day</h2>
          <p className="text-[var(--color-text-secondary)]">Take it easy today.</p>
          <button onClick={() => navigate('/')} className="mt-8 text-[var(--color-primary)]">
            Back to Dashboard
          </button>
        </div>
      </PageTransition>
    );
  }

  // Calculate Progress
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  data.exercises.forEach((ex, idx) => {
    const numSets = parseSets(ex);
    totalSetsCount += numSets;
    const exArray = (completedSets[day] && completedSets[day][idx]) || [];
    completedSetsCount += exArray.filter(Boolean).length;
  });
  const progressPercent = totalSetsCount === 0 ? 0 : (completedSetsCount / totalSetsCount) * 100;

  return (
    <PageTransition>
      <div className="p-4 pb-24 max-w-md mx-auto relative">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-4 sticky top-0 z-20 bg-[var(--color-background)]/80 backdrop-blur-md pb-4 border-b border-[var(--color-surface-border)]">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 bg-[var(--color-surface)] rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight">{data.title}</h1>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
              {day} • {data.duration}
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mb-6 bg-[var(--color-surface)] rounded-full h-2 overflow-hidden border border-[var(--color-surface-border)]">
          <motion.div 
            className="h-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        </div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-8 p-6 glass border-[var(--color-primary)] border ring-1 ring-[var(--color-primary-glow)] rounded-3xl flex flex-col items-center justify-center text-center drop-shadow-[var(--shadow-glow)]"
            >
              <div className="w-16 h-16 bg-[var(--color-primary-glow)] rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 size={32} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-[var(--color-text-secondary)] bg-clip-text text-transparent">
                Workout Complete! 🔥
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                Great job crushing your {data.title} session today. Let's keep the momentum going!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercises List */}
        <div className="space-y-4">
          {data.exercises.map((exercise, idx) => {
            const numSets = parseSets(exercise);
            const isExpanded = expandedId === idx;
            
            // Get completed state for this specific exercise
            const exArray = (completedSets[day] && completedSets[day][idx]) || [];
            const exCompletedCount = exArray.filter(Boolean).length;
            const isAllCompleted = exCompletedCount === numSets && numSets > 0;

            return (
              <Card 
                key={idx} 
                className={`transition-all duration-300 ${isExpanded ? 'ring-1 ring-[var(--color-surface-border)]' : ''} ${isAllCompleted ? 'opacity-60 saturate-50' : ''}`}
              >
                {/* Header Row */}
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)]">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg transition-colors ${isAllCompleted ? 'line-through text-[var(--color-text-secondary)]' : 'text-white'}`}>
                        {exercise.name}
                      </h3>
                      <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wider mt-0.5">
                        {exercise.type === 'cardio' ? `Cardio • ${exercise.duration}` :
                         exercise.type === 'superset' ? `Superset • ${exercise.rounds} Rounds ${exercise.reps ? `× ${exercise.reps}` : ''}` :
                         exercise.type === 'circuit' ? `Circuit • ${exercise.rounds} Rounds` :
                         `${exercise.sets} sets ${exercise.reps ? `× ${exercise.reps}` : exercise.duration ? `• ${exercise.duration}` : ''}`}
                      </p>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <ChevronDown size={20} className="text-[var(--color-text-secondary)]" />
                  </motion.div>
                </div>

                {/* Expandable Content for Sets & Timers */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 pb-2 border-t border-[var(--color-surface-border)] mt-4">
                        
                        {/* Interactive Checkboxes for each Set */}
                        {exercise.type === 'circuit' && exercise.exercises && (
                          <div className="mb-4 text-sm text-[var(--color-text-secondary)] space-y-1 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-surface-border)]">
                            {exercise.exercises.map((item, i) => (
                              <div key={i}>• {item}</div>
                            ))}
                          </div>
                        )}
                        <div className="space-y-3 mb-6">
                          {Array.from({ length: numSets }).map((_, setIdx) => {
                            const isChecked = !!exArray[setIdx];
                            return (
                              <div key={setIdx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-hover)]">
                                <Checkbox 
                                  checked={isChecked}
                                  onChange={() => toggleSet(day, idx, setIdx)}
                                  label={exercise.type === 'cardio' ? 'Completed' :
                                         exercise.type === 'superset' || exercise.type === 'circuit' ? `Round ${setIdx + 1}` :
                                         `Set ${setIdx + 1} ${exercise.reps ? `(${exercise.reps})` : exercise.duration ? `(${exercise.duration})` : ''}`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Rest Timers */}
                        <div className="mb-4">
                          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold mb-3">
                            Rest Timer
                          </p>
                          <div className="flex gap-2 isolate">
                            {REST_TIMES.map(sec => {
                              const isRunning = activeTimer?.id === idx && activeTimer?.seconds === sec;
                              return (
                                <Timer 
                                  key={sec}
                                  defaultSeconds={sec} 
                                  isRunning={isRunning}
                                  onToggle={() => {
                                    if (isRunning) {
                                      setActiveTimer(null);
                                    } else {
                                      setActiveTimer({ id: idx, seconds: sec });
                                    }
                                  }}
                                  onComplete={() => setActiveTimer(null)}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Micro-tip */}
                        <div className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-3 rounded-xl mb-4">
                          <Info size={14} className="mt-0.5 shrink-0" />
                          <p>
                            Focus on form over weight. Maintain eccentric control for 2 seconds.
                          </p>
                        </div>
                        
                        {/* Lazy Loaded Exercise Visual */}
                        {exerciseImages[exercise.name] && exerciseImages[exercise.name].length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="w-full mt-2 rounded-xl overflow-hidden bg-black/40 border border-[var(--color-surface-border)] p-2"
                          >
                            <div className={`grid gap-2 ${exerciseImages[exercise.name].length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {exerciseImages[exercise.name].map((basePath, imgIdx) => (
                                <AnimatedExerciseImage 
                                  key={imgIdx}
                                  basePath={basePath}
                                  altText={`${exercise.name} ${imgIdx + 1}`}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </Card>
            );
          })}
        </div>

      </div>
    </PageTransition>
  );
}
