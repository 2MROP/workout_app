import React, { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingDown,
  Calendar,
  AlertCircle,
  Download,
  Upload,
  User,
  CheckCircle,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Dumbbell,
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';

import PageTransition from '../components/PageTransition';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import {
  getLocalDateString,
  getMondayOfWeek,
  getWeekDates,
  getPreviousMonday,
  getNextMonday,
  formatDisplayDate,
  parseLocalDate
} from '../utils/dateUtils';
import { calc7DayWeightAvg, evaluateWeeklyReview } from '../utils/calcUtils';

export default function Progress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useAppContext();
  const {
    state,
    weightLogs,
    waistLogs,
    workoutLogs,
    cardioLogs,
    nutritionLogs,
    profile,
    meta,
    logWeight,
    logWaist,
    updateProfile,
    exportData,
    importData
  } = context;

  // Active tab: 'weight', 'review', or 'profile'
  const activeTab = searchParams.get('tab') || 'weight';
  const setTab = (t) => setSearchParams({ tab: t });

  // Today & current week
  const todayStr = getLocalDateString();
  const currentMonday = getMondayOfWeek(todayStr);
  const currentWeekDates = getWeekDates(currentMonday);

  // Track waist toggle setting from profile (default OFF)
  const trackWaistEnabled = Boolean(profile.trackWaist);

  // Weight form state
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const currentLoggedWeight = weightLogs[selectedDate] !== undefined ? String(weightLogs[selectedDate]) : '';
  const [weightInput, setWeightInput] = useState(currentLoggedWeight);

  React.useEffect(() => {
    setWeightInput(weightLogs[selectedDate] !== undefined ? String(weightLogs[selectedDate]) : '');
  }, [selectedDate, weightLogs]);

  // Waist form state
  const [waistDate, setWaistDate] = useState(todayStr);
  const currentLoggedWaist = waistLogs[waistDate] !== undefined ? String(waistLogs[waistDate]) : '';
  const [waistInput, setWaistInput] = useState(currentLoggedWaist);

  React.useEffect(() => {
    setWaistInput(waistLogs[waistDate] !== undefined ? String(waistLogs[waistDate]) : '');
  }, [waistDate, waistLogs]);

  // Weekly Review week selector (defaults to last completed week)
  const defaultReviewMonday = getPreviousMonday(currentMonday);
  const [selectedReviewMonday, setSelectedReviewMonday] = useState(defaultReviewMonday);

  const prevReviewWeek = () => {
    setSelectedReviewMonday(getPreviousMonday(selectedReviewMonday));
  };

  const nextReviewWeek = () => {
    setSelectedReviewMonday(getNextMonday(selectedReviewMonday));
  };

  // Evaluate weekly review for the selected week
  const reviewData = useMemo(() => {
    return evaluateWeeklyReview(selectedReviewMonday, state);
  }, [selectedReviewMonday, state]);

  // Plateau checklist interactive state
  const [checkedChecklistItems, setCheckedChecklistItems] = useState({});
  const toggleChecklistItem = (item) => {
    setCheckedChecklistItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Check if waist was logged for current week
  const hasLoggedWaistThisWeek = currentWeekDates.some(d => waistLogs[d] !== undefined);

  // 7-day average for selected date and today
  const selected7DayAvg = calc7DayWeightAvg(weightLogs, selectedDate);
  const today7DayAvg = calc7DayWeightAvg(weightLogs, todayStr);

  // Import modal & feedback state
  const [importModalData, setImportModalData] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Profile edit states
  const [profileForm, setProfileForm] = useState({
    age: profile.age || 22,
    height: profile.height || 188,
    startWeight: profile.startWeight || 98,
    goalWeight: profile.goalWeight || 90,
    phase2Goal: profile.phase2Goal || 85,
    proteinTarget: profile.proteinTarget || 140,
    calorieGuide: profile.calorieGuide || 2400,
    trackWaist: Boolean(profile.trackWaist)
  });

  // Keep form state in sync with profile
  React.useEffect(() => {
    setProfileForm({
      age: profile.age || 22,
      height: profile.height || 188,
      startWeight: profile.startWeight || 98,
      goalWeight: profile.goalWeight || 90,
      phase2Goal: profile.phase2Goal || 85,
      proteinTarget: profile.proteinTarget || 140,
      calorieGuide: profile.calorieGuide || 2400,
      trackWaist: Boolean(profile.trackWaist)
    });
  }, [profile]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({
      age: parseInt(profileForm.age, 10) || 22,
      height: parseInt(profileForm.height, 10) || 188,
      startWeight: parseFloat(profileForm.startWeight) || 98,
      goalWeight: parseFloat(profileForm.goalWeight) || 90,
      phase2Goal: parseFloat(profileForm.phase2Goal) || 85,
      proteinTarget: parseInt(profileForm.proteinTarget, 10) || 140,
      calorieGuide: parseInt(profileForm.calorieGuide, 10) || 2400,
      trackWaist: Boolean(profileForm.trackWaist)
    });
    setFeedbackMessage({ type: 'success', text: 'Profile saved successfully!' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleToggleTrackWaist = () => {
    const nextVal = !profileForm.trackWaist;
    setProfileForm(prev => ({ ...prev, trackWaist: nextVal }));
    updateProfile({ trackWaist: nextVal });
    setFeedbackMessage({
      type: 'success',
      text: nextVal ? 'Waist tracking enabled.' : 'Waist tracking disabled.'
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Export JSON handler
  const handleExport = () => {
    try {
      const jsonStr = exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-backup-${todayStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedbackMessage({ type: 'success', text: 'Backup downloaded successfully!' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Failed to export backup.' });
    }
  };

  // Import JSON file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || parsed.schemaVersion !== 1) {
          throw new Error('Unsupported schema version. Expected fitness_v2.');
        }

        const workoutCount = Object.keys(parsed.workoutLogs || {}).length;
        const weightCount = Object.keys(parsed.weightLogs || {}).length;
        const nutCount = Object.keys(parsed.nutritionLogs || {}).length;

        setImportModalData({
          raw: parsed,
          summary: `${weightCount} weight logs, ${workoutCount} workout days, ${nutCount} food logs`
        });
      } catch (err) {
        setFeedbackMessage({ type: 'error', text: err.message || 'Malformed JSON file.' });
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (!importModalData) return;
    try {
      importData(importModalData.raw);
      setImportModalData(null);
      setFeedbackMessage({ type: 'success', text: 'Data restored successfully!' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Failed to restore: ' + err.message });
    }
  };

  // Chart data for SVG trend graph
  const chartData = useMemo(() => {
    const entries = Object.keys(weightLogs)
      .map(dStr => ({ dateStr: dStr, weight: weightLogs[dStr] }))
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    if (entries.length === 0) return null;

    const pointsWithAvg = entries.map(item => ({
      ...item,
      avg: calc7DayWeightAvg(weightLogs, item.dateStr)
    }));

    const allWeights = entries.map(e => e.weight);
    const minW = Math.min(...allWeights, 84);
    const maxW = Math.max(...allWeights, 100);
    const range = maxW - minW || 1;

    const width = 360;
    const height = 180;
    const padX = 30;
    const padY = 24;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const getX = (idx, total) => total <= 1 ? width / 2 : padX + (idx / (total - 1)) * innerW;
    const getY = (val) => padY + innerH - ((val - minW) / range) * innerH;

    const rawPoints = pointsWithAvg.map((p, idx) => ({
      x: getX(idx, pointsWithAvg.length),
      y: getY(p.weight),
      dateStr: p.dateStr,
      weight: p.weight,
      avg: p.avg,
      avgY: p.avg !== null ? getY(p.avg) : null
    }));

    const rawPath = rawPoints.length > 1
      ? rawPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
      : '';

    const avgPoints = rawPoints.filter(p => p.avgY !== null);
    const avgPath = avgPoints.length > 1
      ? avgPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.avgY}`, '')
      : '';

    return {
      points: rawPoints,
      rawPath,
      avgPath,
      goal90Y: getY(90),
      goal85Y: getY(85),
      width,
      height
    };
  }, [weightLogs]);

  // Waist history
  const waistHistory = useMemo(() => {
    return Object.keys(waistLogs)
      .map(dStr => ({ dateStr: dStr, waist: waistLogs[dStr] }))
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr))
      .slice(0, 5);
  }, [waistLogs]);

  // Format week range label (Mon - Sun)
  const reviewWeekDates = getWeekDates(selectedReviewMonday);
  const weekStartDisplay = formatDisplayDate(reviewWeekDates[0], { month: 'short', day: 'numeric' });
  const weekEndDisplay = formatDisplayDate(reviewWeekDates[6], { month: 'short', day: 'numeric' });

  return (
    <PageTransition>
      <div className="p-4 pb-28 max-w-md mx-auto space-y-5">
        
        {/* Top Header */}
        <div className="pt-2 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Progress & Review</h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Weight trend, 7-day average, and weekly review
            </p>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedbackMessage.type === 'error'
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  : 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 text-[var(--color-primary)]'
              }`}
            >
              <CheckCircle size={16} />
              <span>{feedbackMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Segmented Control Bar */}
        <div className="glass rounded-xl p-1 flex items-center text-xs font-medium">
          <button
            onClick={() => setTab('weight')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTab === 'weight'
                ? 'bg-[var(--color-surface-hover)] text-white shadow font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            Weight Trend
          </button>
          <button
            onClick={() => setTab('review')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTab === 'review'
                ? 'bg-[var(--color-surface-hover)] text-white shadow font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            Weekly Review
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-[var(--color-surface-hover)] text-white shadow font-semibold'
                : 'text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            Profile & Backup
          </button>
        </div>

        {/* TAB 1: WEIGHT (PRIMARY & PROMINENT) */}
        {activeTab === 'weight' && (
          <div className="space-y-5">
            
            {/* 1. Hero 7-Day Rolling Average Highlight Card (Most Prominent) */}
            <Card isGlowing={true} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                  7-Day Rolling Weight Average
                </span>
                <span className="text-[10px] text-[var(--color-primary)] font-mono font-semibold">
                  Phase 1 Goal: {profile.goalWeight || 90} kg
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono text-[var(--color-primary)]">
                    {today7DayAvg !== null ? today7DayAvg : (selected7DayAvg !== null ? selected7DayAvg : '--')}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-secondary)]">kg</span>
                </div>
                {today7DayAvg !== null && (
                  <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                    {Number((today7DayAvg - (profile.goalWeight || 90)).toFixed(1))} kg to goal
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Daily weight fluctuates with water, salt, and carbs. Focus on this 7-day average trend line.
              </p>
            </Card>

            {/* 2. Pure-SVG Weight Trend Graph */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown size={16} className="text-[var(--color-accent)]" />
                  <h3 className="font-bold text-sm">Trend Graph & Goals</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-[var(--color-accent)]">
                    <span className="w-2.5 h-0.5 bg-[var(--color-accent)] inline-block"></span> Daily
                  </span>
                  <span className="flex items-center gap-1 text-[var(--color-primary)]">
                    <span className="w-2.5 h-0.5 bg-[var(--color-primary)] inline-block"></span> 7d Avg
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-0.5 bg-amber-400 border-dashed inline-block"></span> 90 kg
                  </span>
                </div>
              </div>

              {chartData && chartData.points.length > 0 ? (
                <div className="w-full bg-[var(--color-background)] rounded-xl p-2 border border-[var(--color-surface-border)] overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                    className="w-full h-44 overflow-visible font-mono select-none"
                  >
                    {/* Goal Line: 90 kg */}
                    <line
                      x1={24}
                      y1={chartData.goal90Y}
                      x2={chartData.width - 10}
                      y2={chartData.goal90Y}
                      stroke="#fbbf24"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      opacity={0.6}
                    />
                    <text
                      x={chartData.width - 8}
                      y={chartData.goal90Y - 4}
                      fill="#fbbf24"
                      fontSize={9}
                      textAnchor="end"
                    >
                      Goal 90 kg
                    </text>

                    {/* Goal Line: 85 kg (Phase 2) */}
                    <line
                      x1={24}
                      y1={chartData.goal85Y}
                      x2={chartData.width - 10}
                      y2={chartData.goal85Y}
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="2 4"
                      opacity={0.4}
                    />
                    <text
                      x={chartData.width - 8}
                      y={chartData.goal85Y - 4}
                      fill="#f59e0b"
                      fontSize={8}
                      textAnchor="end"
                    >
                      Phase 2 (85 kg)
                    </text>

                    {/* Raw Daily Weights Line */}
                    {chartData.rawPath && (
                      <path
                        d={chartData.rawPath}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                        opacity={0.7}
                      />
                    )}

                    {/* 7-Day Average Line */}
                    {chartData.avgPath && (
                      <path
                        d={chartData.avgPath}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    )}

                    {/* Dots for daily entries */}
                    {chartData.points.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={3.5}
                          fill="var(--color-accent)"
                          stroke="#0f1014"
                          strokeWidth={1.5}
                        />
                        {(i === 0 || i === chartData.points.length - 1) && (
                          <text
                            x={pt.x}
                            y={pt.y - 7}
                            fill="#ffffff"
                            fontSize={9}
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {pt.weight}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              ) : (
                <div className="p-8 text-center bg-[var(--color-background)] rounded-xl border border-[var(--color-surface-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    No weight entries yet. Log your morning weight below to draw your trend graph!
                  </p>
                </div>
              )}
            </Card>

            {/* 3. Quick Morning Weight Log Entry */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Log Morning Weight</h3>
                <span className="text-[11px] text-[var(--color-text-secondary)]">3-4 mornings / wk</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]"
                />

                <div className="flex-1 flex gap-2">
                  <div className="flex-1 flex items-center bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 97.8"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value.replace(/[^0-9.]/g, ''))}
                      onBlur={() => {
                        const val = parseFloat(weightInput);
                        logWeight(selectedDate, isNaN(val) ? '' : val);
                      }}
                      className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                    />
                    <span className="text-xs text-[var(--color-text-secondary)] ml-1">kg</span>
                  </div>

                  <button
                    onClick={() => {
                      const val = parseFloat(weightInput);
                      logWeight(selectedDate, isNaN(val) ? '' : val);
                      setFeedbackMessage({ type: 'success', text: `Saved weight for ${formatDisplayDate(selectedDate)}` });
                      setTimeout(() => setFeedbackMessage(null), 2500);
                    }}
                    className="px-4 py-2 bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30 rounded-xl text-xs font-bold hover:bg-[var(--color-accent)]/25 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </Card>

            {/* 4. Optional Waist Section (Only when trackWaistEnabled is true) */}
            {trackWaistEnabled && (
              <>
                {/* Required Waist Warning Banner (Only when trackWaist is enabled) */}
                {!hasLoggedWaistThisWeek && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs"
                  >
                    <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold">Weekly waist log:</span> Please log your waist measurement for this week.
                    </div>
                  </motion.div>
                )}

                {/* Waist Measurement Card */}
                <Card className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ruler size={18} className="text-[var(--color-primary)]" />
                      <h3 className="font-bold text-base">Weekly Waist Measurement</h3>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Weekly Log
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={waistDate}
                      onChange={(e) => setWaistDate(e.target.value)}
                      className="bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />

                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 flex items-center bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="e.g. 96"
                          value={waistInput}
                          onChange={(e) => setWaistInput(e.target.value.replace(/[^0-9.]/g, ''))}
                          onBlur={() => {
                            const val = parseFloat(waistInput);
                            logWaist(waistDate, isNaN(val) ? '' : val);
                          }}
                          className="w-full bg-transparent text-sm font-mono text-white focus:outline-none"
                        />
                        <span className="text-xs text-[var(--color-text-secondary)] ml-1">cm</span>
                      </div>

                      <button
                        onClick={() => {
                          const val = parseFloat(waistInput);
                          logWaist(waistDate, isNaN(val) ? '' : val);
                          setFeedbackMessage({ type: 'success', text: `Saved waist for ${formatDisplayDate(waistDate)}` });
                          setTimeout(() => setFeedbackMessage(null), 2500);
                        }}
                        className="px-4 py-2 bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 rounded-xl text-xs font-bold hover:bg-[var(--color-primary)]/25 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Waist History List */}
                  {waistHistory.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--color-surface-border)]">
                      <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                        Recent Waist Logs
                      </span>
                      {waistHistory.map((item, idx) => {
                        const prevItem = waistHistory[idx + 1];
                        const delta = prevItem ? Number((item.waist - prevItem.waist).toFixed(1)) : null;

                        return (
                          <div
                            key={item.dateStr}
                            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-[var(--color-background)]"
                          >
                            <span className="text-[var(--color-text-secondary)] font-mono">
                              {formatDisplayDate(item.dateStr, { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono">{item.waist} cm</span>
                              {delta !== null && (
                                <span
                                  className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                                    delta < 0
                                      ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                                      : delta > 0
                                      ? 'text-amber-400 bg-amber-500/10'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {delta > 0 ? `+${delta}` : delta} cm
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </>
            )}

          </div>
        )}

        {/* TAB 2: WEEKLY REVIEW */}
        {activeTab === 'review' && (
          <div className="space-y-5">
            
            {/* Week Switcher Bar */}
            <div className="glass rounded-xl p-1.5 flex items-center justify-between text-xs">
              <button
                onClick={prevReviewWeek}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="text-center">
                <span className="font-bold text-sm block">
                  {weekStartDisplay} – {weekEndDisplay}
                </span>
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  {selectedReviewMonday === currentMonday ? 'Current Week' : 'Completed Week'}
                </span>
              </div>

              <button
                onClick={nextReviewWeek}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Minimum-Week Mode Banner */}
            {reviewData.isMinimumAchieved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-2xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40 text-[var(--color-primary)] flex items-start gap-2.5 shadow-[var(--shadow-glow)]"
              >
                <Sparkles size={18} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    On Track (Minimum Target Achieved) 🎯
                  </h4>
                  <p className="text-xs text-white/90 mt-0.5 leading-relaxed">
                    You completed at least 2 full workouts and hit your protein target on 4+ days. That counts as an on-track week!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Weekly Metrics Grid (Waist card is ONLY rendered if waist data exists for this week) */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Metric 1: Weight Avg Change */}
              <Card className="p-3.5 flex flex-col justify-between">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                  Weight Avg Change
                </span>
                <div className="my-1.5">
                  {reviewData.weightChange !== null ? (
                    <span className={`text-xl font-bold font-mono ${
                      reviewData.weightChange < 0
                        ? 'text-[var(--color-primary)]'
                        : reviewData.weightChange > 0
                        ? 'text-amber-400'
                        : 'text-white'
                    }`}>
                      {reviewData.weightChange > 0 ? `+${reviewData.weightChange}` : reviewData.weightChange} kg
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--color-text-secondary)] italic">
                      Need 2+ entries / wk
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  {reviewData.currentWeekWeight.avg !== null ? `This wk: ${reviewData.currentWeekWeight.avg} kg` : 'Incomplete'}
                </span>
              </Card>

              {/* Metric 2: Waist Change (ONLY if waist data exists for this week; otherwise skipped silently) */}
              {reviewData.currentWaist !== null && (
                <Card className="p-3.5 flex flex-col justify-between">
                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                    Waist Delta
                  </span>
                  <div className="my-1.5">
                    {reviewData.waistChange !== null ? (
                      <span className={`text-xl font-bold font-mono ${
                        reviewData.waistChange < 0 ? 'text-[var(--color-primary)]' : 'text-amber-400'
                      }`}>
                        {reviewData.waistChange > 0 ? `+${reviewData.waistChange}` : reviewData.waistChange} cm
                      </span>
                    ) : (
                      <span className="text-xl font-bold font-mono text-white">
                        {reviewData.currentWaist} cm
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    {reviewData.prevWaist !== null ? `Prev: ${reviewData.prevWaist} cm` : 'First entry'}
                  </span>
                </Card>
              )}

              {/* Metric 3: Workouts Done */}
              <Card className="p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                    Workouts Done
                  </span>
                  <Dumbbell size={14} className="text-[var(--color-primary)]" />
                </div>
                <div className="my-1.5">
                  <span className="text-xl font-bold font-mono text-white">
                    {reviewData.workoutsDone} <span className="text-sm font-normal text-[var(--color-text-secondary)]">/ 3</span>
                  </span>
                </div>
                <div className="w-full bg-[var(--color-surface-border)] h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-primary)]"
                    style={{ width: `${(reviewData.workoutsDone / 3) * 100}%` }}
                  />
                </div>
              </Card>

              {/* Metric 4: Cardio Done */}
              <Card className="p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                    Cardio Done
                  </span>
                  <Flame size={14} className="text-[var(--color-accent)]" />
                </div>
                <div className="my-1.5">
                  <span className="text-xl font-bold font-mono text-white">
                    {reviewData.cardioDone} <span className="text-sm font-normal text-[var(--color-text-secondary)]">/ 3</span>
                  </span>
                </div>
                <div className="w-full bg-[var(--color-surface-border)] h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-accent)]"
                    style={{ width: `${(reviewData.cardioDone / 3) * 100}%` }}
                  />
                </div>
              </Card>

              {/* Metric 5: Protein Consistency (2+ protein meals) */}
              <Card className="p-3.5 flex flex-col justify-between">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                  Protein Consistency
                </span>
                <div className="my-1.5">
                  <span className="text-xl font-bold font-mono text-white">
                    {reviewData.proteinDaysHit} <span className="text-sm font-normal text-[var(--color-text-secondary)]">/ 7 days</span>
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  Target: 2+ protein meals/day
                </span>
              </Card>

              {/* Metric 6: Food Patterns */}
              <Card className="p-3.5 flex flex-col justify-between">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">
                  Weekly Patterns
                </span>
                <div className="my-1 text-xs space-y-0.5">
                  <div className="flex justify-between font-mono">
                    <span className="text-[var(--color-text-secondary)]">Heavy meals:</span>
                    <span className="font-bold text-white">{reviewData.restaurantMeals}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-[var(--color-text-secondary)]">Sugary drinks:</span>
                    <span className="font-bold text-white">{reviewData.sugaryDrinks}</span>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)]">
                  Portion tracking only
                </span>
              </Card>

            </div>

            {/* Automated Coaching Recommendation */}
            <Card isGlowing={reviewData.recommendation.type === 'on_track'} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-text-secondary)]">
                    {reviewData.recommendation.badge}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {reviewData.recommendation.title}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                  {reviewData.recommendation.message}
                </p>
              </div>

              {/* Plateau Checklist if triggered */}
              {Array.isArray(reviewData.recommendation.checklist) && (
                <div className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] space-y-2 mt-2">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    Plateau Self-Check:
                  </span>
                  <div className="space-y-1.5">
                    {reviewData.recommendation.checklist.map((item, idx) => {
                      const isChecked = !!checkedChecklistItems[item];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklistItem(item)}
                          className="flex items-center gap-2 text-xs text-white/90 cursor-pointer select-none"
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-[var(--color-primary)] shrink-0" />
                          ) : (
                            <Square size={16} className="text-[var(--color-text-secondary)] shrink-0" />
                          )}
                          <span className={isChecked ? 'line-through text-[var(--color-text-secondary)]' : ''}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Note */}
              {reviewData.recommendation.calorieNote && (
                <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-xs font-mono text-[var(--color-primary)]">
                  💡 Suggestion: {reviewData.recommendation.calorieNote}
                </div>
              )}
            </Card>

          </div>
        )}

        {/* TAB 3: PROFILE & BACKUP */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            
            {/* Profile Form */}
            <Card className="space-y-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[var(--color-primary)]" />
                <h3 className="font-bold text-base">User Profile & Targets</h3>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[var(--color-text-secondary)] block mb-1">Age</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[var(--color-text-secondary)] block mb-1">Height (cm)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={profileForm.height}
                      onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--color-text-secondary)] block mb-1">Start (kg)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={profileForm.startWeight}
                      onChange={(e) => setProfileForm({ ...profileForm, startWeight: e.target.value })}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-2 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--color-primary)] font-bold block mb-1">Phase 1 (kg)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={profileForm.goalWeight}
                      onChange={(e) => setProfileForm({ ...profileForm, goalWeight: e.target.value })}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-primary)]/40 rounded-xl px-2 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-amber-400 font-bold block mb-1">Phase 2 (kg)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={profileForm.phase2Goal}
                      onChange={(e) => setProfileForm({ ...profileForm, phase2Goal: e.target.value })}
                      className="w-full bg-[var(--color-background)] border border-amber-500/30 rounded-xl px-2 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Track Waist Toggle Switch (Default OFF) */}
                <div className="p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Track Waist Measurements</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                      Enable weekly waist logging and history
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleTrackWaist}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      profileForm.trackWaist ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        profileForm.trackWaist ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-[var(--color-text-secondary)] block mb-1">
                      Protein Target
                    </label>
                    <span className="text-xs font-mono text-white block bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2">
                      2+ meals/day
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-[var(--color-text-secondary)] block mb-1">
                      Calorie Guide (kcal)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={profileForm.calorieGuide}
                      onChange={(e) => setProfileForm({ ...profileForm, calorieGuide: e.target.value })}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-surface-border)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                    />
                    <span className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 block">Display only (no count)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] text-white text-xs font-bold rounded-xl transition-colors mt-2"
                >
                  Save Profile Settings
                </button>
              </form>
            </Card>

            {/* Backup & Restore Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download size={18} className="text-[var(--color-primary)]" />
                  <h3 className="font-bold text-base">Backup & Restore</h3>
                </div>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                  {meta.lastExportDate ? `Last: ${meta.lastExportDate}` : 'Never exported'}
                </span>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Export your entire workout, weight, and nutrition history into a single portable JSON file. Restore it anytime on another device or browser.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleExport}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
                >
                  <Download size={15} />
                  Export JSON
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-border)] text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload size={15} />
                  Import JSON
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </Card>

          </div>
        )}

        {/* Confirmation Modal for Import Overwrite */}
        <AnimatePresence>
          {importModalData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-5"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">Restore Backup?</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                    This will replace your current logs with the imported backup file.
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-surface-border)] text-xs text-[var(--color-primary)] font-mono">
                    {importModalData.summary}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setImportModalData(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-surface-hover)] text-white hover:bg-[var(--color-surface-border)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmImport}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-[var(--color-background)] hover:opacity-90"
                  >
                    Confirm Restore
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
