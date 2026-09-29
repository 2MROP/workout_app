import { parseLocalDate, getLocalDateString, getWeekDates, getPreviousMonday } from './dateUtils.js';

export const PROTEIN_SOURCES = [
  'Egg',
  'Chicken',
  'Dal',
  'Curd',
  'Paneer',
  'Soya',
  'Fish',
  'Milk',
  'None'
];

/**
 * Calculates 7-day rolling weight average ending on targetDate.
 * Requires at least 2 entries in that 7-day window, otherwise returns null.
 */
export const calc7DayWeightAvg = (weightLogs = {}, targetDate = getLocalDateString()) => {
  const target = parseLocalDate(targetDate);
  const weights = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(target.getFullYear(), target.getMonth(), target.getDate() - i);
    const dateStr = getLocalDateString(d);
    const val = parseFloat(weightLogs[dateStr]);
    if (!isNaN(val) && val > 0) {
      weights.push(val);
    }
  }

  if (weights.length < 2) return null;
  const sum = weights.reduce((a, b) => a + b, 0);
  return Number((sum / weights.length).toFixed(2));
};

/**
 * Calculates average weight for a specific Monday-Sunday week.
 * Returns { avg, count } or { avg: null, count }
 */
export const calcWeekWeightAvg = (weightLogs = {}, mondayStr) => {
  const dates = getWeekDates(mondayStr);
  const weights = [];

  dates.forEach(dStr => {
    const val = parseFloat(weightLogs[dStr]);
    if (!isNaN(val) && val > 0) {
      weights.push(val);
    }
  });

  if (weights.length < 2) {
    return { avg: null, count: weights.length };
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  return { avg: Number((sum / weights.length).toFixed(2)), count: weights.length };
};

/**
 * A day counts as "protein day hit" if at least 2 of the 4 meal slots used have 1+ protein chip selected.
 */
export const isProteinDayHit = (nutritionLog = {}) => {
  if (!nutritionLog) return false;
  const mealProteins = nutritionLog.mealProteins || {};
  const slots = ['meal1', 'snack', 'meal2', 'breakfast'];
  let slotsWithProtein = 0;

  slots.forEach(slot => {
    const list = mealProteins[slot];
    if (Array.isArray(list)) {
      const hasActualProtein = list.some(p => p && p.toLowerCase() !== 'none');
      if (hasActualProtein) {
        slotsWithProtein++;
      }
    }
  });

  return slotsWithProtein >= 2;
};

/**
 * Calculates the best set volume (weight * reps) for an exercise across dates
 */
export const getBestSetScore = (workoutLogs = {}, exerciseId, dates = []) => {
  let best = 0;
  dates.forEach(dateStr => {
    const dayExLogs = workoutLogs[dateStr]?.[exerciseId] || [];
    dayExLogs.forEach(set => {
      if (set && set.completed) {
        const w = parseFloat(set.weight) || 0;
        const r = parseFloat(set.reps) || 0;
        const score = w * r;
        if (score > best) best = score;
      }
    });
  });
  return best;
};

/**
 * Evaluates weekly review stats & rules for a given Monday-Sunday week
 */
export const evaluateWeeklyReview = (mondayStr, state = {}) => {
  const {
    weightLogs = {},
    waistLogs = {},
    workoutLogs = {},
    cardioLogs = {},
    nutritionLogs = {},
    profile = {}
  } = state;

  const currentWeekDates = getWeekDates(mondayStr);
  const prevMonday = getPreviousMonday(mondayStr);
  const prevWeekDates = getWeekDates(prevMonday);
  const prevPrevMonday = getPreviousMonday(prevMonday);

  // 1. Weight Averages
  const currentWeekWeight = calcWeekWeightAvg(weightLogs, mondayStr);
  const prevWeekWeight = calcWeekWeightAvg(weightLogs, prevMonday);
  const prevPrevWeekWeight = calcWeekWeightAvg(weightLogs, prevPrevMonday);

  let weightChange = null;
  if (currentWeekWeight.avg !== null && prevWeekWeight.avg !== null) {
    weightChange = Number((currentWeekWeight.avg - prevWeekWeight.avg).toFixed(2));
  }

  // 2. Waist Measurements
  let currentWaist = null;
  for (const d of currentWeekDates) {
    if (waistLogs[d]) currentWaist = parseFloat(waistLogs[d]);
  }
  let prevWaist = null;
  for (const d of prevWeekDates) {
    if (waistLogs[d]) prevWaist = parseFloat(waistLogs[d]);
  }
  let waistChange = null;
  if (currentWaist !== null && prevWaist !== null) {
    waistChange = Number((currentWaist - prevWaist).toFixed(1));
  }

  // 3. Workouts Done (Mon, Wed, Fri = Full Body A, B, C)
  const scheduledWorkoutDays = [currentWeekDates[0], currentWeekDates[2], currentWeekDates[4]];
  let workoutsDone = 0;
  scheduledWorkoutDays.forEach(dateStr => {
    const dayLogs = workoutLogs[dateStr];
    if (dayLogs && Object.keys(dayLogs).length > 0) {
      const hasCompleted = Object.values(dayLogs).some(sets =>
        Array.isArray(sets) && sets.some(s => s?.completed)
      );
      if (hasCompleted) workoutsDone++;
    }
  });

  // 4. Cardio Done (Treadmill 25 min on workout days)
  let cardioDone = 0;
  scheduledWorkoutDays.forEach(dateStr => {
    if (cardioLogs[dateStr]?.treadmill?.completed) {
      cardioDone++;
    }
  });

  // 5. Protein Target Days (At least 2 meal slots with protein chips)
  let proteinDaysHit = 0;
  let restaurantMeals = 0;
  let sugaryDrinks = 0;

  currentWeekDates.forEach(dateStr => {
    const nut = nutritionLogs[dateStr] || {};
    if (isProteinDayHit(nut)) {
      proteinDaysHit++;
    }
    restaurantMeals += parseInt(nut.restaurantCount, 10) || 0;
    sugaryDrinks += parseInt(nut.sugaryDrinkCount, 10) || 0;
  });

  // 6. Strength Comparison on Compound Lifts
  const compoundIds = [
    'bench-press',
    'squat',
    'deadlift',
    'barbell-row',
    'leg-press-squat',
    'incline-db-press',
    'lat-pulldown',
    'romanian-deadlift',
    'hack-squat-leg-press',
    'flat-db-press',
    'chest-supported-row',
    'squat-hack-leg-press'
  ];
  let compoundStrengthDippedCount = 0;
  compoundIds.forEach(id => {
    const curBest = getBestSetScore(workoutLogs, id, currentWeekDates);
    const prevBest = getBestSetScore(workoutLogs, id, prevWeekDates);
    if (prevBest > 0 && curBest > 0 && curBest < prevBest) {
      compoundStrengthDippedCount++;
    }
  });

  // 7. Minimum Week Mode Check
  // 2 workouts + hitting protein on >= 4 of 7 days
  const isMinimumAchieved = (workoutsDone >= 2 && proteinDaysHit >= 4);

  // 8. Rule Recommendation Logic (Select exactly one recommendation)
  let recommendation = {
    type: 'baseline',
    badge: 'Baseline Building',
    title: 'Building your baseline',
    message: 'Collect at least 2 weeks of consistent weight logs before making adjustments. Stay consistent with the plan!',
    calorieNote: null
  };

  if (currentWeekWeight.avg === null || prevWeekWeight.avg === null) {
    recommendation = {
      type: 'insufficient_data',
      badge: 'Need More Data',
      title: 'Building your baseline. No changes yet.',
      message: 'Log your morning weight on 3-4 days each week to see accurate 7-day trends and guidance.',
      calorieNote: null
    };
  } else {
    // We have at least 2 consecutive weeks of averages
    const wChange = weightChange;

    // Check for rapid loss (> 0.8 kg lost, i.e. <= -0.8) or strength dipping on 2+ compound lifts
    if (wChange <= -0.8 || compoundStrengthDippedCount >= 2) {
      recommendation = {
        type: 'loss_too_fast',
        badge: 'Rate Warning',
        title: 'Losing fast or strength dipping',
        message: 'Your weight is dropping faster than 0.8 kg/week or performance dipped on compound lifts. To protect lean muscle, consider adding about 150–200 kcal.',
        calorieNote: '+150 to 200 kcal (e.g. extra rice portion or protein source)'
      };
    } else if (wChange <= -0.3 && wChange >= -0.7) {
      // Ideal rate: -0.3 to -0.7 kg/week
      recommendation = {
        type: 'on_track',
        badge: 'Sweet Spot',
        title: 'On track. Keep the plan unchanged.',
        message: 'Your fat loss pace (-0.3 to -0.7 kg/week) is optimal for steady progress while preserving strength. Keep executing!',
        calorieNote: 'Maintain current intake (~2,400 kcal guide)'
      };
    } else if (currentWaist !== null && prevWaist !== null && Math.abs(wChange) <= 0.2 && waistChange !== null && waistChange < 0) {
      // Recomposition: flat weight but waist is decreasing (only when waist data exists)
      recommendation = {
        type: 'recomposition',
        badge: 'Body Recomposition',
        title: 'Likely recomposition. Keep going.',
        message: 'Scale weight stayed relatively flat, but your waist measurement decreased! This indicates fat loss coupled with water/muscle retention. Keep going.',
        calorieNote: 'No calorie change needed'
      };
    } else if (
      prevPrevWeekWeight.avg !== null &&
      Math.abs(wChange) <= 0.3 &&
      Math.abs(prevWeekWeight.avg - prevPrevWeekWeight.avg) <= 0.3
    ) {
      // Flat for 2 consecutive weeks (3 weeks of data)
      recommendation = {
        type: 'plateau',
        badge: 'Plateau Assessment',
        title: 'Weight flat for 2 weeks',
        message: 'Weight has fluctuated within ±0.3 kg for 2 full weeks. First check: have portions grown, or have steps dropped? If adherence is solid, suggest ONE small change: reduce about 150–200 kcal OR add about 1,500 daily steps.',
        calorieNote: 'Suggest reducing ~150-200 kcal (never below 2,000 kcal) OR +1,500 steps/day',
        checklist: [
          'Portions larger than usual recently?',
          'More restaurant/takeout meals than planned?',
          'Missed scheduled walking/steps?',
          'Missed full-body workout sessions?'
        ]
      };
    } else if (wChange > 0.3) {
      recommendation = {
        type: 'weight_up',
        badge: 'Fluctuation Check',
        title: 'Slight scale bump',
        message: 'Weight trend showed a slight increase. This is often temporary water retention, higher sodium/carbs, or training inflammation. Re-check consistency next week before changing calories.',
        calorieNote: 'Keep current plan unchanged'
      };
    } else {
      recommendation = {
        type: 'steady',
        badge: 'Steady Adherence',
        title: 'Steady pace',
        message: 'Progress is within acceptable weekly variation. Keep hitting your protein-rich meals and 7k-10k daily step targets.',
        calorieNote: 'Maintain plan'
      };
    }
  }

  return {
    mondayStr,
    currentWeekWeight,
    prevWeekWeight,
    weightChange,
    currentWaist,
    prevWaist,
    waistChange,
    workoutsDone,
    cardioDone,
    proteinDaysHit,
    restaurantMeals,
    sugaryDrinks,
    compoundStrengthDippedCount,
    isMinimumAchieved,
    recommendation
  };
};
