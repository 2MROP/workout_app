import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLocalDateString } from '../utils/dateUtils';

const STORAGE_KEY = 'fitness_v2';

const DEFAULT_PROFILE = {
  age: 22,
  height: 188,
  startWeight: 98,
  currentWeight: 98,
  goalWeight: 90,
  phase2Goal: 85,
  proteinTarget: 140,
  proteinMin: 130,
  proteinMax: 150,
  calorieGuide: 2400,
  trackWaist: false,
  quickFoods: [
    { id: 'egg', label: 'Egg', protein: 6, unit: '1 egg' },
    { id: 'chicken', label: 'Chicken', protein: 27, unit: '100g' },
    { id: 'dal', label: 'Dal', protein: 9, unit: '1 bowl' },
    { id: 'curd', label: 'Curd', protein: 6, unit: '150ml' },
    { id: 'soya', label: 'Soya Chunks', protein: 20, unit: '40g' },
    { id: 'milk', label: 'Milk', protein: 8, unit: '1 glass' }
  ]
};

const DEFAULT_STATE = {
  schemaVersion: 1,
  profile: DEFAULT_PROFILE,
  workoutLogs: {},
  cardioLogs: {},
  stepLogs: {},
  weightLogs: {},
  waistLogs: {},
  nutritionLogs: {},
  meta: {
    lastExportDate: null
  }
};

const loadStateFromStorage = () => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.schemaVersion === 1) {
      return {
        ...DEFAULT_STATE,
        ...parsed,
        profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
        meta: { ...DEFAULT_STATE.meta, ...(parsed.meta || {}) }
      };
    }
  } catch (err) {
    console.warn('Error reading fitness_v2 from localStorage:', err);
  }
  return DEFAULT_STATE;
};

const saveStateToStorage = (state) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Error saving fitness_v2 to localStorage:', err);
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(loadStateFromStorage);

  // Request storage persistence once on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  /**
   * Log or toggle an individual exercise set
   */
  const logSet = useCallback((dateStr, exerciseId, setIndex, setData) => {
    setState(prev => {
      const prevDateLogs = prev.workoutLogs[dateStr] || {};
      const prevExSets = prevDateLogs[exerciseId] || [];
      const updatedSets = [...prevExSets];

      const currentSet = updatedSets[setIndex] || {};
      updatedSets[setIndex] = {
        ...currentSet,
        ...setData
      };

      return {
        ...prev,
        workoutLogs: {
          ...prev.workoutLogs,
          [dateStr]: {
            ...prevDateLogs,
            [exerciseId]: updatedSets
          }
        }
      };
    });
  }, []);

  /**
   * Log cardio activity (e.g. 25 min treadmill)
   */
  const logCardio = useCallback((dateStr, cardioId, data) => {
    setState(prev => {
      const prevDateCardio = prev.cardioLogs[dateStr] || {};
      return {
        ...prev,
        cardioLogs: {
          ...prev.cardioLogs,
          [dateStr]: {
            ...prevDateCardio,
            [cardioId]: {
              ...(prevDateCardio[cardioId] || {}),
              ...data
            }
          }
        }
      };
    });
  }, []);

  /**
   * Log daily steps
   */
  const logSteps = useCallback((dateStr, data) => {
    setState(prev => ({
      ...prev,
      stepLogs: {
        ...prev.stepLogs,
        [dateStr]: {
          ...(prev.stepLogs[dateStr] || {}),
          ...data
        }
      }
    }));
  }, []);

  /**
   * Log morning weight (kg)
   */
  const logWeight = useCallback((dateStr, weightVal) => {
    setState(prev => {
      const updatedWeightLogs = { ...prev.weightLogs };
      if (weightVal === '' || weightVal === null || isNaN(weightVal)) {
        delete updatedWeightLogs[dateStr];
      } else {
        updatedWeightLogs[dateStr] = Number(parseFloat(weightVal).toFixed(2));
      }
      return {
        ...prev,
        weightLogs: updatedWeightLogs
      };
    });
  }, []);

  /**
   * Log weekly waist measurement (cm)
   */
  const logWaist = useCallback((dateStr, waistVal) => {
    setState(prev => {
      const updatedWaistLogs = { ...prev.waistLogs };
      if (waistVal === '' || waistVal === null || isNaN(waistVal)) {
        delete updatedWaistLogs[dateStr];
      } else {
        updatedWaistLogs[dateStr] = Number(parseFloat(waistVal).toFixed(1));
      }
      return {
        ...prev,
        waistLogs: updatedWaistLogs
      };
    });
  }, []);

  /**
   * Log daily nutrition (protein, meals, quick additions, tallies)
   */
  const logNutrition = useCallback((dateStr, updater) => {
    setState(prev => {
      const prevDateNut = prev.nutritionLogs[dateStr] || {};
      const newNutData = typeof updater === 'function' ? updater(prevDateNut) : updater;
      return {
        ...prev,
        nutritionLogs: {
          ...prev.nutritionLogs,
          [dateStr]: {
            ...prevDateNut,
            ...newNutData
          }
        }
      };
    });
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback((newProfile) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...newProfile
      }
    }));
  }, []);

  /**
   * Update metadata
   */
  const updateMeta = useCallback((newMeta) => {
    setState(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        ...newMeta
      }
    }));
  }, []);

  /**
   * Find the most recent logged set for this exercise id strictly prior to beforeDate
   */
  const getLastLoggedSet = useCallback((exerciseId, beforeDate = getLocalDateString()) => {
    const dates = Object.keys(state.workoutLogs)
      .filter(d => d < beforeDate && state.workoutLogs[d]?.[exerciseId])
      .sort((a, b) => b.localeCompare(a)); // Descending order (most recent first)

    if (dates.length === 0) return null;

    const mostRecentDate = dates[0];
    const sets = state.workoutLogs[mostRecentDate][exerciseId] || [];
    // Return sets and summary info
    const completedSets = sets.filter(s => s && (s.completed || s.weight || s.reps));
    if (completedSets.length === 0) return null;

    return {
      date: mostRecentDate,
      sets: completedSets,
      // First completed or heaviest set as quick reference
      bestSet: completedSets.reduce((prev, curr) => {
        const curScore = (parseFloat(curr.weight) || 0) * (parseFloat(curr.reps) || 0);
        const prevScore = (parseFloat(prev?.weight) || 0) * (parseFloat(prev?.reps) || 0);
        return curScore >= prevScore ? curr : prev;
      }, completedSets[0])
    };
  }, [state.workoutLogs]);

  /**
   * Export all data as JSON
   */
  const exportData = useCallback(() => {
    const exportPayload = {
      ...state,
      meta: {
        ...state.meta,
        lastExportDate: getLocalDateString()
      }
    };
    // Update lastExportDate in state
    updateMeta({ lastExportDate: getLocalDateString() });
    return JSON.stringify(exportPayload, null, 2);
  }, [state, updateMeta]);

  /**
   * Import data from JSON with validation
   */
  const importData = useCallback((parsed) => {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON format');
    }
    if (parsed.schemaVersion !== 1) {
      throw new Error('Unsupported schema version. Expected version 1.');
    }
    if (!parsed.profile || typeof parsed.workoutLogs !== 'object') {
      throw new Error('Invalid backup structure: missing core fitness data.');
    }

    const validated = {
      schemaVersion: 1,
      profile: { ...DEFAULT_PROFILE, ...parsed.profile },
      workoutLogs: parsed.workoutLogs || {},
      cardioLogs: parsed.cardioLogs || {},
      stepLogs: parsed.stepLogs || {},
      weightLogs: parsed.weightLogs || {},
      waistLogs: parsed.waistLogs || {},
      nutritionLogs: parsed.nutritionLogs || {},
      meta: { ...DEFAULT_STATE.meta, ...(parsed.meta || {}), lastImportDate: getLocalDateString() }
    };

    setState(validated);
    saveStateToStorage(validated);
    return true;
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      profile: state.profile,
      workoutLogs: state.workoutLogs,
      cardioLogs: state.cardioLogs,
      stepLogs: state.stepLogs,
      weightLogs: state.weightLogs,
      waistLogs: state.waistLogs,
      nutritionLogs: state.nutritionLogs,
      meta: state.meta,
      logSet,
      logCardio,
      logSteps,
      logWeight,
      logWaist,
      logNutrition,
      updateProfile,
      updateMeta,
      getLastLoggedSet,
      exportData,
      importData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
