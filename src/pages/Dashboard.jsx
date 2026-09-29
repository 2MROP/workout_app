import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Flame, Footprints, RotateCcw, AlertTriangle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';
import { ProgressCircle } from '../components/ui/ProgressCircle';
import { workoutPlan, parseSets } from '../data/workouts';
import { useAppContext } from '../context/AppContext';
import {
  getLocalDateString,
  getMondayOfWeek,
  getWeekDates,
  getDayOfWeekKey,
  formatDisplayDate
} from '../utils/dateUtils';
import { calc7DayWeightAvg, isProteinDayHit } from '../utils/calcUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    workoutLogs,
    cardioLogs,
    stepLogs,
    nutritionLogs,
    weightLogs,
    profile,
    meta,
    logSet
  } = useAppContext();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Current calendar day & Monday-Sunday week
  const todayDateStr = getLocalDateString();
  const todayDayKey = getDayOfWeekKey(todayDateStr);
  const currentMonday = getMondayOfWeek(todayDateStr);
  const currentWeekDates = getWeekDates(currentMonday);

  const dayKeyOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Calculate day progress for any specific date within the week
  const getDayProgress = (dateStr, dayKey) => {
    const plan = workoutPlan[dayKey];
    if (!plan) return 0;

    if (plan.type === 'walking') {
      return stepLogs[dateStr]?.completed ? 100 : 0;
    }

    let total = 0;
    let completed = 0;
    const daySets = workoutLogs[dateStr] || {};

    plan.exercises.forEach(ex => {
      if (ex.type === 'cardio') {
        total += 1;
        if (cardioLogs[dateStr]?.[ex.id]?.completed) completed += 1;
      } else {
        const numSets = parseSets(ex);
        total += numSets;
        const exSets = daySets[ex.id] || [];
        for (let i = 0; i < numSets; i++) {
          if (exSets[i]?.completed) completed += 1;
        }
      }
    });

    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const todayIndexInWeek = dayKeyOrder.indexOf(todayDayKey);
  const todayDateInWeek = currentWeekDates[todayIndexInWeek !== -1 ? todayIndexInWeek : 0];
  const todayProgress = getDayProgress(todayDateInWeek, todayDayKey);
  const todayPlan = workoutPlan[todayDayKey];

  // Quick stats for top bar
  const todayNutrition = nutritionLogs[todayDateStr] || {};
  const current7DayAvg = calc7DayWeightAvg(weightLogs, todayDateStr);

  // Backup export reminder (if > 7 days or never)
  const isBackupNeeded = !meta.lastExportDate ||
    Math.floor((new Date(todayDateStr) - new Date(meta.lastExportDate)) / (1000 * 60 * 60 * 24)) >= 7;

  return (
    <PageTransition>
      <div className="p-4 pb-28 space-y-6">
        
        {/* Header Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start pt-2"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Let's train <span className="inline-block animate-bounce">🔥</span></h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Target: 90 kg goal • 2+ protein meals
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-text-secondary)]">
            {formatDisplayDate(todayDateStr, { month: 'short', day: 'numeric', weekday: 'short' })}
          </span>
        </motion.div>

        {/* Backup Reminder Banner */}
        {isBackupNeeded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs cursor-pointer"
            onClick={() => navigate('/progress?tab=backup')}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-amber-400" />
              <span>Backup recommended: Export your JSON copy</span>
            </div>
            <ChevronRight size={14} />
          </motion.div>
        )}

        {/* Daily Quick Glance Badges */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            onClick={() => navigate('/nutrition')}
            className="p-3.5 flex flex-col justify-between"
          >
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
              Today's Meals
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-base font-bold font-mono ${isProteinDayHit(todayNutrition) ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                {['meal1', 'snack', 'meal2', 'breakfast'].filter(s => {
                  const list = todayNutrition.mealProteins?.[s];
                  return Array.isArray(list) && list.some(p => p && p.toLowerCase() !== 'none');
                }).length}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">/ 2+ protein meals</span>
            </div>
            <div className="w-full bg-[var(--color-surface-border)] h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-[var(--color-primary)]"
                style={{
                  width: `${Math.min(100, (['meal1', 'snack', 'meal2', 'breakfast'].filter(s => {
                    const list = todayNutrition.mealProteins?.[s];
                    return Array.isArray(list) && list.some(p => p && p.toLowerCase() !== 'none');
                  }).length / 2) * 100)}%`
                }}
              />
            </div>
          </Card>

          <Card 
            onClick={() => navigate('/progress')}
            className="p-3.5 flex flex-col justify-between"
          >
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
              7-Day Weight Avg
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[var(--color-accent)]">
                {current7DayAvg !== null ? `${current7DayAvg}` : '--'}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">kg</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] mt-1 truncate">
              {current7DayAvg !== null ? 'Target: 90 kg' : 'Need 2+ entries'}
            </span>
          </Card>
        </div>

        {/* Today's Highlight Card */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="text-[var(--color-primary)]" size={18} />
            <h2 className="text-base font-semibold">Today's Focus</h2>
          </div>
          
          <Card 
            isGlowing={true} 
            onClick={() => navigate(`/workout?day=${todayDayKey}&date=${todayDateInWeek}`)}
            className="flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">
                {todayDayKey}
              </span>
              <h3 className="text-xl font-bold mt-0.5">
                {todayPlan ? todayPlan.title : 'Active Recovery'}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">
                {todayPlan?.type === 'walking' 
                  ? '7k-10k step target' 
                  : `${todayPlan?.duration || ''}`}
              </p>
            </div>
            
            {todayPlan?.type === 'workout' ? (
              <ProgressCircle progress={todayProgress} size={64} strokeWidth={5} />
            ) : (
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-colors ${stepLogs[todayDateStr]?.completed ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-[var(--color-primary)]' : 'bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-text-secondary)]'}`}>
                <Footprints size={24} />
              </div>
            )}
          </Card>
        </section>

        {/* Weekly Overview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--color-text-secondary)]">This Week (Mon - Sun)</h2>
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase">
              Week of {formatDisplayDate(currentMonday, { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-2.5">
            {dayKeyOrder.map((dayKey, idx) => {
              if (dayKey === todayDayKey) return null;
              const dayDate = currentWeekDates[idx];
              const plan = workoutPlan[dayKey];
              const progress = getDayProgress(dayDate, dayKey);
              const isWalking = plan?.type === 'walking';
              
              return (
                <motion.div 
                  key={dayKey}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    onClick={() => navigate(`/workout?day=${dayKey}&date=${dayDate}`)}
                    className="flex justify-between items-center group py-3 px-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold tracking-wider">
                          {dayKey.slice(0, 3)} • {formatDisplayDate(dayDate, { month: 'numeric', day: 'numeric' })}
                        </span>
                        {isWalking && (
                          <span className="text-[9px] bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] px-1.5 py-0.2 rounded">
                            walk
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-base mt-0.5 group-hover:text-[var(--color-primary)] transition-colors">
                        {plan ? plan.title : 'Recovery'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                          {progress}%
                        </span>
                        <div className="w-12 h-1 bg-[var(--color-surface-border)] rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-[var(--color-primary)]" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="text-[var(--color-text-secondary)] group-hover:text-white transition-colors" size={18} />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
