/**
 * Workout Plan Pro - 3-Day Full Body Split + Walking Program
 * Every exercise has a stable unique string ID.
 */

export const workoutPlan = {
  monday: {
    type: 'workout',
    title: 'Full Body A',
    subtitle: 'Leg Press/Squat, Incline DB, Lat Pulldown, RDL',
    duration: '50 min + 25m cardio',
    cardioTarget: '25 min treadmill',
    cardioTable: [
      { start: 0, end: 3, speed: 4.5, incline: 2 },
      { start: 3, end: 7, speed: 5.0, incline: 7 },
      { start: 7, end: 10, speed: 5.2, incline: 10 },
      { start: 10, end: 13, speed: 5.0, incline: 7 },
      { start: 13, end: 16, speed: 5.2, incline: 10 },
      { start: 16, end: 19, speed: 5.0, incline: 7 },
      { start: 19, end: 22, speed: 5.2, incline: 12 },
      { start: 22, end: 25, speed: 4.2, incline: 2 }
    ],
    exercises: [
      {
        id: 'leg-press-squat',
        name: 'Leg Press / Squat',
        sets: 3,
        reps: '6-10',
        targetMuscles: 'Quads, Glutes'
      },
      {
        id: 'incline-db-press',
        name: 'Incline DB Press',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Upper Chest, Front Delts'
      },
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Lats, Upper Back'
      },
      {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift (RDL)',
        sets: 3,
        reps: '8-10',
        targetMuscles: 'Hamstrings, Glutes'
      },
      {
        id: 'lateral-raise',
        name: 'Lateral Raise',
        sets: 3,
        reps: '12-15',
        targetMuscles: 'Side Delts'
      },
      {
        id: 'hammer-curl',
        name: 'Hammer Curl',
        sets: 2,
        reps: '10-15',
        targetMuscles: 'Brachialis, Biceps'
      },
      {
        id: 'cable-crunch',
        name: 'Cable Crunch',
        sets: 2,
        reps: '10-15',
        targetMuscles: 'Abdominals'
      },
      {
        id: 'treadmill',
        name: 'Treadmill Cardio (25 min)',
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
    subtitle: 'Hack Squat, Flat DB, Row, Leg Curl',
    duration: '50 min + 25m cardio',
    cardioTarget: '25 min treadmill',
    cardioTable: [
      { start: 0, end: 3, speed: 4.5, incline: 2 },
      { start: 3, end: 7, speed: 5.0, incline: 8 },
      { start: 7, end: 10, speed: 5.2, incline: 11 },
      { start: 10, end: 13, speed: 5.0, incline: 8 },
      { start: 13, end: 16, speed: 5.2, incline: 11 },
      { start: 16, end: 19, speed: 5.0, incline: 8 },
      { start: 19, end: 22, speed: 5.2, incline: 12 },
      { start: 22, end: 25, speed: 4.2, incline: 2 }
    ],
    exercises: [
      {
        id: 'hack-squat-leg-press',
        name: 'Hack Squat / Leg Press',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Quads, Glutes'
      },
      {
        id: 'flat-db-press',
        name: 'Flat DB Press',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Chest, Triceps'
      },
      {
        id: 'chest-supported-row',
        name: 'Chest-Supported Row',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Mid Back, Rhomboids, Lats'
      },
      {
        id: 'leg-curl',
        name: 'Leg Curl',
        sets: 3,
        reps: '10-15',
        targetMuscles: 'Hamstrings'
      },
      {
        id: 'overhead-triceps-extension',
        name: 'Overhead Triceps Extension',
        sets: 2,
        reps: '10-15',
        targetMuscles: 'Triceps Long Head'
      },
      {
        id: 'incline-db-curl',
        name: 'Incline DB Curl',
        sets: 2,
        reps: '10-15',
        targetMuscles: 'Biceps'
      },
      {
        id: 'lateral-raise',
        name: 'Lateral Raise',
        sets: 2,
        reps: '12-15',
        targetMuscles: 'Side Delts'
      },
      {
        id: 'plank',
        name: 'Plank',
        sets: 2,
        reps: '30-60s',
        isDuration: true,
        targetMuscles: 'Core Stability'
      },
      {
        id: 'treadmill',
        name: 'Treadmill Cardio (25 min)',
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
    subtitle: 'Squat/Leg Press, RDL, Incline DB, Lat Pulldown',
    duration: '50 min + 25m cardio',
    cardioTarget: '25 min treadmill',
    cardioTable: [
      { start: 0, end: 5, speed: 4.5, incline: 2 },
      { start: 5, end: 10, speed: 5.0, incline: 6 },
      { start: 10, end: 15, speed: 5.0, incline: 8 },
      { start: 15, end: 20, speed: 5.0, incline: 6 },
      { start: 20, end: 22, speed: 5.2, incline: 8 },
      { start: 22, end: 25, speed: 4.2, incline: 2 }
    ],
    exercises: [
      {
        id: 'squat-hack-leg-press',
        name: 'Squat / Hack / Leg Press',
        sets: 3,
        reps: '6-10',
        targetMuscles: 'Quads, Glutes'
      },
      {
        id: 'romanian-deadlift',
        name: 'Romanian Deadlift (RDL)',
        sets: 3,
        reps: '8-10',
        targetMuscles: 'Hamstrings, Glutes'
      },
      {
        id: 'incline-db-press',
        name: 'Incline DB Press',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Upper Chest, Front Delts'
      },
      {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        sets: 3,
        reps: '8-12',
        targetMuscles: 'Lats, Upper Back'
      },
      {
        id: 'rear-delt-fly',
        name: 'Rear Delt Fly',
        sets: 3,
        reps: '12-15',
        targetMuscles: 'Rear Deltoids'
      },
      {
        id: 'calf-raise',
        name: 'Calf Raise',
        sets: 3,
        reps: '10-15',
        targetMuscles: 'Calves'
      },
      {
        id: 'cable-crunch-pallof-press',
        name: 'Cable Crunch / Pallof Press',
        sets: 2,
        reps: '10-15',
        targetMuscles: 'Abdominals, Rotational Stability'
      },
      {
        id: 'treadmill',
        name: 'Treadmill Cardio (25 min)',
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
  'leg-press-squat': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Full_Squat',
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press_On_The_Leg_Press_Machine'
  ],
  'incline-db-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip'
  ],
  'lat-pulldown': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Front_Lat_Pulldown'
  ],
  'romanian-deadlift': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift'
  ],
  'lateral-raise': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Power_Partials'
  ],
  'lateral-raises': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Power_Partials'
  ],
  'hack-squat-leg-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press_On_The_Leg_Press_Machine'
  ],
  'flat-db-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip'
  ],
  'chest-supported-row': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Cable_Rows'
  ],
  'leg-curl': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Ball_Leg_Curl'
  ],
  'incline-db-curl': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Inner_Biceps_Curl'
  ],
  'plank': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plank'
  ],
  'squat-hack-leg-press': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Full_Squat'
  ],
  'calf-raise': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Raises_-_With_Bands'
  ],
  'treadmill': [
    'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Running_Treadmill'
  ]
};
