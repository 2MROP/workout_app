import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Utensils
} from 'lucide-react';

import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import {
  getLocalDateString,
  formatDisplayDate,
  parseLocalDate
} from '../utils/dateUtils';
import { PROTEIN_SOURCES, isProteinDayHit } from '../utils/calcUtils';

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
  const mealProteins = currentLog.mealProteins || {};
  const mealsData = currentLog.meals || {};
  const sizesData = currentLog.mealSizes || {};
  const carbsData = currentLog.mealCarbs || {};

  // Count meal slots that have at least 1 actual protein source selected
  const mealSlotsList = ['meal1', 'snack', 'meal2', 'breakfast'];
  const proteinSlotsCount = mealSlotsList.filter(s => {
    const list = mealProteins[s];
    return Array.isArray(list) && list.some(p => p && p.toLowerCase() !== 'none');
  }).length;

  const isTargetHit = isProteinDayHit(currentLog);

  // Breakfast collapse state (open if any breakfast data exists)
  const [showBreakfast, setShowBreakfast] = useState(
    Boolean(
      mealsData.breakfast ||
      carbsData.breakfast ||
      (Array.isArray(mealProteins.breakfast) && mealProteins.breakfast.length > 0)
    )
  );

  // Toggle protein source chip for a specific meal
  const toggleProteinSource = (slotKey, source) => {
    logNutrition(selectedDate, prev => {
      const prevMealProteins = prev.mealProteins || {};
      const currentList = Array.isArray(prevMealProteins[slotKey]) ? prevMealProteins[slotKey] : [];

      let updatedList;
      if (source === 'None') {
        if (currentList.includes('None')) {
          updatedList = [];
        } else {
          updatedList = ['None'];
        }
      } else {
        const withoutNone = currentList.filter(s => s !== 'None');
        if (withoutNone.includes(source)) {
          updatedList = withoutNone.filter(s => s !== source);
        } else {
          updatedList = [...withoutNone, source];
        }
      }

      return {
        ...prev,
        mealProteins: {
          ...prevMealProteins,
          [slotKey]: updatedList
        }
      };
    });
  };

  // Meal notes update helpers
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

  const renderMealSlot = (slotKey, slotLabel, isOptional = false) => {
    const note = mealsData[slotKey] || '';
    const size = sizesData[slotKey] || 'M';
    const carb = carbsData[slotKey] || '';
    const selectedProteins = Array.isArray(mealProteins[slotKey]) ? mealProteins[slotKey] : [];

    return (
      <div className="p-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] space-y-3">
        {/* Slot Title + S/M/L Pill */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Utensils size={13} className="text-[var(--color-primary)]" />
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

        {/* Primary Input: What did you eat? */}
        <div>
          <label className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold block mb-1">
            What did you eat?
          </label>
          <input
            type="text"
            placeholder="e.g. Chicken biryani with raita, or 3 dosas with egg curry"
            value={note}
            onChange={(e) => updateMealNote(slotKey, e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Protein Source Toggle Chips */}
        <div>
          <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold block mb-1.5">
            Protein Sources (Multi-select)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PROTEIN_SOURCES.map(source => {
              const isSelected = selectedProteins.includes(source);
              const isNone = source === 'None';

              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleProteinSource(slotKey, source)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    isSelected
                      ? isNone
                        ? 'bg-[var(--color-surface-hover)] text-gray-300 border border-[var(--color-surface-border)]'
                        : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/50 shadow-[var(--shadow-glow)] font-semibold'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-white border border-[var(--color-surface-border)]'
                  }`}
                >
                  {isSelected && !isNone && '✓ '}
                  {source}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Carb Field */}
        <div className="pt-1">
          <input
            type="text"
            placeholder="Main carb: e.g. 2 chapathi, 1.5 cup rice, 3 idlis"
            value={carb}
            onChange={(e) => updateMealCarb(slotKey, e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]"
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
            <h1 className="text-2xl font-bold tracking-tight">Food & Meals</h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Meal notes & protein sources • Under 1-min logging
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

        {/* Daily Protein Target Status Card */}
        <Card isGlowing={isTargetHit} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                Daily Protein Target
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white">
                  {proteinSlotsCount} <span className="text-sm font-normal text-[var(--color-text-secondary)]">/ 2+ meals with protein</span>
                </span>
              </div>
            </div>

            {isTargetHit ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-[var(--color-primary)] text-xs font-bold shadow-[var(--shadow-glow)]">
                <Sparkles size={14} />
                <span>Target Hit!</span>
              </div>
            ) : (
              <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                {2 - proteinSlotsCount} more meal needed
              </span>
            )}
          </div>

          <div className="w-full bg-[var(--color-background)] h-2 rounded-full overflow-hidden border border-[var(--color-surface-border)]">
            <motion.div
              className="h-full bg-[var(--color-primary)] shadow-[var(--shadow-glow)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (proteinSlotsCount / 2) * 100)}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Target hit when at least 2 meal slots include 1+ protein source.
          </p>
        </Card>

        {/* Meal Slots Section */}
        <Card className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Meal Entries</h3>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Text notes + chips</span>
          </div>

          {renderMealSlot('meal1', 'Meal 1')}
          {renderMealSlot('snack', 'Snack')}
          {renderMealSlot('meal2', 'Meal 2')}

          {/* Optional Breakfast */}
          {!showBreakfast ? (
            <button
              type="button"
              onClick={() => setShowBreakfast(true)}
              className="w-full py-2.5 border border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40 rounded-xl text-xs text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
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
