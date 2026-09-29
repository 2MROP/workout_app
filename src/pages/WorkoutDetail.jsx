import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, CheckCircle2, Info, Sparkles, Footprints, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { Timer } from '../components/ui/Timer';
import { workoutPlan, parseSets, exerciseImages } from '../data/workouts';
import { useAppContext } from '../context/AppContext';
import { getLocalDateString, getMondayOfWeek, getWeekDates, getDayOfWeekKey, formatDisplayDate } from '../utils/dateUtils';

function AnimatedExerciseImage({ basePath, altText }) {
  const [isActive, setIsActive] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive(prev => !prev);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  if (hasError) return null;

  return (
    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-[var(--color-surface-border)] bg-black/50">
      <img 
        src={`${basePath}/0.jpg`} 
        alt={`${altText} start`} 
        onError={() => setHasError(true)}
        className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-70'}`}
        loading="lazy"
      />
      <img 
        src={`${basePath}/1.jpg`} 
        alt={`${altText} active`} 
        onError={() => setHasError(true)}
        className={`absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-300 ${isActive ? 'opacity-70' : 'opacity-0'}`}
        loading="lazy"
      />
    </div>
  );
}

export default function WorkoutDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    workoutLogs,
    cardioLogs,
    stepLogs,
    logSet,
    logCardio,
    logSteps,
    getLastLoggedSet
  } = useAppContext();

  // Determine current day and date
  const todayDateStr = getLocalDateString();
  const currentMonday = getMondayOfWeek(todayDateStr);
  const currentWeekDates = getWeekDates(currentMonday);
  const todayDayKey = getDayOfWeekKey(todayDateStr);

  const dayParam = (searchParams.get('day') || todayDayKey).toLowerCase();
  const dayIndexMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
  const targetDayIndex = dayIndexMap[dayParam] !== undefined ? dayIndexMap[dayParam] : dayIndexMap[todayDayKey];

  // Specific date for this day in the current week (or url date param if passed)
  const targetDateStr = searchParams.get('date') || currentWeekDates[targetDayIndex];
  const data = workoutPlan[dayParam];

  const [expandedId, setExpandedId] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);

  const REST_TIMES = [30, 60, 90];

  // Walking Day state
  const dayStepLog = stepLogs[targetDateStr] || {};
  const [stepInput, setStepInput] = useState(dayStepLog.steps || '');

  useEffect(() => {
    setStepInput(dayStepLog.steps || '');
  }, [dayStepLog.steps]);

  // Check progress and trigger celebration
  const { totalSetsCount, completedSetsCount, isAllDone } = useMemo(() => {
    if (!data || data.type !== 'workout') {
      return { totalSetsCount: 0, completedSetsCount: 0, isAllDone: false };
    }

    let total = 0;
    let completed = 0;
    const dayWorkout = workoutLogs[targetDateStr] || {};

    data.exercises.forEach(ex => {
      if (ex.type === 'cardio') {
        total += 1;
        if (cardioLogs[targetDateStr]?.[ex.id]?.completed) completed += 1;
      } else {
        const numSets = parseSets(ex);
        total += numSets;
        const exSets = dayWorkout[ex.id] || [];
        for (let i = 0; i < numSets; i++) {
          if (exSets[i]?.completed) completed += 1;
        }
      }
    });

    return {
      totalSetsCount: total,
      completedSetsCount: completed,
      isAllDone: total > 0 && completed === total
    };
  }, [data, targetDateStr, workoutLogs, cardioLogs]);

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

  useEffect(() => {
    if (isAllDone) {
      if (!showCelebration) {
        setShowCelebration(true);
        triggerConfetti();
      }
    } else {
      setShowCelebration(false);
    }
  }, [isAllDone]);

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

  const progressPercent = totalSetsCount === 0 ? 0 : (completedSetsCount / totalSetsCount) * 100;

  // Handle Walking Day UI
  if (data.type === 'walking') {
    const isStepTargetMet = !!dayStepLog.completed;
    return (
      <PageTransition>
        <div className="p-4 pb-28 max-w-md mx-auto relative space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pt-4 border-b border-[var(--color-surface-border)] pb-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="p-2 bg-[var(--color-surface)] rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold font-sans tracking-tight">{data.title}</h1>
              <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                {dayParam} • {formatDisplayDate(targetDateStr, { month: 'short', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
          </div>

          <Card isGlowing={isStepTargetMet} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <Footprints size={26} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Daily Walking Target</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Target: 7,000 – 10,000 steps</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] flex items-center justify-between">
              <Checkbox
                checked={isStepTargetMet}
                onChange={() => {
                  logSteps(targetDateStr, {
                    completed: !isStepTargetMet,
                    steps: stepInput || (isStepTargetMet ? '' : 8000)
                  });
                }}
                label="Hit 7k+ steps today"
              />
              {isStepTargetMet && (
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-md">
                  Target Met!
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[var(--color-text-secondary)] font-medium block">
                Actual Steps (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 8500"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={() => {
                    const num = parseInt(stepInput, 10);
                    logSteps(targetDateStr, {
                      steps: stepInput,
                      completed: num >= 7000 ? true : isStepTargetMet
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] font-mono text-sm"
                />
                <button
                  onClick={() => {
                    const num = parseInt(stepInput, 10);
                    logSteps(targetDateStr, {
                      steps: stepInput,
                      completed: num >= 7000 ? true : isStepTargetMet
                    });
                  }}
                  className="px-4 py-2.5 bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] text-xs font-semibold rounded-xl transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-3 rounded-xl">
              <Info size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
              <p>
                Walking preserves your joint health, keeps NEAT high, and aids muscle recovery without fatigue.
              </p>
            </div>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Workout Day UI (Full Body A, B, C)
  return (
    <PageTransition>
      <div className="p-4 pb-28 max-w-md mx-auto relative">
        
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-4 pt-4 sticky top-0 z-20 bg-[var(--color-background)]/85 backdrop-blur-md pb-3 border-b border-[var(--color-surface-border)]">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="p-2 bg-[var(--color-surface)] rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight">{data.title}</h1>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
              {dayParam} • {formatDisplayDate(targetDateStr, { month: 'short', day: 'numeric' })} • {data.duration}
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

        {/* Workout Complete Celebration */}
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
                Great job crushing {data.title} and your 25m cardio today. Progressive overload logged!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise List */}
        <div className="space-y-4">
          {data.exercises.map((exercise, idx) => {
            const isCardio = exercise.type === 'cardio';
            const isExpanded = expandedId === idx;
            const numSets = parseSets(exercise);

            // Handle Cardio Item (Treadmill)
            if (isCardio) {
              const cardioData = cardioLogs[targetDateStr]?.[exercise.id] || {};
              const isCardioDone = !!cardioData.completed;

              return (
                <Card 
                  key={exercise.id}
                  isGlowing={isCardioDone}
                  className={`transition-all duration-300 ${isCardioDone ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center text-xs font-bold">
                        <Flame size={18} />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-base ${isCardioDone ? 'line-through text-[var(--color-text-secondary)]' : 'text-white'}`}>
                          {exercise.name}
                        </h3>
                        <p className="text-xs text-[var(--color-accent)] font-medium">
                          Post-workout Cardio • {exercise.duration}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={isCardioDone}
                      onChange={() => {
                        logCardio(targetDateStr, exercise.id, {
                          completed: !isCardioDone,
                          minutes: cardioData.minutes || 25
                        });
                      }}
                    />
                  </div>

                  {/* Read-only Interval Cardio Table Reference */}
                  {Array.isArray(data.cardioTable) && data.cardioTable.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--color-surface-border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                          25 Min Protocol Reference
                        </span>
                        <span className="text-[10px] text-[var(--color-accent)] font-mono">
                          Time • Speed • Incline
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-background)]">
                        <table className="w-full text-[11px] font-mono text-left">
                          <thead>
                            <tr className="border-b border-[var(--color-surface-border)] text-[var(--color-text-secondary)] bg-[var(--color-surface)]">
                              <th className="py-1.5 px-3">Time</th>
                              <th className="py-1.5 px-3">Speed</th>
                              <th className="py-1.5 px-3">Incline</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-surface-border)]">
                            {data.cardioTable.map((seg, sIdx) => (
                              <tr key={sIdx} className="hover:bg-[var(--color-surface-hover)]">
                                <td className="py-1.5 px-3 text-white font-medium">
                                  {seg.start}–{seg.end} min
                                </td>
                                <td className="py-1.5 px-3 text-[var(--color-primary)]">
                                  {seg.speed.toFixed(1)} km/h
                                </td>
                                <td className="py-1.5 px-3 text-amber-300">
                                  {seg.incline}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              );
            }

            // Lifting Exercise Item
            const dayExerciseSets = workoutLogs[targetDateStr]?.[exercise.id] || [];
            const completedSetsInExercise = dayExerciseSets.filter(s => s?.completed).length;
            const isExerciseFullyDone = numSets > 0 && completedSetsInExercise === numSets;

            // Progressive Overload: "Last time" lookup
            const lastSession = getLastLoggedSet(exercise.id, targetDateStr);
            let progressionSuggestion = null;
            let lastDisplayChip = null;

            if (lastSession && lastSession.sets.length > 0) {
              const lastSet = lastSession.bestSet || lastSession.sets[0];
              if (lastSet?.weight) {
                lastDisplayChip = `${lastSet.weight} kg × ${lastSet.reps || '-'}`;
              }

              // Progression hint logic: if every set in the last session reached top of rep range
              // Parse top of rep range from '6-8' -> 8, '8-10' -> 10, '12-15' -> 15
              const repMatch = exercise.reps.match(/\d+$/);
              const topRep = repMatch ? parseInt(repMatch[0], 10) : 10;
              const allReachedTop = lastSession.sets.length >= numSets &&
                lastSession.sets.every(s => parseInt(s.reps, 10) >= topRep);

              if (allReachedTop && !exercise.isDuration) {
                progressionSuggestion = '⚡ Try +2.5 kg';
              }
            }

            return (
              <Card 
                key={exercise.id}
                className={`transition-all duration-300 ${isExpanded ? 'ring-1 ring-[var(--color-surface-border)]' : ''} ${isExerciseFullyDone ? 'opacity-65' : ''}`}
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
                      <h3 className={`font-semibold text-base transition-colors ${isExerciseFullyDone ? 'line-through text-[var(--color-text-secondary)]' : 'text-white'}`}>
                        {exercise.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-[var(--color-primary)] font-medium">
                          {exercise.sets} sets × {exercise.reps}
                        </span>
                        {lastDisplayChip && (
                          <span className="text-[10px] bg-[var(--color-surface)] border border-[var(--color-surface-border)] px-1.5 py-0.5 rounded text-[var(--color-text-secondary)] font-mono">
                            Last: {lastDisplayChip}
                          </span>
                        )}
                        {progressionSuggestion && (
                          <span className="text-[10px] bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold px-1.5 py-0.5 rounded border border-[var(--color-primary)]/30">
                            {progressionSuggestion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <ChevronDown size={20} className="text-[var(--color-text-secondary)]" />
                  </motion.div>
                </div>

                {/* Collapsible Sets, Logs, Timers */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-5 pb-2 border-t border-[var(--color-surface-border)] mt-4">
                        
                        {/* Exercise Specific Note */}
                        {exercise.note && (
                          <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl mb-4">
                            <Info size={14} className="mt-0.5 shrink-0" />
                            <p>{exercise.note}</p>
                          </div>
                        )}

                        {/* Muscle Focus */}
                        {exercise.targetMuscles && (
                          <p className="text-[11px] text-[var(--color-text-secondary)] mb-3">
                            Focus: <span className="text-white/80">{exercise.targetMuscles}</span>
                          </p>
                        )}

                        {/* Interactive Set Rows with Weight & Reps */}
                        <div className="space-y-2.5 mb-5">
                          {Array.from({ length: numSets }).map((_, setIdx) => {
                            const setData = dayExerciseSets[setIdx] || {};
                            const isChecked = !!setData.completed;

                            return (
                              <div 
                                key={setIdx} 
                                className={`flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-background)] border transition-colors ${isChecked ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5' : 'border-[var(--color-surface-border)]'}`}
                              >
                                <Checkbox 
                                  checked={isChecked}
                                  onChange={() => {
                                    logSet(targetDateStr, exercise.id, setIdx, {
                                      completed: !isChecked,
                                      weight: setData.weight || '',
                                      reps: setData.reps || ''
                                    });
                                  }}
                                  label={`S${setIdx + 1}`}
                                  className="shrink-0"
                                />

                                <div className="flex items-center gap-2 flex-1 justify-end">
                                  {/* Weight Input (optional for bodyweight/plank) */}
                                  {!exercise.isDuration && (
                                    <div className="flex items-center gap-1 bg-[var(--color-surface)] px-2 py-1 rounded-lg border border-[var(--color-surface-border)]">
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="kg"
                                        value={setData.weight || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/[^0-9.]/g, '');
                                          logSet(targetDateStr, exercise.id, setIdx, { weight: val });
                                        }}
                                        className="w-12 bg-transparent text-xs text-right font-mono text-white focus:outline-none"
                                      />
                                      <span className="text-[10px] text-[var(--color-text-secondary)]">kg</span>
                                    </div>
                                  )}

                                  {/* Reps or Seconds Input */}
                                  <div className="flex items-center gap-1 bg-[var(--color-surface)] px-2 py-1 rounded-lg border border-[var(--color-surface-border)]">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      placeholder={exercise.isDuration ? '45' : (exercise.reps.split('-')[0] || '8')}
                                      value={setData.reps || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        logSet(targetDateStr, exercise.id, setIdx, { reps: val });
                                      }}
                                      className="w-9 bg-transparent text-xs text-right font-mono text-white focus:outline-none"
                                    />
                                    <span className="text-[10px] text-[var(--color-text-secondary)]">
                                      {exercise.isDuration ? 'sec' : 'reps'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Rest Timers */}
                        <div className="mb-4">
                          <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold mb-2">
                            Rest Timer
                          </p>
                          <div className="flex gap-2">
                            {REST_TIMES.map(sec => {
                              const isRunning = activeTimer?.id === exercise.id && activeTimer?.seconds === sec;
                              return (
                                <Timer 
                                  key={sec}
                                  defaultSeconds={sec} 
                                  isRunning={isRunning}
                                  onToggle={() => {
                                    if (isRunning) {
                                      setActiveTimer(null);
                                    } else {
                                      setActiveTimer({ id: exercise.id, seconds: sec });
                                    }
                                  }}
                                  onComplete={() => setActiveTimer(null)}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Animated Exercise Visual (only if match exists and loads cleanly) */}
                        {exerciseImages[exercise.id] && exerciseImages[exercise.id].length > 0 && (
                          <div className="w-full mt-3 rounded-xl overflow-hidden bg-black/40 border border-[var(--color-surface-border)] p-2">
                            <div className={`grid gap-2 ${exerciseImages[exercise.id].length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {exerciseImages[exercise.id].map((basePath, imgIdx) => (
                                <AnimatedExerciseImage 
                                  key={imgIdx}
                                  basePath={basePath}
                                  altText={`${exercise.name} ${imgIdx + 1}`}
                                />
                              ))}
                            </div>
                          </div>
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
