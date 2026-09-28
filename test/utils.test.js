import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getLocalDateString,
  getMondayOfWeek,
  getWeekDates,
  getPreviousMonday
} from '../src/utils/dateUtils.js';

import {
  calc7DayWeightAvg,
  calcWeekWeightAvg,
  calcTotalProtein,
  evaluateWeeklyReview
} from '../src/utils/calcUtils.js';

test('dateUtils: local date formatting without UTC drift', () => {
  const d = new Date(2026, 2, 15); // March 15, 2026
  const str = getLocalDateString(d);
  assert.equal(str, '2026-03-15');
});

test('dateUtils: getMondayOfWeek accurately calculates Monday for any weekday', () => {
  // 2026-03-18 is Wednesday -> Monday is 2026-03-16
  assert.equal(getMondayOfWeek('2026-03-18'), '2026-03-16');
  // 2026-03-22 is Sunday -> Monday is 2026-03-16
  assert.equal(getMondayOfWeek('2026-03-22'), '2026-03-16');
  // 2026-03-16 is Monday -> Monday is 2026-03-16
  assert.equal(getMondayOfWeek('2026-03-16'), '2026-03-16');
});

test('dateUtils: getWeekDates returns 7 dates Mon to Sun', () => {
  const dates = getWeekDates('2026-03-16');
  assert.equal(dates.length, 7);
  assert.equal(dates[0], '2026-03-16'); // Mon
  assert.equal(dates[6], '2026-03-22'); // Sun
});

test('calcUtils: calc7DayWeightAvg requires >= 2 entries in 7-day window', () => {
  const logs1 = { '2026-03-18': 98.0 };
  assert.equal(calc7DayWeightAvg(logs1, '2026-03-18'), null);

  const logs2 = {
    '2026-03-15': 98.2,
    '2026-03-17': 97.8
  };
  assert.equal(calc7DayWeightAvg(logs2, '2026-03-18'), 98.0);
});

test('calcUtils: calcTotalProtein sums manual and quick additions', () => {
  const nut = {
    proteinGrams: '40',
    quickEntries: [
      { id: '1', label: 'Chicken', protein: 27 },
      { id: '2', label: 'Egg', protein: 6 }
    ]
  };
  assert.equal(calcTotalProtein(nut), 73);
});

test('calcUtils: evaluateWeeklyReview triggers sweet spot rule', () => {
  const state = {
    weightLogs: {
      // Prev week (2026-03-09 to 2026-03-15) avg = 98.0
      '2026-03-10': 98.2,
      '2026-03-13': 97.8,
      // Current week (2026-03-16 to 2026-03-22) avg = 97.5 (loss of 0.5 kg)
      '2026-03-17': 97.6,
      '2026-03-20': 97.4
    },
    waistLogs: {
      '2026-03-15': 96,
      '2026-03-22': 95.5
    },
    workoutLogs: {
      '2026-03-16': { 'bench-press': [{ completed: true, weight: 70, reps: 8 }] },
      '2026-03-18': { 'incline-db-press': [{ completed: true, weight: 26, reps: 10 }] },
      '2026-03-20': { 'deadlift': [{ completed: true, weight: 110, reps: 5 }] }
    },
    cardioLogs: {
      '2026-03-16': { treadmill: { completed: true, minutes: 25 } },
      '2026-03-18': { treadmill: { completed: true, minutes: 25 } },
      '2026-03-20': { treadmill: { completed: true, minutes: 25 } }
    },
    nutritionLogs: {
      '2026-03-16': { proteinGrams: 140 },
      '2026-03-17': { proteinGrams: 135 },
      '2026-03-18': { proteinGrams: 140 },
      '2026-03-19': { proteinGrams: 130 },
      '2026-03-20': { proteinGrams: 140 },
      '2026-03-21': { proteinGrams: 125 },
      '2026-03-22': { proteinGrams: 140 }
    },
    profile: { proteinMin: 130 }
  };

  const review = evaluateWeeklyReview('2026-03-16', state);
  assert.equal(review.workoutsDone, 3);
  assert.equal(review.cardioDone, 3);
  assert.equal(review.proteinDaysHit, 6);
  assert.equal(review.weightChange, -0.5);
  assert.equal(review.recommendation.type, 'on_track');
});

test('calcUtils: Minimum-week mode marks on track with 2 workouts and 4 protein days', () => {
  const state = {
    weightLogs: {},
    workoutLogs: {
      '2026-03-16': { 'bench-press': [{ completed: true }] },
      '2026-03-18': { 'incline-db-press': [{ completed: true }] }
    },
    nutritionLogs: {
      '2026-03-16': { proteinGrams: 140 },
      '2026-03-17': { proteinGrams: 140 },
      '2026-03-18': { proteinGrams: 140 },
      '2026-03-19': { proteinGrams: 140 }
    },
    profile: { proteinMin: 130 }
  };

  const review = evaluateWeeklyReview('2026-03-16', state);
  assert.equal(review.workoutsDone, 2);
  assert.equal(review.proteinDaysHit, 4);
  assert.equal(review.isMinimumAchieved, true);
});
