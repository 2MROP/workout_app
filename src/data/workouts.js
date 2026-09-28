/**
 * Workout Plan Pro - 3-Day Full Body Split + Walking Program
 * Every exercise has a stable unique string ID.
 */

export const workoutPlan = {
  monday: {
    type: 'workout',
    title: 'Full Body A',
    subtitle: 'Compound Push / Legs / Upper Pull',
    duration: '50 min + 25m cardio',
    cardioTarget: '25 min treadmill',
    exercises: [
      {
        id: 'bench-press',
        name: 'Barbell Bench Press',
        sets: 4,
        reps: '6-8',
        targetMuscles: 'Chest, Triceps, Front Delts'
      },
      {
        id: 'squat',
        name: 'Squat',
        sets: 4,
        reps: '6-8',
        targetMuscles: 'Quads, Glutes, Core'
      },
      {
        id: 'pull-ups-lat-pulldown',
        name: 'Pull-ups / Lat Pulldown',
        sets: 4,
        reps: '8-10',
        targetMuscles: 'Lats, Upper Back, Biceps'
      },
      {
        id: 'lateral-raises',
        name: 'Lateral Raises',
        sets: 3,
        reps: '12-15',
        targetMuscles: 'Lateral Deltoids'
      },
      {
        id: 'triceps-pushdown',
        name: 'Triceps Pushdown',
        sets: 3,
        reps: '10-12',
        targetMuscles: 'Triceps'
      },
      {
        id: 'treadmill',
        name: 'Treadmill Incline Walk / Jog',
        type: 'cardio',
        duration: '25 min',
        targetMuscles: 'Cardiovascular'
      }
    ]
  },

  tuesday: {
    type: 'walking',
    title: 'Walking Day',
    subtitle: 'Active Recovery & Step Target',
    duration: 'Throughout day',
    targetSteps: '7,000 - 10,000 steps',
    exercises: []
  },

  wednesday: {
    type: 'workout',
    title: 'Full Body B',
    subtitle: 'Incline Press / Posterior Chain / Row',
    duration: '50 min + 25m cardio',
    cardioTarget: '25 min treadmill',
    exercises: [
      {
        id: 'incline-db-press',
        name: 'Incline DB Press',
        sets: 4,
        reps: '8-10',
        targetMuscles: 'Upper Chest, Anterior Delts'
      },
      {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift (RDL)',
        sets: 3,
        reps: '8-10',
        targetMuscles: 'Hamstrings, Glutes, Lower Back'
      },
      {
        id: 'barbell-row',
        name: 'Barbell Row',
        sets: 3,
        reps: '8-10',
        targetMuscles: 'Lats, Rhomboids, Mid Back'
      },
      {
        id: 'shoulder-press',
        name: 'Shoulder Press',
        sets: 3,
        reps: '6-8',
        targetMuscles: 'Deltoids, Upper Chest'
      },
      {
        id: 'biceps-curl',
        name: 'Biceps Curl',
        sets: 3,
        reps: '10-12',
        targetMuscles: 'Biceps Brachii'
      },
      {
        id: 'treadmill',
        name: 'Treadmill Incline Walk / Jog',
        type: 'cardio',
        duration: '25 min',
        targetMuscles: 'Cardiovascular'
      }
    ]
  },

  thursday: {
    type: 'walking',
    title: 'Walking Day',
    subtitle: 'Active Recovery & Step Target',
    duration: 'Throughout day',
    targetSteps: '7,000 - 10,000 steps',
    exercises: []
  },

  friday: {
    type: 'workout',
    title: 'Full Body C',
    subtitle: 'Deadlift / Chest / Legs / Rear Delts & Core',
    duration: '50 min + 25m cardio',
    cardioTarget: '25 min treadmill',
    exercises: [
      {
        id: 'deadlift',
        name: 'Deadlift',
        sets: 3,
        reps: '4-6',
        note: 'Stop 1-2 reps before failure. Keep form strict.',
        targetMuscles: 'Posterior Chain, Glutes, Back'
      },
      {
        id: 'flat-db-press',
        name: 'Flat DB Press',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Pectorals, Triceps'
      },
      {
        id: 'leg-press',
        name: 'Leg Press',
        sets: 3,
        reps: '10-12',
        targetMuscles: 'Quads, Glutes'
      },
      {
        id: 'face-pull',
        name: 'Face Pull',
        sets: 3,
        reps: '12-15',
        targetMuscles: 'Rear Delts, Rotator Cuff'
      },
      {
        id: 'hanging-leg-raises-plank',
        name: 'Hanging Leg Raises / Plank',
        sets: 3,
        reps: '12-15',
        targetMuscles: 'Abdominals, Core Stability'
      },
      {
        id: 'treadmill',
        name: 'Treadmill Incline Walk / Jog',
        type: 'cardio',
        duration: '25 min',
        targetMuscles: 'Cardiovascular'
      }
    ]
  },

  saturday: {
    type: 'walking',
    title: 'Walking Day',
    subtitle: 'Weekend Step Target & Recovery',
    duration: 'Throughout day',
    targetSteps: '7,000 - 10,000 steps',
    exercises: []
  },

  sunday: {
    type: 'walking',
    title: 'Recovery Walking Day',
    subtitle: 'Normal Easy Walking & Reset',
    duration: 'Throughout day',
    targetSteps: '7,000 - 10,000 steps',
    exercises: []
  }
};

export const parseSets = (ex) => {
  if (!ex) return 1;
  if (ex.sets) return parseInt(ex.sets, 10);
  if (ex.rounds) {
    const match = ex.rounds.toString().match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  return 1;
};

export const exerciseImages = {
  'bench-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip'
  ],
  'squat': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Full_Squat'
  ],
  'pull-ups-lat-pulldown': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pullups',
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Front_Lat_Pulldown'
  ],
  'lateral-raises': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Power_Partials'
  ],
  'triceps-pushdown': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Grip_Triceps_Pushdown'
  ],
  'incline-db-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip'
  ],
  'romanian-deadlift': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift'
  ],
  'barbell-row': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Barbell_Row'
  ],
  'shoulder-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Cable_Shoulder_Press'
  ],
  'biceps-curl': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Inner_Biceps_Curl'
  ],
  'deadlift': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Axle_Deadlift'
  ],
  'flat-db-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip'
  ],
  'leg-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press_On_The_Leg_Press_Machine'
  ],
  'face-pull': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Face_Pull'
  ],
  'hanging-leg-raises-plank': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hanging_Leg_Raise',
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plank'
  ],
  'treadmill': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Running_Treadmill'
  ]
};
