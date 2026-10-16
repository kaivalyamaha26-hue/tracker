export interface RealHumanPose {
  label: string;
  phase: 'start' | 'mid' | 'peak' | 'finish';
  imageUrl: string;
  cues: string[];
}

export interface PressurePoint {
  id: string;
  name: string;
  type: 'prime-mover' | 'stabilizer' | 'joint-pivot';
  x: number; // percentage 0-100 on visual demonstration
  y: number; // percentage 0-100
  maxTension: number; // peak tension percentage (e.g. 96%)
  role: string;
  cue: string;
}

export interface RealHumanExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  videoUrl?: string;
  heroImage: string;
  startImage: string;
  peakImage: string;
  tempo: string; // e.g. '3-1-1-0'
  pressurePoints?: PressurePoint[];
  formCheckpoints: {
    start: string;
    concentric: string;
    peak: string;
    eccentric: string;
  };
  mistakes: string[];
  safetyTips: string[];
}

const GITHUB_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export const REAL_HUMAN_EXERCISES: Record<string, RealHumanExercise> = {
  'bench press': {
    id: 'ex_bench_press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Olympic Barbell, Flat Bench',
    difficulty: 'Intermediate',
    primaryMuscles: ['Pectoralis Major (Mid & Lower Chest)'],
    secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
    peakImage: `${GITHUB_BASE}Barbell_Bench_Press_-_Medium_Grip/1.jpg`,
    tempo: '3-0-1-0 (3s descent, explosive press)',
    formCheckpoints: {
      start: 'Lie flat, eyes beneath the bar, grip 1.5x shoulder width, retract scapulae firmly into bench.',
      eccentric: 'Inhale and lower bar under strict control toward lower-sternum/nipple line.',
      peak: 'Touch chest gently without bouncing. Elbows tucked at a safe 45° to 60° angle.',
      concentric: 'Exhale and drive heels through floor, pressing bar up and slightly back toward shoulder level.'
    },
    mistakes: ['Bouncing bar off ribs', 'Flaring elbows at 90° angle', 'Lifting hips off bench'],
    safetyTips: ['Never use a suicide (thumbless) grip', 'Always keep wrists directly stacked over forearms']
  },

  'push ups': {
    id: 'ex_push_ups',
    name: 'Push Ups',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    primaryMuscles: ['Pectoralis Major'],
    secondaryMuscles: ['Triceps', 'Anterior Deltoids', 'Core/Rectus Abdominis'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    heroImage: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Pushups/0.jpg`,
    peakImage: `${GITHUB_BASE}Pushups/1.jpg`,
    tempo: '2-1-1-0',
    formCheckpoints: {
      start: 'Hands slightly wider than shoulders, fingers slightly outward, body in rigid straight plank.',
      eccentric: 'Lower whole body as one unit until chest is 2 inches from floor.',
      peak: 'Full depth stretch across pectorals without letting hips sag or pike.',
      concentric: 'Push floor away explosively through palms, maintaining neutral neck alignment.'
    },
    mistakes: ['Sagging lower back and hips', 'Poking head forward', 'Short half-reps'],
    safetyTips: ['Squeeze glutes and brace core to protect lumbar spine']
  },

  'incline bench press': {
    id: 'ex_incline_bench',
    name: 'Incline Dumbbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Incline Bench, Dumbbells',
    difficulty: 'Intermediate',
    primaryMuscles: ['Clavicular Pectoralis (Upper Chest)'],
    secondaryMuscles: ['Front Deltoids', 'Triceps'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Incline_Dumbbell_Press/0.jpg`,
    peakImage: `${GITHUB_BASE}Incline_Dumbbell_Press/1.jpg`,
    tempo: '3-0-1-1',
    formCheckpoints: {
      start: 'Bench inclined at 30° to 45°, dumbbells pressed to arms length over upper chest.',
      eccentric: 'Lower weights smoothly with elbows angled inward at 45°.',
      peak: 'Deep stretch across upper chest at nipple line height.',
      concentric: 'Drive dumbbells upward in natural converge arc without clacking them.'
    },
    mistakes: ['Bench angle set too steep (>45° becomes shoulder press)', 'Arching lower back'],
    safetyTips: ['Kick dumbbells up from knees to protect shoulder rotator cuff']
  },

  'dumbbell fly': {
    id: 'ex_dumbbell_fly',
    name: 'Dumbbell Chest Fly',
    muscleGroup: 'Chest',
    equipment: 'Flat Bench, Dumbbells',
    difficulty: 'Intermediate',
    primaryMuscles: ['Pectoralis Major (Sternal Head)'],
    secondaryMuscles: ['Biceps Long Head (Stabilizer)', 'Anterior Deltoid'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Incline_Dumbbell_Flyes/0.jpg`,
    peakImage: `${GITHUB_BASE}Incline_Dumbbell_Flyes/1.jpg`,
    tempo: '3-1-1-0',
    formCheckpoints: {
      start: 'Arms extended with slight, locked 15° bend in elbows.',
      eccentric: 'Open arms wide in sweeping hugging arc.',
      peak: 'Feel intense stretch across chest at torso depth.',
      concentric: 'Squeeze chest muscles hard to bring dumbbells back together.'
    },
    mistakes: ['Bending elbows into press', 'Overstretching past shoulder flexibility'],
    safetyTips: ['Use moderate weight with strict stretch and squeeze focus']
  },

  'pull ups': {
    id: 'ex_pull_ups',
    name: 'Pull Ups',
    muscleGroup: 'Back',
    equipment: 'Pull-up Bar',
    difficulty: 'Intermediate',
    primaryMuscles: ['Latissimus Dorsi (Lats)'],
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Posterior Deltoids', 'Core'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    heroImage: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Pullups/0.jpg`,
    peakImage: `${GITHUB_BASE}Pullups/1.jpg`,
    tempo: '2-1-1-1',
    formCheckpoints: {
      start: 'Full dead hang, arms fully extended, overhand grip 1.5x shoulder width.',
      eccentric: 'Lower body under complete control for 2 full seconds back to dead hang.',
      peak: 'Pull elbows downward toward hips until chin cleanly clears the bar.',
      concentric: 'Depress shoulder blades first, then pull through back musculature.'
    },
    mistakes: ['Kicking legs or kipping', 'Failing to reach full dead hang at bottom'],
    safetyTips: ['Do not strain neck forward to clear bar; bring chest toward bar']
  },

  'deadlift': {
    id: 'ex_deadlift',
    name: 'Barbell Conventional Deadlift',
    muscleGroup: 'Back',
    equipment: 'Olympic Barbell, Weight Plates',
    difficulty: 'Advanced',
    primaryMuscles: ['Erector Spinae', 'Glutes', 'Hamstrings'],
    secondaryMuscles: ['Latissimus Dorsi', 'Trapezius', 'Forearm Grip', 'Quadriceps'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Barbell_Deadlift/0.jpg`,
    peakImage: `${GITHUB_BASE}Barbell_Deadlift/1.jpg`,
    tempo: '2-0-1-0',
    formCheckpoints: {
      start: 'Bar over mid-foot, shins touching bar, hips hinged back, chest proudly upright.',
      eccentric: 'Hinge at hips first, pushing butt back until bar passes knees, then bend knees.',
      peak: 'Stand tall at lockout with hips fully extended and glutes squeezed. Do NOT lean back.',
      concentric: 'Push the floor away through mid-foot, dragging bar against shins and thighs.'
    },
    mistakes: ['Rounding lower lumbar spine', 'Letting bar drift forward', 'Hyperextending spine at top'],
    safetyTips: ['Take slack out of bar before pulling; brace abdomen with Valsalva maneuver']
  },

  'lat pulldown': {
    id: 'ex_lat_pulldown',
    name: 'Wide-Grip Cable Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Cable Pulldown Station',
    difficulty: 'Beginner',
    primaryMuscles: ['Latissimus Dorsi'],
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Brachialis'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Wide-Grip_Lat_Pulldown/0.jpg`,
    peakImage: `${GITHUB_BASE}Wide-Grip_Lat_Pulldown/1.jpg`,
    tempo: '2-1-1-1',
    formCheckpoints: {
      start: 'Thigh pads snug, arms fully extended overhead with wide overhand grip.',
      eccentric: 'Control cable weight back up to complete stretch with arms fully extended.',
      peak: 'Bar touches upper chest/collarbone with chest lifted toward bar.',
      concentric: 'Drive elbows down and back, squeezing shoulder blades together.'
    },
    mistakes: ['Swinging torso back 45° to momentum weight', 'Pulling bar behind neck'],
    safetyTips: ['Never pull behind the neck to avoid shoulder impingement and cervical spine injury']
  },

  'seated cable row': {
    id: 'ex_seated_row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    equipment: 'Cable Row Machine',
    difficulty: 'Beginner',
    primaryMuscles: ['Rhomboids', 'Middle Trapezius', 'Lats'],
    secondaryMuscles: ['Biceps', 'Erector Spinae'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Seated_Cable_Rows/0.jpg`,
    peakImage: `${GITHUB_BASE}Seated_Cable_Rows/1.jpg`,
    tempo: '2-1-1-1',
    formCheckpoints: {
      start: 'Sit with knees slightly bent, back straight, reaching forward for deep back stretch.',
      eccentric: 'Slowly return handle while keeping torso stable and controlled.',
      peak: 'Handle touches lower abdomen with elbows driven past torso and chest high.',
      concentric: 'Pull handle into navel, driving elbows back and pinching scapulae.'
    },
    mistakes: ['Rocking aggressively back and forth', 'Shrugging shoulders up toward ears'],
    safetyTips: ['Keep slight bend in knees to protect hamstrings and lower back']
  },

  'overhead shoulder press': {
    id: 'ex_shoulder_press',
    name: 'Standing Military Overhead Press',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell or Dumbbells',
    difficulty: 'Intermediate',
    primaryMuscles: ['Anterior & Lateral Deltoids'],
    secondaryMuscles: ['Triceps', 'Upper Traps', 'Core'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    heroImage: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Standing_Military_Press/0.jpg`,
    peakImage: `${GITHUB_BASE}Standing_Military_Press/1.jpg`,
    tempo: '2-0-1-0',
    formCheckpoints: {
      start: 'Bar resting on front clavicles, forearms vertical, glutes and abs clamped tight.',
      eccentric: 'Control bar smoothly down to clavicle height with elbows pointed forward.',
      peak: 'Lock bar out overhead directly in line with ears and heels.',
      concentric: 'Press bar straight up, tilting head back slightly to clear chin, then pushing head forward.'
    },
    mistakes: ['Arching lower back like an incline press', 'Pushing bar forward instead of vertical'],
    safetyTips: ['Keep glutes clenched throughout rep to anchor lumbar spine']
  },

  'lateral raise': {
    id: 'ex_lateral_raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    primaryMuscles: ['Lateral Deltoid (Side Shoulder Width)'],
    secondaryMuscles: ['Anterior Deltoid', 'Trapezius'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Seated_Side_Lateral_Raise/0.jpg`,
    peakImage: `${GITHUB_BASE}Seated_Side_Lateral_Raise/1.jpg`,
    tempo: '2-1-1-0',
    formCheckpoints: {
      start: 'Dumbbells at sides with slight forward lean and slight bend in elbows.',
      eccentric: 'Resist weights down for 2 seconds without letting them swing.',
      peak: 'Arms parallel to ground at shoulder level with pinky slightly higher than thumb.',
      concentric: 'Raise arms out to sides leading with elbows until parallel with floor.'
    },
    mistakes: ['Swinging torso or using momentum', 'Lifting dumbbells higher than shoulder level'],
    safetyTips: ['Keep weights moderate and focus purely on mind-muscle side delt burn']
  },

  'bicep curl': {
    id: 'ex_bicep_curl',
    name: 'Dumbbell Bicep Curl',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    primaryMuscles: ['Biceps Brachii (Short & Long Head)'],
    secondaryMuscles: ['Brachialis', 'Brachioradialis (Forearm)'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Dumbbell_Bicep_Curl/0.jpg`,
    peakImage: `${GITHUB_BASE}Dumbbell_Bicep_Curl/1.jpg`,
    tempo: '3-1-1-0',
    formCheckpoints: {
      start: 'Arms fully extended at sides, elbows pinned next to ribcage.',
      eccentric: 'Lower weights smoothly through full range of motion for 3 full seconds.',
      peak: 'Full contraction with palms turned upward toward ceiling at shoulder height.',
      concentric: 'Curl weights up while supinating wrists (turning palms up) without moving elbows.'
    },
    mistakes: ['Swinging elbows forward or back', 'Using body momentum to swing weights'],
    safetyTips: ['Keep elbows pinned like a hinge; do not allow shoulders to take over']
  },

  'hammer curl': {
    id: 'ex_hammer_curl',
    name: 'Dumbbell Hammer Curl',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    primaryMuscles: ['Brachialis', 'Brachioradialis (Forearm Grip)'],
    secondaryMuscles: ['Biceps Brachii'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    heroImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Alternate_Hammer_Curl/0.jpg`,
    peakImage: `${GITHUB_BASE}Alternate_Hammer_Curl/1.jpg`,
    tempo: '2-1-1-0',
    formCheckpoints: {
      start: 'Dumbbells held with neutral grip (palms facing each other), arms straight.',
      eccentric: 'Lower dumbbell with steady tension back to full extension.',
      peak: 'Forearm touches bicep with thumb facing upward.',
      concentric: 'Curl dumbbells upward maintaining neutral hammer grip.'
    },
    mistakes: ['Rotating wrists into supinated curl', 'Swinging shoulders'],
    safetyTips: ['Builds arm thickness and protects elbow tendons']
  },

  'tricep pushdown': {
    id: 'ex_tricep_pushdown',
    name: 'Cable Triceps Rope Pushdown',
    muscleGroup: 'Triceps',
    equipment: 'Cable Station, Rope Attachment',
    difficulty: 'Beginner',
    primaryMuscles: ['Triceps Lateral & Medial Head'],
    secondaryMuscles: ['Anconeus', 'Forearms'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    heroImage: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Triceps_Pushdown/0.jpg`,
    peakImage: `${GITHUB_BASE}Triceps_Pushdown/1.jpg`,
    tempo: '2-1-1-1',
    formCheckpoints: {
      start: 'Elbows tucked tight against torso, forearms just above 90° angle.',
      eccentric: 'Control cable up until forearms are horizontal, keeping upper arms motionless.',
      peak: 'Lock arms straight down and flare rope ends outward for peak squeeze.',
      concentric: 'Drive hands straight down, fully locking out elbows at bottom.'
    },
    mistakes: ['Letting elbows drift forward and back', 'Leaning weight of whole upper body on rope'],
    safetyTips: ['Keep elbows glued to ribs throughout the movement']
  },

  'overhead tricep extension': {
    id: 'ex_overhead_extension',
    name: 'Standing Overhead Dumbbell Tricep Extension',
    muscleGroup: 'Triceps',
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    primaryMuscles: ['Triceps Long Head'],
    secondaryMuscles: ['Core Stabilizers'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Standing_Dumbbell_Triceps_Extension/0.jpg`,
    peakImage: `${GITHUB_BASE}Standing_Dumbbell_Triceps_Extension/1.jpg`,
    tempo: '3-1-1-0',
    formCheckpoints: {
      start: 'Hold dumbbell overhead with both hands forming a diamond cup under plate.',
      eccentric: 'Lower dumbbell behind head keeping elbows tucked inward toward ears.',
      peak: 'Deep stretch across long head of triceps behind the neck.',
      concentric: 'Extend arms straight up overhead to full lockout.'
    },
    mistakes: ['Flaring elbows wide out to sides', 'Arching lower back'],
    safetyTips: ['Keep upper arms vertical and close to ears']
  },

  'squat': {
    id: 'ex_squats',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    equipment: 'Olympic Barbell, Squat Rack',
    difficulty: 'Advanced',
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Adductors', 'Calves', 'Core/Erectors'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    heroImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Barbell_Squat/0.jpg`,
    peakImage: `${GITHUB_BASE}Barbell_Squat/1.jpg`,
    tempo: '3-1-1-0 (3s descent, pause at parallel, explode up)',
    formCheckpoints: {
      start: 'Feet shoulder-width apart, toes turned 15° to 30° out, bar across upper traps.',
      eccentric: 'Break simultaneously at hips and knees, sitting down between heels.',
      peak: 'Hip crease drops slightly below parallel with top of knees, knees tracking over toes.',
      concentric: 'Drive through full foot, chest leading, extending hips and knees evenly.'
    },
    mistakes: ['Knees caving inward (valgus collapse)', 'Heels lifting off ground', 'Rounding back forward'],
    safetyTips: ['Always use safety pins inside squat rack; maintain constant intra-abdominal pressure']
  },

  'walking lunges': {
    id: 'ex_lunges',
    name: 'Walking Dumbbell Lunges',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells or Bodyweight',
    difficulty: 'Intermediate',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core Balance'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    heroImage: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Bodyweight_Walking_Lunge/0.jpg`,
    peakImage: `${GITHUB_BASE}Bodyweight_Walking_Lunge/1.jpg`,
    tempo: '2-1-1-0',
    formCheckpoints: {
      start: 'Stand tall with feet hip-width, holding dumbbells at sides.',
      eccentric: 'Take generous step forward, lowering trailing knee toward ground.',
      peak: 'Both knees at clean 90° angles; back knee hovering 1 inch from floor.',
      concentric: 'Drive through front heel to step forward into next lunge stride.'
    },
    mistakes: ['Front knee collapsing inward or tracking way past toes', 'Torso leaning forward'],
    safetyTips: ['Keep torso upright with shoulders stacked over hips']
  },

  'leg press': {
    id: 'ex_leg_press',
    name: '45-Degree Leg Press',
    muscleGroup: 'Legs',
    equipment: '45° Incline Leg Press Machine',
    difficulty: 'Beginner',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Adductors'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    heroImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Calf_Press_On_The_Leg_Press_Machine/0.jpg`,
    peakImage: `${GITHUB_BASE}Calf_Press_On_The_Leg_Press_Machine/1.jpg`,
    tempo: '3-1-1-0',
    formCheckpoints: {
      start: 'Back and head flush against pad, feet shoulder-width in center of sled.',
      eccentric: 'Lower sled until knees reach 90° without lower back peeling off pad.',
      peak: 'Deep 90° knee bend with tailbone firmly glued to seat.',
      concentric: 'Press weight up through mid-foot and heels, stopping just short of locking knees.'
    },
    mistakes: ['Hyperextending and locking knees violently', 'Lifting hips off seat pad'],
    safetyTips: ['Never lock knees completely straight under heavy load']
  },

  'crunches': {
    id: 'ex_crunches',
    name: 'Abdominal Floor Crunches',
    muscleGroup: 'Abs',
    equipment: 'Exercise Mat',
    difficulty: 'Beginner',
    primaryMuscles: ['Rectus Abdominis (Upper Abs)'],
    secondaryMuscles: ['Obliques'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    heroImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Crunches/0.jpg`,
    peakImage: `${GITHUB_BASE}Crunches/1.jpg`,
    tempo: '2-1-1-0',
    formCheckpoints: {
      start: 'Lie on back, knees bent, feet flat on floor, fingertips touching temples.',
      eccentric: 'Lower shoulder blades slowly back to mat without resting.',
      peak: 'Shoulder blades lifted 3 inches off floor, abs tightly compressed.',
      concentric: 'Curl ribcage toward pelvis, exhaling all air out of lungs.'
    },
    mistakes: ['Yanking on neck with hands', 'Lifting lower back completely off floor (sit-up)'],
    safetyTips: ['Keep chin tucked like holding an orange under chin']
  },

  'plank': {
    id: 'ex_plank',
    name: 'Forearm Plank',
    muscleGroup: 'Abs',
    equipment: 'Exercise Mat',
    difficulty: 'Beginner',
    primaryMuscles: ['Transverse Abdominis', 'Rectus Abdominis'],
    secondaryMuscles: ['Shoulders', 'Glutes', 'Lower Back'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    heroImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Plank/0.jpg`,
    peakImage: `${GITHUB_BASE}Plank/1.jpg`,
    tempo: 'Isometric Hold (45 - 60 seconds)',
    formCheckpoints: {
      start: 'Forearms on floor under shoulders, elbows 90°, toes tucked.',
      eccentric: 'Maintain unbroken tension without collapsing.',
      peak: 'Rigid straight line from ears through shoulders, hips, knees, and ankles.',
      concentric: 'Actively pull elbows toward toes while squeezing glutes and quads.'
    },
    mistakes: ['Sagging hips', 'Piking hips into tent', 'Looking up and straining neck'],
    safetyTips: ['Keep neck neutral, looking directly at floor between thumbs']
  },

  'mountain climbers': {
    id: 'ex_mountain_climbers',
    name: 'Mountain Climbers',
    muscleGroup: 'Abs',
    equipment: 'Exercise Mat',
    difficulty: 'Intermediate',
    primaryMuscles: ['Core & Hip Flexors'],
    secondaryMuscles: ['Shoulders', 'Quadriceps', 'Cardiovascular System'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    heroImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Mountain_Climbers/0.jpg`,
    peakImage: `${GITHUB_BASE}Mountain_Climbers/1.jpg`,
    tempo: 'Dynamic Quick Rhythm',
    formCheckpoints: {
      start: 'High push-up plank position with hands directly under shoulders.',
      eccentric: 'Quickly return leg back to starting plank.',
      peak: 'Drive one knee up toward chest without raising hips.',
      concentric: 'Rapidly alternate legs like sprinting horizontally.'
    },
    mistakes: ['Bouncing hips up and down', 'Hands drifting forward of shoulders'],
    safetyTips: ['Maintain tight abdominal brace to keep hips low and level']
  },

  'running': {
    id: 'ex_running',
    name: 'Treadmill / Running Sprint',
    muscleGroup: 'Cardio',
    equipment: 'Treadmill or Track',
    difficulty: 'Beginner',
    primaryMuscles: ['Quadriceps', 'Hamstrings', 'Calves', 'Cardiovascular System'],
    secondaryMuscles: ['Glutes', 'Core Stabilizers'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    heroImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Running_Treadmill/0.jpg`,
    peakImage: `${GITHUB_BASE}Running_Treadmill/1.jpg`,
    tempo: 'Interval Cadence',
    formCheckpoints: {
      start: 'Upright posture, relaxed shoulders, eyes forward.',
      eccentric: 'Midfoot landing directly under body center of gravity.',
      peak: 'Powerful leg drive back through glutes and calves.',
      concentric: 'Knee drive forward at 90° with rhythmic arm swing.'
    },
    mistakes: ['Overstriding and heel-striking', 'Slouching shoulders'],
    safetyTips: ['Land softly on mid-foot to protect knee joints']
  },

  'jumping jacks': {
    id: 'ex_jumping_jacks',
    name: 'Jumping Jacks',
    muscleGroup: 'Cardio',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    primaryMuscles: ['Full Body Cardio & Calves'],
    secondaryMuscles: ['Deltoids', 'Glutes', 'Core'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    startImage: `${GITHUB_BASE}Rope_Jumping/0.jpg`,
    peakImage: `${GITHUB_BASE}Rope_Jumping/1.jpg`,
    tempo: 'Brisk Cardio Rhythm',
    formCheckpoints: {
      start: 'Stand straight with feet together, arms at sides.',
      eccentric: 'Jump back to starting stance softly on balls of feet.',
      peak: 'Jump feet out shoulder-width while raising arms overhead until hands touch.',
      concentric: 'Spring off balls of feet with light knees.'
    },
    mistakes: ['Landing flat-footed with locked knees', 'Incomplete arm arc'],
    safetyTips: ['Land softly with slight bend in knees to absorb impact']
  }
};

export function getRealHumanExercise(name: string, muscleGroup?: string): RealHumanExercise {
  const cleanName = (name || '').toLowerCase().trim();
  
  for (const [key, ex] of Object.entries(REAL_HUMAN_EXERCISES)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return ex;
    }
  }

  // Fallback by muscle group
  const mg = (muscleGroup || 'chest').toLowerCase();
  for (const ex of Object.values(REAL_HUMAN_EXERCISES)) {
    if (ex.muscleGroup.toLowerCase() === mg) {
      return ex;
    }
  }

  return REAL_HUMAN_EXERCISES['bench press'];
}

/**
 * Returns biomechanically calculated pressure points and high-tension hotspots
 * for any given exercise. Highlighted in vivid red during active rep execution.
 */
export function getExercisePressurePoints(exercise: RealHumanExercise): PressurePoint[] {
  if (exercise.pressurePoints && exercise.pressurePoints.length > 0) {
    return exercise.pressurePoints;
  }

  const name = exercise.name.toLowerCase();
  const mg = (exercise.muscleGroup || '').toLowerCase();

  // 1. CHEST EXERCISES (Bench Press, Pushups, Flyes)
  if (mg.includes('chest') || name.includes('press') || name.includes('push')) {
    return [
      {
        id: 'chest_core',
        name: 'Pectoralis Major Sternal Head',
        type: 'prime-mover',
        x: 50,
        y: 40,
        maxTension: 96,
        role: 'Maximum horizontal adduction force',
        cue: 'Drive hands inward and squeeze center sternum at peak contraction'
      },
      {
        id: 'chest_left_deltoid',
        name: 'Left Anterior Deltoid Pivot',
        type: 'joint-pivot',
        x: 35,
        y: 36,
        maxTension: 84,
        role: 'Humeral flexion & anterior shoulder torque',
        cue: 'Keep shoulders retracted flat against bench; avoid flaring'
      },
      {
        id: 'chest_right_deltoid',
        name: 'Right Anterior Deltoid Pivot',
        type: 'joint-pivot',
        x: 65,
        y: 36,
        maxTension: 84,
        role: 'Humeral flexion & anterior shoulder torque',
        cue: 'Keep scapulae packed and shoulders depressed'
      },
      {
        id: 'chest_left_tricep',
        name: 'Left Tricep Extension Fulcrum',
        type: 'stabilizer',
        x: 26,
        y: 48,
        maxTension: 78,
        role: 'Elbow extension & bar stabilization',
        cue: 'Tuck elbow at 45° angle to protect rotator cuff'
      },
      {
        id: 'chest_right_tricep',
        name: 'Right Tricep Extension Fulcrum',
        type: 'stabilizer',
        x: 74,
        y: 48,
        maxTension: 78,
        role: 'Elbow extension & bar stabilization',
        cue: 'Stack wrist firmly over forearm; drive through palms'
      }
    ];
  }

  // 2. BACK EXERCISES (Pullups, Rows, Deadlifts, Lat Pulldowns)
  if (mg.includes('back') || name.includes('pull') || name.includes('row') || name.includes('deadlift')) {
    return [
      {
        id: 'back_left_lat',
        name: 'Left Latissimus Dorsi Wing',
        type: 'prime-mover',
        x: 36,
        y: 44,
        maxTension: 95,
        role: 'Shoulder adduction & downward humeral pull',
        cue: 'Drive elbow down and back into pocket to maximize lat squeeze'
      },
      {
        id: 'back_right_lat',
        name: 'Right Latissimus Dorsi Wing',
        type: 'prime-mover',
        x: 64,
        y: 44,
        maxTension: 95,
        role: 'Shoulder adduction & downward humeral pull',
        cue: 'Pull chest tall toward bar; avoid shrugging traps'
      },
      {
        id: 'back_rhomboids',
        name: 'Rhomboid & Mid-Trap Scapular Squeeze',
        type: 'prime-mover',
        x: 50,
        y: 34,
        maxTension: 90,
        role: 'Scapular retraction & upper back isometric lock',
        cue: 'Pinch shoulder blades together like squeezing a coin'
      },
      {
        id: 'back_erectors',
        name: 'Thoracolumbar Erector Spinae Pillar',
        type: 'stabilizer',
        x: 50,
        y: 64,
        maxTension: 88,
        role: 'Spinal extension & anti-flexion shear brace',
        cue: 'Lock core 360° and keep spine strictly neutral'
      }
    ];
  }

  // 3. LEGS EXERCISES (Squats, Lunges, Leg Press)
  if (mg.includes('leg') || name.includes('squat') || name.includes('lunge') || name.includes('quad')) {
    return [
      {
        id: 'leg_left_quad',
        name: 'Left Quadriceps (Rectus Femoris)',
        type: 'prime-mover',
        x: 42,
        y: 58,
        maxTension: 96,
        role: 'Knee extension & eccentric load braking',
        cue: 'Drive knees outward in line with pinky toes'
      },
      {
        id: 'leg_right_quad',
        name: 'Right Quadriceps (Rectus Femoris)',
        type: 'prime-mover',
        x: 58,
        y: 58,
        maxTension: 96,
        role: 'Knee extension & eccentric load braking',
        cue: 'Push floor away through whole foot, balanced mid-foot'
      },
      {
        id: 'leg_left_patella',
        name: 'Left Patellar Tendon Load Pivot',
        type: 'joint-pivot',
        x: 42,
        y: 72,
        maxTension: 82,
        role: 'Quadriceps force transmission & joint fulcrum',
        cue: 'Avoid caving knees inward (valgus collapse)'
      },
      {
        id: 'leg_right_patella',
        name: 'Right Patellar Tendon Load Pivot',
        type: 'joint-pivot',
        x: 58,
        y: 72,
        maxTension: 82,
        role: 'Quadriceps force transmission & joint fulcrum',
        cue: 'Maintain smooth decelerating descent on eccentric phase'
      },
      {
        id: 'leg_glute_drive',
        name: 'Gluteus Maximus Pelvic Drive',
        type: 'prime-mover',
        x: 50,
        y: 47,
        maxTension: 92,
        role: 'Hip extension & explosive ascent thrust',
        cue: 'Squeeze glutes hard at the top lockout'
      }
    ];
  }

  // 4. SHOULDERS EXERCISES (Overhead Press, Lateral Raise)
  if (mg.includes('shoulder') || name.includes('overhead') || name.includes('lateral')) {
    return [
      {
        id: 'sh_left_deltoid',
        name: 'Left Lateral Deltoid Cap',
        type: 'prime-mover',
        x: 32,
        y: 35,
        maxTension: 94,
        role: 'Arm abduction & shoulder width building',
        cue: 'Lead with elbow, not wrists, and pause at horizontal level'
      },
      {
        id: 'sh_right_deltoid',
        name: 'Right Lateral Deltoid Cap',
        type: 'prime-mover',
        x: 68,
        y: 35,
        maxTension: 94,
        role: 'Arm abduction & shoulder width building',
        cue: 'Slight forward tilt in scapular plane (30° forward)'
      },
      {
        id: 'sh_traps_support',
        name: 'Upper Trapezius Scapular Upward Rotator',
        type: 'stabilizer',
        x: 50,
        y: 28,
        maxTension: 80,
        role: 'Scapulohumeral rhythm & overhead lockout support',
        cue: 'Keep neck relaxed and gaze straight forward'
      }
    ];
  }

  // 5. ARMS EXERCISES (Biceps, Triceps)
  if (mg.includes('arm') || name.includes('curl') || name.includes('bicep') || name.includes('tricep')) {
    return [
      {
        id: 'arm_left_bicep',
        name: 'Left Biceps Brachii Peak',
        type: 'prime-mover',
        x: 38,
        y: 46,
        maxTension: 97,
        role: 'Elbow flexion & forearm supination peak squeeze',
        cue: 'Keep elbows pinned to ribs; do not swing torso or shoulders'
      },
      {
        id: 'arm_right_bicep',
        name: 'Right Biceps Brachii Peak',
        type: 'prime-mover',
        x: 62,
        y: 46,
        maxTension: 97,
        role: 'Elbow flexion & forearm supination peak squeeze',
        cue: 'Rotate pinky outward at top for maximum muscular peak'
      },
      {
        id: 'arm_elbow_joint',
        name: 'Elbow Joint Hinge Fulcrum',
        type: 'joint-pivot',
        x: 50,
        y: 56,
        maxTension: 75,
        role: 'Single-axis anatomical hinge pivot',
        cue: 'Avoid hyperextending or bouncing weights at bottom extension'
      }
    ];
  }

  // 6. CORE / CARDIO (Plank, Crunches, Running)
  return [
    {
      id: 'core_rectus',
      name: 'Rectus Abdominis Flexion Core',
      type: 'prime-mover',
      x: 50,
      y: 48,
      maxTension: 95,
      role: 'Pelvis posterior tilt & ribcage-pelvis compression',
      cue: 'Exhale fully and compress ribcage down into belly'
    },
    {
      id: 'core_transverse',
      name: 'Deep Transverse Abdominal Belt',
      type: 'stabilizer',
      x: 50,
      y: 58,
      maxTension: 90,
      role: 'Intra-abdominal pressure & lumbar column protector',
      cue: 'Pull navel into spine and brace like taking a punch'
    }
  ];
}
