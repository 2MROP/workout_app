import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext();

// Helper to get the start of the current week (Monday)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

export const AppProvider = ({ children }) => {
  const [completedSets, setCompletedSets] = useLocalStorage('fitness_completed_sets', {});
  const [weekStart, setWeekStart] = useLocalStorage('fitness_week_start', getStartOfWeek(new Date()));

  // Auto-reset logic: Check if we are in a new week
  useEffect(() => {
    const currentWeekStart = getStartOfWeek(new Date());
    if (weekStart !== currentWeekStart) {
      // It's a new week! Reset the completed sets.
      setCompletedSets({});
      setWeekStart(currentWeekStart);
    }
  }, [weekStart, setCompletedSets, setWeekStart]);

  // Toggle a specific set
  const toggleSet = (day, exerciseIndex, setIndex) => {
    setCompletedSets(prev => {
      const dayData = prev[day] || {};
      const exerciseData = dayData[exerciseIndex] || [];
      const newExerciseData = [...exerciseData];
      newExerciseData[setIndex] = !newExerciseData[setIndex];
      
      return {
        ...prev,
        [day]: {
          ...dayData,
          [exerciseIndex]: newExerciseData
        }
      };
    });
  };

  const isExerciseCompleted = (day, exerciseIndex, totalSets) => {
    const dayData = completedSets[day] || {};
    const exerciseData = dayData[exerciseIndex] || [];
    let completedCount = 0;
    for (let i = 0; i < totalSets; i++) {
      if (exerciseData[i]) completedCount++;
    }
    return completedCount === totalSets && totalSets > 0;
  };

  const getDayProgress = (day, exercises) => {
    let completed = 0;
    exercises.forEach((ex, idx) => {});
    return completed;
  };
  
  // Manual override if user wants to reset their week early
  const resetWeek = () => {
    setCompletedSets({});
    setWeekStart(getStartOfWeek(new Date()));
  };

  return (
    <AppContext.Provider value={{
      completedSets,
      toggleSet,
      isExerciseCompleted,
      resetWeek
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
