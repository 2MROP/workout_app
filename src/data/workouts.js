export const workoutPlan = {
  monday: {
    title: "Upper Push",
    duration: "45 min",
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "6-8" },
      { name: "Incline DB Press", sets: 3, reps: "8-10" },
      { name: "Shoulder Press", sets: 3, reps: "6-8" },
      { name: "Lateral Raises", sets: 3, reps: "12-15" },
      { name: "Triceps Pushdown", sets: 3, reps: "10-12" }
    ]
  },
  tuesday: {
    title: "Lower Body",
    duration: "Long",
    exercises: [
      { name: "Squat", sets: 4, reps: "6-8" },
      { name: "Leg Press", sets: 3, reps: "10-12" },
      { name: "Romanian Deadlift", sets: 3, reps: "8-10" },
      { name: "Leg Curl", sets: 3, reps: "12-15" },
      { name: "Walking Lunges", sets: 2, reps: "12 steps each leg" },
      { name: "Incline Walk", type: "cardio", duration: "15-20 min" }
    ]
  },
  wednesday: {
    title: "Upper Pull",
    duration: "45 min",
    exercises: [
      { name: "Pull-ups / Lat Pulldown", sets: 4, reps: "8-10" },
      { name: "Barbell Row", sets: 3, reps: "8-10" },
      { name: "Seated Row", sets: 3, reps: "10-12" },
      { name: "Face Pull", sets: 3, reps: "12-15" },
      { name: "Biceps Curl", sets: 3, reps: "10-12" }
    ]
  },
  thursday: {
    title: "Push (Volume)",
    duration: "Long",
    exercises: [
      { name: "Incline Bench Press", sets: 4, reps: "8-10" },
      { name: "Flat DB Press", sets: 3, reps: "8-12" },
      { name: "Cable Fly", sets: 3, reps: "12-15" },
      { name: "Shoulder Press", sets: 3, reps: "8-10" },
      { name: "Lateral Raises", sets: 4, reps: "12-15" },
      { name: "Triceps Pushdown", sets: 3, reps: "10-12" }
    ]
  },
  friday: {
    title: "Lower (Power)",
    duration: "45 min",
    exercises: [
      { name: "Deadlift", sets: 3, reps: "4-6" },
      { 
        name: "Leg Extension + Hamstring Curl",
        type: "superset",
        rounds: 3,
        reps: "10-12 each"
      },
      { name: "Calf Raises", sets: 3, reps: "12-15" }
    ]
  },
  saturday: {
    title: "Full Body + Conditioning",
    duration: "Long",
    exercises: [
      { name: "DB Bench Press", sets: 3, reps: "8-10" },
      { name: "Pull-ups", sets: 3, reps: "8-10" },
      { name: "Light Squats", sets: 3, reps: "10-12" },
      { name: "Lateral Raises", sets: 3, reps: "12-15" },
      {
        name: "Conditioning Circuit",
        type: "circuit",
        rounds: "3-4",
        exercises: [
          "Burpees × 10",
          "Kettlebell Swings × 15",
          "Mountain Climbers × 30 sec"
        ]
      },
      { name: "Hanging Leg Raises", sets: 3, reps: "12-15" },
      { name: "Plank", sets: 3, duration: "30-60 sec" },
      { name: "Incline Walk", type: "cardio", duration: "15-20 min" }
    ]
  }
};

export const parseSets = (ex) => {
  if (!ex) return 1;
  if (ex.sets) return parseInt(ex.sets, 10);
  if (ex.rounds) {
    const match = ex.rounds.toString().match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  return 1; // Fallback for cardio/single duration
};

export const exerciseImages = {
  "Barbell Bench Press": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip"],
  "Incline DB Press": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip"],
  "Shoulder Press": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Alternating_Cable_Shoulder_Press"],
  "Lateral Raises": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Power_Partials"],
  "Triceps Pushdown": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Grip_Triceps_Pushdown"],
  "Squat": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Full_Squat"],
  "Leg Press": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press_On_The_Leg_Press_Machine"],
  "Romanian Deadlift": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Romanian_Deadlift"],
  "Leg Curl": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Ball_Leg_Curl"],
  "Walking Lunges": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lunges"],
  "Incline Walk": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Running_Treadmill"],
  "Pull-ups / Lat Pulldown": [
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pullups",
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Front_Lat_Pulldown"
  ],
  "Pull-ups": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pullups"],
  "Lat Pulldown": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Front_Lat_Pulldown"],
  "Barbell Row": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Barbell_Row"],
  "Seated Row": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Cable_Rows"],
  "Face Pull": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Face_Pull"],
  "Biceps Curl": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Inner_Biceps_Curl"],
  "Incline Bench Press": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip"],
  "Flat DB Press": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip"],
  "Cable Fly": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Flat_Bench_Cable_Flyes"],
  "Deadlift": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Axle_Deadlift"],
  "Leg Extension + Hamstring Curl": [
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Extensions",
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Band_Hamstring_Curl"
  ],
  "Calf Raises": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Raises_-_With_Bands"],
  "DB Bench Press": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hammer_Grip_Incline_DB_Bench_Press"],
  "Conditioning Circuit": [
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Mountain_Climbers",
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Kettlebell_Swings"
  ],
  "Hanging Leg Raises": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hanging_Leg_Raise"],
  "Plank": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plank"],
  "Light Squats": ["https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Full_Squat"]
};
