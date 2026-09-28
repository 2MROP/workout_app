import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  ChevronDown
} from 'lucide-react';

import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import {
  getLocalDateString,
  formatDisplayDate,
  parseLocalDate
} from '../utils/dateUtils';
import { calcTotalProtein } from '../utils/calcUtils';

export default function Nutrition() {
  const { nutritionLogs, profile, logNutrition } = useAppContext();

  // Active date selection (defaults to today)
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const prevDate = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(getLocalDateString(d));
  };

  const nextDate = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(getLocalDateString(d));
  };

  // Active date's nutrition log
  const currentLog = nutritionLogs[selectedDate] || {};
  const totalProtein = calcTotalProtein(currentLog);
  const proteinTarget = profile.proteinTarget || 140;
  const isTargetMet = totalProtein >= (profile.proteinMin || 130);

  // Manual protein input state
  const [manualGrams, setManualGrams] = useState('');

  // Breakfast collapse state
  const [showBreakfast, setShowBreakfast] = useState(
    Boolean(currentLog.meals?.breakfast || currentLog.mealCarbs?.breakfast)
  );

  // Quick foods from profile
  const quickFoods = profile.quickFoods || [
    { id: 'egg', label: 'Egg', protein: 6, unit: '1 egg' },
    { id: 'chicken', label: 'Chicken', protein: 27, unit: '100g' },
    { id: 'dal', label: 'Dal', protein: 9, unit: '1 bowl' },
    { id: 'curd', label: 'Curd', protein: 6, unit: '150ml' },
    { id: 'soya', label: 'Soya Chunks', protein: 20, unit: '40g' },
    { id: 'milk', label: 'Milk', protein: 8, unit: '1 glass' }
  ];

  // Quick add food action
  const handleQuickAdd = (food) => {
    logNutrition(selectedDate, prev => {
      const currentList = Array.isArray(prev.quickEntries) ? prev.quickEntries : [];
      return {
        ...prev,
        quickEntries: [
          ...currentList,
          {
            uid: Date.now() + Math.random(),
            id: food.id,
            label: food.label,
            protein: food.protein
          }
        ]
      };
    });
  };

  // Remove specific quick entry
  const handleRemoveEntry = (uid) => {
    logNutrition(selectedDate, prev => {
      const currentList = Array.isArray(prev.quickEntries) ? prev.quickEntries : [];
      return {
        ...prev,
        quickEntries: currentList.filter(item => item.uid !== uid)
      };
    });
  };

  // Add manual protein grams
  const handleAddManualProtein = () => {
    const val = parseFloat(manualGrams);
    if (!isNaN(val) && val > 0) {
      logNutrition(selectedDate, prev => ({
        ...prev,
        proteinGrams: (parseFloat(prev.proteinGrams) || 0) + val
      }));
      setManualGrams('');
    }
  };

  // Meal slots update helper
  const updateMealNote = (slot, text) => {
    logNutrition(selectedDate, prev => ({
      ...prev,
      meals: {
        ...(prev.meals || {}),
        [slot]: text
      }
    }));
  };

  const updateMealSize = (slot, size) => {
    logNutrition(selectedDate, prev => ({
      ...prev,
      mealSizes: {
        ...(prev.mealSizes || {}),
        [slot]: size
      }
    }));
  };

  const updateMealCarb = (slot, carb) => {
    logNutrition(selectedDate, prev => ({
      ...prev,
      mealCarbs: {
        ...(prev.mealCarbs || {}),
        [slot]: carb
      }
    }));
  };

  // Tallies helper
  const updateTally = (field, delta) => {
    logNutrition(selectedDate, prev => {
      const cur = parseInt(prev[field], 10) || 0;
      const next = Math.max(0, cur + delta);
      return {
        ...prev,
        [field]: next
      };
    });
  };

  const mealsData = currentLog.meals || {};
  const sizesData = currentLog.mealSizes || {};
  const carbsData = currentLog.mealCarbs || {};

  const renderMealSlot = (slotKey, slotLabel, isOptional = false) => {
    const note = mealsData[slotKey] || '';
    const size = sizesData[slotKey] || 'M';
    const carb = carbsData[slotKey] || '';

    return (
      <div className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            {slotLabel}
            {isOptional && (
              <span className="text-[10px] text-[var(--color-text-secondary)] font-normal">(Optional)</span>
            )}
          </span>

          {/* Size Pill Selector: S / M / L */}
          <div className="flex items-center gap-1 bg-[var(--color-surface)] p-0.5 rounded-lg border border-[var(--color-surface-border)]">
            {['S', 'M', 'L'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => updateMealSize(slotKey, s)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  size === s
                    ? 'bg-[var(--color-primary)] text-[var(--color-background)]'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Note Input */}
          <input
            type="text"
            placeholder="e.g. Rice, chicken, dal"
            value={note}
            onChange={(e) => updateMealNote(slotKey, e.target.value)}
            className="col-span-2 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]"
          />

          {/* Main Carb Field */}
          <input
            type="text"
            placeholder="Carb: e.g. 2 roti"
            value={carb}
            onChange={(e) => updateMealCarb(slotKey, e.target.value)}
            className="col-span-1 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-lg px-2 py-1.5 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="p-4 pb-28 max-w-md mx-auto space-y-5">
        
        {/* Top Header & Date Switcher */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Food & Protein</h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Target 140g • Under 1-min quick logging
            </p>
          </div>

          {/* Calorie Guide Badge (Display only) */}
          <div className="px-2.5 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-right">
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono block">Guide</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {profile.calorieGuide || 2400} kcal
            </span>
          </div>
        </div>

        {/* Date Switcher Bar */}
        <div className="glass rounded-xl p-1.5 flex items-center justify-between text-xs">
          <button
            onClick={prevDate}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {formatDisplayDate(selectedDate, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[10px] text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded font-semibold"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={nextDate}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Protein Tracker Card */}
        <Card isGlowing={isTargetMet} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                Daily Protein Goal
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-bold font-mono text-[var(--color-primary)]">
                  {totalProtein}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                  / {proteinTarget} g
                </span>
              </div>
            </div>

            {isTargetMet ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-[var(--color-primary)] text-xs font-bold shadow-[var(--shadow-glow)]">
                <Sparkles size={14} />
                <span>On Target!</span>
              </div>
            ) : (
              <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                {Math.max(0, 130 - totalProtein)}g to min target (130g)
              </span>
            )}
          </div>

          {/* Progress Gauge */}
          <div className="w-full bg-[var(--color-background)] h-2.5 rounded-full overflow-hidden border border-[var(--color-surface-border)]">
            <motion.div
              className="h-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (totalProtein / proteinTarget) * 100)}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>

          {/* Quick-Add Buttons Grid */}
          <div className="pt-2">
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold block mb-2">
              Tap to Quick-Add
            </span>
            <div className="grid grid-cols-3 gap-2">
              {quickFoods.map(food => (
                <motion.button
                  key={food.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleQuickAdd(food)}
                  className="p-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold text-white truncate">
                    +{food.label}
                  </span>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--color-primary)] font-mono font-semibold">
                    <span>+{food.protein}g</span>
                    <Plus size={10} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Manual Input Row */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder="+ custom grams (e.g. 25)"
              value={manualGrams}
              onChange={(e) => setManualGrams(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddManualProtein()}
              className="flex-1 bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] font-mono"
            />
            <button
              onClick={handleAddManualProtein}
              className="px-4 py-2 bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] text-xs font-bold rounded-xl transition-colors text-white"
            >
              Add
            </button>
          </div>

          {/* Today's Added Chips List with Remove option */}
          {Array.isArray(currentLog.quickEntries) && currentLog.quickEntries.length > 0 && (
            <div className="pt-2 border-t border-[var(--color-surface-border)]">
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold block mb-1.5">
                Logged Today ({currentLog.quickEntries.length} items)
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {currentLog.quickEntries.map(item => (
                  <span
                    key={item.uid}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[var(--color-background)] border border-[var(--color-surface-border)] text-[11px] font-mono text-white"
                  >
                    <span>{item.label} (+{item.protein}g)</span>
                    <button
                      onClick={() => handleRemoveEntry(item.uid)}
                      className="text-[var(--color-text-secondary)] hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Meals Section */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Daily Meals</h3>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Size & carb tracking</span>
          </div>

          {renderMealSlot('meal1', 'Meal 1')}
          {renderMealSlot('snack', 'Snack')}
          {renderMealSlot('meal2', 'Meal 2')}

          {/* Optional Breakfast */}
          {!showBreakfast ? (
            <button
              type="button"
              onClick={() => setShowBreakfast(true)}
              className="w-full py-2 border border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40 rounded-xl text-xs text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Add Breakfast (Optional)</span>
            </button>
          ) : (
            renderMealSlot('breakfast', 'Breakfast', true)
          )}
        </Card>

        {/* Tallies Section */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Weekly Patterns</h3>
            <span className="text-[10px] text-[var(--color-text-secondary)]">No guilt • Awareness only</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Restaurant / Fried / Heavy Meal</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                Biryani, dosa, burgers etc. are all allowed
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateTally('restaurantCount', -1)}
                className="w-7 h-7 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center text-white"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center font-bold font-mono text-sm">
                {currentLog.restaurantCount || 0}
              </span>
              <button
                onClick={() => updateTally('restaurantCount', 1)}
                className="w-7 h-7 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Sugary Drinks</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                Soda, juices. (Diet / Zero-cal drinks NOT counted)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateTally('sugaryDrinkCount', -1)}
                className="w-7 h-7 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center text-white"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center font-bold font-mono text-sm">
                {currentLog.sugaryDrinkCount || 0}
              </span>
              <button
                onClick={() => updateTally('sugaryDrinkCount', 1)}
                className="w-7 h-7 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center text-white"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </Card>

      </div>
    </PageTransition>
  );
}
