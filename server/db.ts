import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  fitnessGoal: string;
  experienceLevel: string;
  availableDays: number;
  equipment: string;
  xp?: number;
  level?: number;
  streak?: number;
  badges?: string[];
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  dailyWaterGoal: number; // ml
  dailyStepGoal: number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
}

export interface Workout {
  id: string;
  userId: string;
  exercise: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number; // mins
  caloriesBurned: number;
  date: string; // YYYY-MM-DD
  notes: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Abs' | 'Cardio';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  instructions: string[];
  benefits: string;
  commonMistakes: string[];
  recommendedSets: string;
  recommendedReps: string;
  restTime: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface ExerciseVideo {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  difficulty: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
}

export interface DayPlanExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface WeeklyWorkoutPlan {
  userId: string;
  schedule: Record<string, { title: string; focus: string; exercises: DayPlanExercise[] }>;
}

export interface WorkoutCompletion {
  id: string;
  userId: string;
  date: string;
  exerciseName: string;
  dayName: string;
  completedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  goalType: 'Weight Gain' | 'Weight Loss' | 'Muscle Building' | 'Fat Loss' | 'Strength' | 'General Fitness';
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
  createdAt: string;
}

export interface NutritionLog {
  id: string;
  userId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  quantity: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  date: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isIndian: boolean;
}

export interface WaterLog {
  id: string;
  userId: string;
  amountMl: number;
  date: string;
  loggedAt: string;
}

export interface StepLog {
  id: string;
  userId: string;
  stepsCount: number;
  date: string;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  chest: number;
  waist: number;
  arms: number;
  thighs: number;
  shoulders: number;
  weight: number;
  date: string;
}

export interface BmiRecord {
  id: string;
  userId: string;
  height: number;
  weight: number;
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obesity';
  date: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'workout' | 'water' | 'meal' | 'steps' | 'goal';
  read: boolean;
  timestamp: string;
}

export interface DatabaseData {
  users: User[];
  profiles: Record<string, UserProfile>;
  workouts: Workout[];
  exercises: Exercise[];
  videos: ExerciseVideo[];
  plans: Record<string, WeeklyWorkoutPlan>;
  completions: WorkoutCompletion[];
  goals: Goal[];
  nutrition: NutritionLog[];
  foods: FoodItem[];
  water: WaterLog[];
  steps: StepLog[];
  measurements: BodyMeasurement[];
  bmiHistory: BmiRecord[];
  notifications: NotificationItem[];
}

// Robust path resolver with fallback to /tmp if current directory is read-only (e.g., Cloud Run containers)
function resolveDatabasePaths(): { dir: string; file: string } {
  const primaryDir = path.resolve(process.cwd(), 'data');
  const primaryFile = path.join(primaryDir, 'fitness_db.json');

  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    // Check write permission
    const testFile = path.join(primaryDir, '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return { dir: primaryDir, file: primaryFile };
  } catch {
    const tmpDir = path.resolve('/tmp', 'fitness_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // Ignored
    }
    return { dir: tmpDir, file: path.join(tmpDir, 'fitness_db.json') };
  }
}

const { dir: DATA_DIR, file: DATA_FILE } = resolveDatabasePaths();

// Simple hash simulation for demonstration (SHA-256 style or base64)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hashed_' + Math.abs(hash).toString(16) + '_' + Buffer.from(password).toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function getInitialData(): DatabaseData {
  const adminId = 'usr_admin_001';
  const demoUserId = 'usr_alex_002';
  const today = new Date().toISOString().split('T')[0];
  
  // Date helpers for historical records
  const getPastDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const exercisesList: Exercise[] = [
    // Chest
    {
      id: 'ex_bench_press',
      name: 'Bench Press',
      muscleGroup: 'Chest',
      difficulty: 'Intermediate',
      equipment: 'Barbell, Bench',
      instructions: [
        'Lie flat on bench with eyes directly under the bar.',
        'Grip bar slightly wider than shoulder-width with wrists straight.',
        'Unrack bar, lower smoothly to mid-chest touching lightly.',
        'Press bar up explosively locking arms without hyperextending elbows.'
      ],
      benefits: 'Builds upper body pushing power, pectoral thickness, and tricep strength.',
      commonMistakes: ['Bouncing bar off sternum', 'Flaring elbows 90 degrees', 'Arching lower back excessively'],
      recommendedSets: '4 sets',
      recommendedReps: '8 - 10 reps',
      restTime: '90 - 120 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_push_ups',
      name: 'Push Ups',
      muscleGroup: 'Chest',
      difficulty: 'Beginner',
      equipment: 'Bodyweight',
      instructions: [
        'Place hands shoulder-width apart on the floor with fingers spread.',
        'Keep core tight, body forming a straight line from neck to heels.',
        'Lower chest until 2 inches above the ground.',
        'Push forcefully back to the starting plank position.'
      ],
      benefits: 'Develops pectoral endurance, shoulder stability, and abdominal core tension.',
      commonMistakes: ['Sagging hips', 'Poking neck forward', 'Partial range of motion'],
      recommendedSets: '3 sets',
      recommendedReps: '15 - 20 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_incline_bench',
      name: 'Incline Bench Press',
      muscleGroup: 'Chest',
      difficulty: 'Intermediate',
      equipment: 'Incline Bench, Dumbbells/Barbell',
      instructions: [
        'Set bench angle to 30 to 45 degrees.',
        'Lower dumbbells with control toward the upper clavicular chest.',
        'Drive weights upward in a smooth arc until nearly touching.'
      ],
      benefits: 'Emphasizes upper chest fibers (clavicular head) and anterior deltoids.',
      commonMistakes: ['Setting bench angle too steep (>45 deg shifts to shoulders)', 'Dropping elbows too low'],
      recommendedSets: '3 - 4 sets',
      recommendedReps: '10 - 12 reps',
      restTime: '90 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_dumbbell_fly',
      name: 'Dumbbell Fly',
      muscleGroup: 'Chest',
      difficulty: 'Intermediate',
      equipment: 'Dumbbells, Flat Bench',
      instructions: [
        'Lie on flat bench holding dumbbells above chest with slight elbow bend.',
        'Open arms out in wide hug motion feeling deep chest stretch.',
        'Contract chest muscles to bring dumbbells back together.'
      ],
      benefits: 'Provides deep pectoral stretch and muscle hypertrophy through tension.',
      commonMistakes: ['Bending elbows into a press', 'Overstretching shoulder capsule'],
      recommendedSets: '3 sets',
      recommendedReps: '12 - 15 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
    },

    // Back
    {
      id: 'ex_pull_ups',
      name: 'Pull Ups',
      muscleGroup: 'Back',
      difficulty: 'Intermediate',
      equipment: 'Pull-up Bar',
      instructions: [
        'Hang with overhand grip slightly wider than shoulder width.',
        'Depress scapulae downward and pull elbows towards ribs.',
        'Pull until chin clears the top of the bar.',
        'Lower with steady control to full dead hang.'
      ],
      benefits: 'Widest back lats, bicep grip endurance, and vertical pulling strength.',
      commonMistakes: ['Kipping or swinging legs', 'Not clearing chin above bar', 'Skipping bottom stretch'],
      recommendedSets: '4 sets',
      recommendedReps: '6 - 10 reps',
      restTime: '90 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_deadlift',
      name: 'Deadlift',
      muscleGroup: 'Back',
      difficulty: 'Advanced',
      equipment: 'Barbell, Weight Plates',
      instructions: [
        'Stand with feet hip-width apart, barbell over mid-foot.',
        'Hinge hips back, grasp bar just outside shins.',
        'Brace core, flatten spine, pull slack out of bar.',
        'Drive through floor, extending hips and knees simultaneously to lockout.'
      ],
      benefits: 'Ultimate posterior chain builder: erector spinae, lats, glutes, and hamstrings.',
      commonMistakes: ['Rounding lumbar spine', 'Bar drifting away from body', 'Hyperextending lower back at top'],
      recommendedSets: '4 sets',
      recommendedReps: '5 - 6 reps',
      restTime: '120 - 180 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_lat_pulldown',
      name: 'Lat Pulldown',
      muscleGroup: 'Back',
      difficulty: 'Beginner',
      equipment: 'Cable Pulldown Machine',
      instructions: [
        'Sit securely with thighs under pads, grip wide angled bar.',
        'Lean back 10 degrees and pull bar down to upper collarbone.',
        'Squeeze lats firmly, then slowly return bar to top position.'
      ],
      benefits: 'Controlled latissimus dorsi activation and upper back broadening.',
      commonMistakes: ['Pulling behind the neck', 'Swinging torso violently for momentum'],
      recommendedSets: '3 - 4 sets',
      recommendedReps: '10 - 12 reps',
      restTime: '60 - 90 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_seated_row',
      name: 'Seated Cable Row',
      muscleGroup: 'Back',
      difficulty: 'Beginner',
      equipment: 'Low Cable Row Machine',
      instructions: [
        'Sit with knees slightly bent, feet on footplates.',
        'Pull handle into lower abdomen while squeezing shoulder blades together.',
        'Extend arms forward maintaining an upright neutral spine.'
      ],
      benefits: 'Thickens middle back (rhomboids, traps) and improves posture.',
      commonMistakes: ['Excessive forward rounding of lumbar spine', 'Shrugging shoulders up to ears'],
      recommendedSets: '3 sets',
      recommendedReps: '10 - 12 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80'
    },

    // Shoulders
    {
      id: 'ex_shoulder_press',
      name: 'Overhead Shoulder Press',
      muscleGroup: 'Shoulders',
      difficulty: 'Intermediate',
      equipment: 'Barbell or Dumbbells',
      instructions: [
        'Hold dumbbells at ear height with palms forward or neutral.',
        'Press weights directly overhead until arms are extended.',
        'Lower slowly under control to ear level.'
      ],
      benefits: 'Builds broad 3D deltoids, clavicular stability, and lockout power.',
      commonMistakes: ['Arching lower back into an incline press', 'Not locking out top'],
      recommendedSets: '4 sets',
      recommendedReps: '8 - 10 reps',
      restTime: '90 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_lateral_raise',
      name: 'Lateral Raise',
      muscleGroup: 'Shoulders',
      difficulty: 'Beginner',
      equipment: 'Dumbbells',
      instructions: [
        'Stand tall holding light dumbbells at sides with slight elbow bend.',
        'Raise arms out to sides until parallel to the floor.',
        'Lead with elbows, pause 1 second at apex, and lower slowly.'
      ],
      benefits: 'Isolates lateral deltoids to create the sought-after V-taper frame.',
      commonMistakes: ['Using heavy weights and swinging hips', 'Raising above parallel putting impingement on joint'],
      recommendedSets: '4 sets',
      recommendedReps: '12 - 15 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80'
    },

    // Biceps
    {
      id: 'ex_bicep_curl',
      name: 'Dumbbell Bicep Curl',
      muscleGroup: 'Biceps',
      difficulty: 'Beginner',
      equipment: 'Dumbbells',
      instructions: [
        'Stand with dumbbells at sides, palms facing inward.',
        'Curl weights upward while supinating wrists (palms up).',
        'Squeeze biceps hard at top without swinging elbows forward.'
      ],
      benefits: 'Increases bicep peak and forearm flexor strength.',
      commonMistakes: ['Swinging torso back and forth', 'Letting elbows flare forward'],
      recommendedSets: '3 - 4 sets',
      recommendedReps: '10 - 12 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_hammer_curl',
      name: 'Hammer Curl',
      muscleGroup: 'Biceps',
      difficulty: 'Beginner',
      equipment: 'Dumbbells',
      instructions: [
        'Hold dumbbells with neutral grip (palms facing each other).',
        'Curl dumbbells up to shoulder height maintaining vertical palms.',
        'Lower smoothly back to starting position.'
      ],
      benefits: 'Targets brachialis and brachioradialis for forearm and arm thickness.',
      commonMistakes: ['Moving upper arms away from sides', 'Rushing eccentric tempo'],
      recommendedSets: '3 sets',
      recommendedReps: '12 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80'
    },

    // Triceps
    {
      id: 'ex_tricep_pushdown',
      name: 'Tricep Pushdown',
      muscleGroup: 'Triceps',
      difficulty: 'Beginner',
      equipment: 'Cable Machine, Rope or Straight Bar',
      instructions: [
        'Attach rope or bar to high cable pulley.',
        'Pin elbows tightly to your sides and push downwards.',
        'Spread rope ends apart at bottom for complete tricep contraction.'
      ],
      benefits: 'Builds lateral and medial tricep heads, making up 60% of upper arm mass.',
      commonMistakes: ['Letting elbows wander back and forth', 'Using body weight to lean over bar'],
      recommendedSets: '4 sets',
      recommendedReps: '12 - 15 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_overhead_extension',
      name: 'Overhead Tricep Extension',
      muscleGroup: 'Triceps',
      difficulty: 'Intermediate',
      equipment: 'Dumbbell or Cable',
      instructions: [
        'Hold dumbbell with both hands overhead with elbows pointing forward.',
        'Lower weight behind head until forearms pass 90 degrees.',
        'Extend elbows back up to full vertical stretch.'
      ],
      benefits: 'Maximizes stretch on long head of triceps for upper arm volume.',
      commonMistakes: ['Flaring elbows sideways', 'Arching lower back'],
      recommendedSets: '3 sets',
      recommendedReps: '10 - 12 reps',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'
    },

    // Legs
    {
      id: 'ex_squats',
      name: 'Barbell Back Squat',
      muscleGroup: 'Legs',
      difficulty: 'Intermediate',
      equipment: 'Barbell, Squat Rack',
      instructions: [
        'Rest bar across upper traps, feet shoulder-width apart, toes turned slightly out.',
        'Brace core, push hips back and knees out in line with toes.',
        'Descend until thighs are parallel or below parallel to floor.',
        'Drive through mid-foot and heel to return upright.'
      ],
      benefits: 'King of leg builders: quadriceps, glutes, adductors, and core power.',
      commonMistakes: ['Knees caving inward (valgus collapse)', 'Rising onto toes', 'Rounding back at bottom'],
      recommendedSets: '4 sets',
      recommendedReps: '8 - 10 reps',
      restTime: '120 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_lunges',
      name: 'Walking Lunges',
      muscleGroup: 'Legs',
      difficulty: 'Beginner',
      equipment: 'Bodyweight or Dumbbells',
      instructions: [
        'Step forward with one foot, lowering hips until both knees bend at 90 degrees.',
        'Keep front knee tracking over ankle and torso upright.',
        'Push through front heel to step directly into the next lunge.'
      ],
      benefits: 'Single-leg strength, balance, glute activation, and hamstring tone.',
      commonMistakes: ['Knee bashing into floor', 'Front knee shooting past toes excessively'],
      recommendedSets: '3 sets',
      recommendedReps: '12 reps each leg',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_leg_press',
      name: 'Leg Press',
      muscleGroup: 'Legs',
      difficulty: 'Beginner',
      equipment: '45-Degree Leg Press Machine',
      instructions: [
        'Sit with back and head firmly against padded support, feet shoulder-width on sled.',
        'Release safety bars, lower sled until knees reach 90 degrees.',
        'Press through whole foot back to start without locking knees.'
      ],
      benefits: 'Heavy quadricep and glute stimulation with zero spinal loading.',
      commonMistakes: ['Locking knees hard at top', 'Lower back peeling off backrest'],
      recommendedSets: '4 sets',
      recommendedReps: '10 - 12 reps',
      restTime: '90 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
    },

    // Abs
    {
      id: 'ex_crunches',
      name: 'Abdominal Crunches',
      muscleGroup: 'Abs',
      difficulty: 'Beginner',
      equipment: 'Mat',
      instructions: [
        'Lie on back with knees bent and feet flat on floor.',
        'Place fingertips behind ears, curl shoulders toward pelvis.',
        'Contract rectus abdominis tightly at peak, lower back down with control.'
      ],
      benefits: 'Strengthens upper abdominal wall and enhances core flexion.',
      commonMistakes: ['Yanking neck with hands', 'Lifting lower back off mat'],
      recommendedSets: '3 sets',
      recommendedReps: '20 reps',
      restTime: '45 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_plank',
      name: 'Forearm Plank',
      muscleGroup: 'Abs',
      difficulty: 'Beginner',
      equipment: 'Mat',
      instructions: [
        'Rest on forearms with elbows directly under shoulders.',
        'Keep body rigid in a straight plank line from shoulders to ankles.',
        'Squeeze glutes, tighten abs, and breathe steadily without dropping pelvis.'
      ],
      benefits: 'Anti-extension core stability and deep transverse abdominis endurance.',
      commonMistakes: ['Sagging hips', 'Piking butt into air', 'Holding breath'],
      recommendedSets: '3 sets',
      recommendedReps: '45 - 60 seconds',
      restTime: '60 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_mountain_climbers',
      name: 'Mountain Climbers',
      muscleGroup: 'Abs',
      difficulty: 'Beginner',
      equipment: 'Mat / Bodyweight',
      instructions: [
        'Start in top push-up plank position.',
        'Drive one knee forward into chest quickly, then switch legs in rhythmic running cadence.',
        'Maintain level hips and tight core throughout.'
      ],
      benefits: 'Dynamic core conditioning, hip flexor endurance, and cardio calorie burn.',
      commonMistakes: ['Bouncing hips wildly', 'Shoulders falling behind hands'],
      recommendedSets: '3 sets',
      recommendedReps: '30 seconds',
      restTime: '45 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'
    },

    // Cardio
    {
      id: 'ex_running',
      name: 'Treadmill / Outdoor Running',
      muscleGroup: 'Cardio',
      difficulty: 'Beginner',
      equipment: 'Running Shoes / Treadmill',
      instructions: [
        'Maintain upright posture with slight forward lean from ankles.',
        'Strike ground lightly with midfoot beneath center of gravity.',
        'Keep arms swinging forward and back at 90 degree bends.'
      ],
      benefits: 'Cardiovascular heart conditioning, high calorie oxidation, and mental stamina.',
      commonMistakes: ['Overstriding onto heel', 'Hunching shoulders', 'Shallow breathing'],
      recommendedSets: '1 session',
      recommendedReps: '20 - 30 mins',
      restTime: 'Active recovery',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ex_jumping_jacks',
      name: 'Jumping Jacks',
      muscleGroup: 'Cardio',
      difficulty: 'Beginner',
      equipment: 'None',
      instructions: [
        'Stand tall with feet together, arms by sides.',
        'Jump feet out while clapping hands overhead.',
        'Immediately jump back to starting position in a quick rhythm.'
      ],
      benefits: 'Full body aerobic warm-up and lymphatic circulation.',
      commonMistakes: ['Landing heavily on flat feet instead of balls of feet'],
      recommendedSets: '3 sets',
      recommendedReps: '45 seconds',
      restTime: '30 sec',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const videosList: ExerciseVideo[] = exercisesList.map((ex, i) => ({
    id: `vid_${ex.id}`,
    exerciseId: ex.id,
    exerciseName: ex.name,
    muscleGroup: ex.muscleGroup,
    difficulty: ex.difficulty,
    title: `${ex.name} - Form & Biomechanics Masterclass`,
    videoUrl: ex.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: ex.thumbnailUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    duration: `${2 + (i % 3)}:${20 + (i * 7) % 35} mins`
  }));

  const indianFoodsList: FoodItem[] = [
    // Breakfast
    { id: 'f_poha', name: 'Poha (flattened rice with veggies & peanuts)', category: 'Breakfast', serving: '1 medium bowl (150g)', calories: 250, protein: 5, carbs: 42, fat: 7, isIndian: true },
    { id: 'f_upma', name: 'Rava Upma with vegetables', category: 'Breakfast', serving: '1 cup (160g)', calories: 220, protein: 6, carbs: 36, fat: 6, isIndian: true },
    { id: 'f_idli', name: 'Steamed Idli with Sambar & Chutney', category: 'Breakfast', serving: '2 pieces + sambar', calories: 180, protein: 7, carbs: 32, fat: 3, isIndian: true },
    { id: 'f_dosa', name: 'Plain Dosa with Chutney', category: 'Breakfast', serving: '1 dosa (100g)', calories: 210, protein: 5, carbs: 33, fat: 6, isIndian: true },
    { id: 'f_eggs', name: 'Boiled Eggs (2 whole)', category: 'Breakfast', serving: '2 large eggs', calories: 156, protein: 13, carbs: 1, fat: 10, isIndian: false },
    { id: 'f_oats', name: 'Oatmeal with Skim Milk & Almonds', category: 'Breakfast', serving: '1 bowl (200g)', calories: 280, protein: 12, carbs: 44, fat: 6, isIndian: false },
    { id: 'f_paratha', name: 'Paneer Paratha (1 pc)', category: 'Breakfast', serving: '1 medium paratha', calories: 290, protein: 11, carbs: 34, fat: 12, isIndian: true },
    { id: 'f_milk', name: 'Toned Cow Milk (1 glass)', category: 'Breakfast', serving: '250 ml', calories: 150, protein: 8, carbs: 12, fat: 7, isIndian: true },

    // Lunch
    { id: 'f_roti', name: 'Whole Wheat Roti / Chapati (2 pcs)', category: 'Lunch', serving: '2 rotis (60g)', calories: 160, protein: 6, carbs: 32, fat: 1.5, isIndian: true },
    { id: 'f_rice', name: 'Steamed Basmati Rice', category: 'Lunch', serving: '1 cup cooked (150g)', calories: 195, protein: 4, carbs: 44, fat: 0.5, isIndian: true },
    { id: 'f_dal', name: 'Yellow Moong / Toor Dal Tadka', category: 'Lunch', serving: '1 katori (150ml)', calories: 150, protein: 9, carbs: 22, fat: 3, isIndian: true },
    { id: 'f_rajma', name: 'Rajma Masala (Kidney Beans)', category: 'Lunch', serving: '1 cup (180g)', calories: 240, protein: 13, carbs: 38, fat: 4, isIndian: true },
    { id: 'f_chole', name: 'Chole Masala (Chickpeas Curry)', category: 'Lunch', serving: '1 cup (180g)', calories: 260, protein: 12, carbs: 40, fat: 6, isIndian: true },
    { id: 'f_paneer_curry', name: 'Low-Fat Paneer Bhurji / Curry', category: 'Lunch', serving: '150g', calories: 280, protein: 18, carbs: 8, fat: 18, isIndian: true },
    { id: 'f_veg_sabzi', name: 'Mixed Vegetable Curry (Gobhi/Matar)', category: 'Lunch', serving: '1 cup (150g)', calories: 120, protein: 4, carbs: 16, fat: 4, isIndian: true },
    { id: 'f_curd', name: 'Fresh Plain Curd / Dahi', category: 'Lunch', serving: '1 katori (150g)', calories: 95, protein: 5, carbs: 6, fat: 4, isIndian: true },
    { id: 'f_salad', name: 'Cucumber & Tomato Kachumber Salad', category: 'Lunch', serving: '1 plate (150g)', calories: 45, protein: 2, carbs: 8, fat: 0.5, isIndian: true },

    // Snacks
    { id: 'f_banana', name: 'Fresh Ripe Banana', category: 'Snacks', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, isIndian: false },
    { id: 'f_apple', name: 'Fresh Green/Red Apple', category: 'Snacks', serving: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, isIndian: false },
    { id: 'f_sprouts', name: 'Sprouted Moong Chaat with lemon', category: 'Snacks', serving: '1 cup (120g)', calories: 130, protein: 9, carbs: 22, fat: 0.8, isIndian: true },
    { id: 'f_peanuts', name: 'Roasted Salted Peanuts', category: 'Snacks', serving: 'Handful (30g)', calories: 170, protein: 7.5, carbs: 5, fat: 14, isIndian: true },
    { id: 'f_roasted_chana', name: 'Bhuna Chana (Roasted Bengal Gram)', category: 'Snacks', serving: '1 small bowl (40g)', calories: 150, protein: 8, carbs: 24, fat: 2, isIndian: true },
    { id: 'f_greek_yogurt', name: 'Greek High-Protein Yogurt', category: 'Snacks', serving: '1 cup (150g)', calories: 110, protein: 15, carbs: 6, fat: 2, isIndian: false },
    { id: 'f_buttermilk', name: 'Chaas (Spiced Masala Buttermilk)', category: 'Snacks', serving: '1 tall glass (250ml)', calories: 50, protein: 3, carbs: 5, fat: 2, isIndian: true },

    // Dinner
    { id: 'f_khichdi', name: 'Dal Khichdi with Ghee', category: 'Dinner', serving: '1 plate (200g)', calories: 260, protein: 8, carbs: 46, fat: 5, isIndian: true },
    { id: 'f_palak_paneer', name: 'Palak Paneer (Spinach Cottage Cheese)', category: 'Dinner', serving: '1 cup (180g)', calories: 240, protein: 14, carbs: 9, fat: 16, isIndian: true },
    { id: 'f_bhindi', name: 'Bhindi Masala (Okra stir fry)', category: 'Dinner', serving: '1 cup (140g)', calories: 110, protein: 3, carbs: 12, fat: 5, isIndian: true },
    { id: 'f_grilled_chicken', name: 'Tandoori / Grilled Chicken Breast', category: 'Dinner', serving: '150g', calories: 220, protein: 35, carbs: 2, fat: 7, isIndian: true }
  ];

  const defaultWeeklyPlan: WeeklyWorkoutPlan = {
    userId: demoUserId,
    schedule: {
      Monday: {
        title: 'Chest & Triceps Hypertrophy',
        focus: 'Chest + Triceps',
        exercises: [
          { id: 'p1', name: 'Push Ups', muscleGroup: 'Chest', sets: 3, reps: '15-20', rest: '60s' },
          { id: 'p2', name: 'Bench Press', muscleGroup: 'Chest', sets: 4, reps: '8-10', rest: '90s' },
          { id: 'p3', name: 'Incline Bench Press', muscleGroup: 'Chest', sets: 3, reps: '10-12', rest: '90s' },
          { id: 'p4', name: 'Tricep Pushdown', muscleGroup: 'Triceps', sets: 4, reps: '12-15', rest: '60s' }
        ]
      },
      Tuesday: {
        title: 'Back & Biceps Power',
        focus: 'Back + Biceps',
        exercises: [
          { id: 'p5', name: 'Pull Ups', muscleGroup: 'Back', sets: 4, reps: '6-8', rest: '90s' },
          { id: 'p6', name: 'Deadlift', muscleGroup: 'Back', sets: 4, reps: '5-6', rest: '120s' },
          { id: 'p7', name: 'Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10-12', rest: '60s' },
          { id: 'p8', name: 'Dumbbell Bicep Curl', muscleGroup: 'Biceps', sets: 3, reps: '10-12', rest: '60s' }
        ]
      },
      Wednesday: {
        title: 'Legs & Core Conditioning',
        focus: 'Legs + Abs',
        exercises: [
          { id: 'p9', name: 'Barbell Back Squat', muscleGroup: 'Legs', sets: 4, reps: '8-10', rest: '120s' },
          { id: 'p10', name: 'Walking Lunges', muscleGroup: 'Legs', sets: 3, reps: '12 / leg', rest: '60s' },
          { id: 'p11', name: 'Forearm Plank', muscleGroup: 'Abs', sets: 3, reps: '60 sec', rest: '45s' },
          { id: 'p12', name: 'Abdominal Crunches', muscleGroup: 'Abs', sets: 3, reps: '20 reps', rest: '45s' }
        ]
      },
      Thursday: {
        title: 'Shoulders & Cardio Burn',
        focus: 'Shoulders + Cardio',
        exercises: [
          { id: 'p13', name: 'Overhead Shoulder Press', muscleGroup: 'Shoulders', sets: 4, reps: '8-10', rest: '90s' },
          { id: 'p14', name: 'Lateral Raise', muscleGroup: 'Shoulders', sets: 4, reps: '12-15', rest: '60s' },
          { id: 'p15', name: 'Mountain Climbers', muscleGroup: 'Abs', sets: 3, reps: '30 sec', rest: '45s' },
          { id: 'p16', name: 'Treadmill / Outdoor Running', muscleGroup: 'Cardio', sets: 1, reps: '20 mins', rest: 'Active' }
        ]
      },
      Friday: {
        title: 'Upper Body Pump',
        focus: 'Chest + Back',
        exercises: [
          { id: 'p17', name: 'Dumbbell Fly', muscleGroup: 'Chest', sets: 3, reps: '12-15', rest: '60s' },
          { id: 'p18', name: 'Seated Cable Row', muscleGroup: 'Back', sets: 4, reps: '10-12', rest: '60s' },
          { id: 'p19', name: 'Push Ups', muscleGroup: 'Chest', sets: 3, reps: 'To failure', rest: '60s' }
        ]
      },
      Saturday: {
        title: 'Full Body & HIIT Cardio',
        focus: 'Full Body + Cardio',
        exercises: [
          { id: 'p20', name: 'Jumping Jacks', muscleGroup: 'Cardio', sets: 3, reps: '45 sec', rest: '30s' },
          { id: 'p21', name: 'Leg Press', muscleGroup: 'Legs', sets: 3, reps: '12 reps', rest: '60s' },
          { id: 'p22', name: 'Hammer Curl', muscleGroup: 'Biceps', sets: 3, reps: '12 reps', rest: '60s' },
          { id: 'p23', name: 'Overhead Tricep Extension', muscleGroup: 'Triceps', sets: 3, reps: '12 reps', rest: '60s' }
        ]
      },
      Sunday: {
        title: 'Active Recovery & Mobility',
        focus: 'Rest / Recovery',
        exercises: [
          { id: 'p24', name: 'Light Outdoor Walk / Foam Rolling', muscleGroup: 'Cardio', sets: 1, reps: '30 mins', rest: 'Low intensity' }
        ]
      }
    }
  };

  return {
    users: [
      {
        id: adminId,
        name: 'Admin Coach',
        email: 'admin@fitness.com',
        phone: '+1 555-0199',
        dob: '1988-04-12',
        gender: 'Male',
        height: 182,
        weight: 80,
        passwordHash: hashPassword('admin123'),
        role: 'ADMIN',
        fitnessGoal: 'Strength',
        experienceLevel: 'Advanced',
        availableDays: 6,
        equipment: 'Gym',
        createdAt: getPastDate(60)
      },
      {
        id: demoUserId,
        name: 'Alex Rivera',
        email: 'alex@fitness.com',
        phone: '+1 555-0144',
        dob: '1996-08-23',
        gender: 'Male',
        height: 178,
        weight: 74,
        passwordHash: hashPassword('user123'),
        role: 'USER',
        fitnessGoal: 'Muscle Building',
        experienceLevel: 'Intermediate',
        availableDays: 5,
        equipment: 'Gym',
        createdAt: getPastDate(30)
      }
    ],
    profiles: {
      [demoUserId]: {
        userId: demoUserId,
        dailyWaterGoal: 3000,
        dailyStepGoal: 10000,
        dailyCalorieGoal: 2400,
        dailyProteinGoal: 140,
        dailyCarbsGoal: 260,
        dailyFatGoal: 65
      },
      [adminId]: {
        userId: adminId,
        dailyWaterGoal: 3500,
        dailyStepGoal: 12000,
        dailyCalorieGoal: 2700,
        dailyProteinGoal: 160,
        dailyCarbsGoal: 280,
        dailyFatGoal: 70
      }
    },
    workouts: [
      {
        id: 'w_1',
        userId: demoUserId,
        exercise: 'Bench Press',
        muscleGroup: 'Chest',
        sets: 4,
        reps: 10,
        weight: 75,
        duration: 25,
        caloriesBurned: 180,
        date: today,
        notes: 'Felt strong, good bar path on top sets.'
      },
      {
        id: 'w_2',
        userId: demoUserId,
        exercise: 'Push Ups',
        muscleGroup: 'Chest',
        sets: 3,
        reps: 20,
        weight: 0,
        duration: 15,
        caloriesBurned: 95,
        date: today,
        notes: 'Explosive lockout on all reps.'
      },
      {
        id: 'w_3',
        userId: demoUserId,
        exercise: 'Pull Ups',
        muscleGroup: 'Back',
        sets: 4,
        reps: 8,
        weight: 0,
        duration: 20,
        caloriesBurned: 140,
        date: getPastDate(1),
        notes: 'Full dead hang stretch each rep.'
      },
      {
        id: 'w_4',
        userId: demoUserId,
        exercise: 'Deadlift',
        muscleGroup: 'Back',
        sets: 4,
        reps: 6,
        weight: 120,
        duration: 30,
        caloriesBurned: 240,
        date: getPastDate(1),
        notes: 'Solid spinal brace, no lower back fatigue.'
      },
      {
        id: 'w_5',
        userId: demoUserId,
        exercise: 'Barbell Back Squat',
        muscleGroup: 'Legs',
        sets: 4,
        reps: 8,
        weight: 95,
        duration: 35,
        caloriesBurned: 260,
        date: getPastDate(2),
        notes: 'Hit depth parallel on every set.'
      },
      {
        id: 'w_6',
        userId: demoUserId,
        exercise: 'Overhead Shoulder Press',
        muscleGroup: 'Shoulders',
        sets: 4,
        reps: 8,
        weight: 50,
        duration: 25,
        caloriesBurned: 160,
        date: getPastDate(3),
        notes: 'Good overhead lockout.'
      },
      {
        id: 'w_7',
        userId: demoUserId,
        exercise: 'Treadmill / Outdoor Running',
        muscleGroup: 'Cardio',
        sets: 1,
        reps: 1,
        weight: 0,
        duration: 25,
        caloriesBurned: 290,
        date: getPastDate(4),
        notes: 'Pace 5:20/km comfortable rhythm.'
      }
    ],
    exercises: exercisesList,
    videos: videosList,
    plans: {
      [demoUserId]: defaultWeeklyPlan
    },
    completions: [
      { id: 'cmp_1', userId: demoUserId, date: today, exerciseName: 'Push Ups', dayName: 'Monday', completedAt: new Date().toISOString() },
      { id: 'cmp_2', userId: demoUserId, date: today, exerciseName: 'Bench Press', dayName: 'Monday', completedAt: new Date().toISOString() }
    ],
    goals: [
      {
        id: 'g_1',
        userId: demoUserId,
        title: 'Reach Lean Body Weight of 78 kg',
        goalType: 'Muscle Building',
        currentValue: 74,
        targetValue: 78,
        unit: 'kg',
        targetDate: getPastDate(-60),
        createdAt: getPastDate(30)
      },
      {
        id: 'g_2',
        userId: demoUserId,
        title: 'Bench Press Bodyweight x 1.25 (95 kg)',
        goalType: 'Strength',
        currentValue: 75,
        targetValue: 95,
        unit: 'kg',
        targetDate: getPastDate(-90),
        createdAt: getPastDate(30)
      },
      {
        id: 'g_3',
        userId: demoUserId,
        title: 'Consistent 10,000 Daily Steps Streak',
        goalType: 'General Fitness',
        currentValue: 8400,
        targetValue: 10000,
        unit: 'steps/day',
        targetDate: getPastDate(-30),
        createdAt: getPastDate(15)
      }
    ],
    nutrition: [
      {
        id: 'nut_1',
        userId: demoUserId,
        foodName: 'Poha with veggies & boiled egg',
        calories: 406,
        protein: 18,
        carbohydrates: 43,
        fat: 17,
        quantity: '1 large bowl + 2 eggs',
        mealType: 'Breakfast',
        date: today
      },
      {
        id: 'nut_2',
        userId: demoUserId,
        foodName: 'Whole Wheat Roti (2) + Dal Tadka + Salad',
        calories: 355,
        protein: 17,
        carbohydrates: 62,
        fat: 5,
        quantity: '2 rotis + 1 bowl dal',
        mealType: 'Lunch',
        date: today
      },
      {
        id: 'nut_3',
        userId: demoUserId,
        foodName: 'Sprouted Moong Chaat + Banana',
        calories: 235,
        protein: 10,
        carbohydrates: 49,
        fat: 1.1,
        quantity: '1 cup sprouts + 1 banana',
        mealType: 'Snacks',
        date: today
      },
      {
        id: 'nut_4',
        userId: demoUserId,
        foodName: 'Steamed Rice + Paneer Curry + Curd',
        calories: 570,
        protein: 27,
        carbohydrates: 58,
        fat: 22.5,
        quantity: '1 cup rice + 150g paneer',
        mealType: 'Dinner',
        date: getPastDate(1)
      }
    ],
    foods: indianFoodsList,
    water: [
      { id: 'wtr_1', userId: demoUserId, amountMl: 500, date: today, loggedAt: '08:30 AM' },
      { id: 'wtr_2', userId: demoUserId, amountMl: 500, date: today, loggedAt: '11:15 AM' },
      { id: 'wtr_3', userId: demoUserId, amountMl: 750, date: today, loggedAt: '02:40 PM' },
      { id: 'wtr_4', userId: demoUserId, amountMl: 500, date: today, loggedAt: '05:10 PM' },
      { id: 'wtr_5', userId: demoUserId, amountMl: 2500, date: getPastDate(1), loggedAt: '09:00 PM' },
      { id: 'wtr_6', userId: demoUserId, amountMl: 3000, date: getPastDate(2), loggedAt: '09:00 PM' }
    ],
    steps: [
      { id: 'stp_today', userId: demoUserId, stepsCount: 6850, date: today },
      { id: 'stp_1', userId: demoUserId, stepsCount: 10420, date: getPastDate(1) },
      { id: 'stp_2', userId: demoUserId, stepsCount: 9340, date: getPastDate(2) },
      { id: 'stp_3', userId: demoUserId, stepsCount: 11200, date: getPastDate(3) },
      { id: 'stp_4', userId: demoUserId, stepsCount: 8900, date: getPastDate(4) },
      { id: 'stp_5', userId: demoUserId, stepsCount: 10150, date: getPastDate(5) },
      { id: 'stp_6', userId: demoUserId, stepsCount: 7600, date: getPastDate(6) }
    ],
    measurements: [
      {
        id: 'ms_1',
        userId: demoUserId,
        chest: 102,
        waist: 81,
        arms: 37,
        thighs: 58,
        shoulders: 118,
        weight: 74,
        date: today
      },
      {
        id: 'ms_2',
        userId: demoUserId,
        chest: 100,
        waist: 83,
        arms: 36,
        thighs: 57,
        shoulders: 116,
        weight: 75.2,
        date: getPastDate(14)
      },
      {
        id: 'ms_3',
        userId: demoUserId,
        chest: 98,
        waist: 85,
        arms: 35,
        thighs: 56,
        shoulders: 114,
        weight: 76.5,
        date: getPastDate(30)
      }
    ],
    bmiHistory: [
      {
        id: 'bmi_1',
        userId: demoUserId,
        height: 178,
        weight: 74,
        bmi: 23.4,
        category: 'Normal',
        date: today
      },
      {
        id: 'bmi_2',
        userId: demoUserId,
        height: 178,
        weight: 75.2,
        bmi: 23.7,
        category: 'Normal',
        date: getPastDate(14)
      },
      {
        id: 'bmi_3',
        userId: demoUserId,
        height: 178,
        weight: 76.5,
        bmi: 24.1,
        category: 'Normal',
        date: getPastDate(30)
      }
    ],
    notifications: [
      {
        id: 'notif_1',
        userId: demoUserId,
        title: 'Afternoon Hydration',
        message: 'You have logged 2,250 ml so far. Only 750 ml left to smash today’s 3 L target!',
        type: 'water',
        read: false,
        timestamp: '15 mins ago'
      },
      {
        id: 'notif_2',
        userId: demoUserId,
        title: 'Workout Plan Ready',
        message: 'Today is Monday: Chest + Triceps. 2 of 4 exercises completed!',
        type: 'workout',
        read: false,
        timestamp: '1 hour ago'
      },
      {
        id: 'notif_3',
        userId: demoUserId,
        title: 'Protein Milestone',
        message: 'Great job reaching 45g of protein by midday. Keep an eye on dinner.',
        type: 'meal',
        read: true,
        timestamp: '3 hours ago'
      }
    ]
  };
}

class FitnessDatabase {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('Could not load database file, initializing default:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseData): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database file:', err);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const target = email.trim().toLowerCase();
    // Check direct match
    const found = this.data.users.find(u => u.email.trim().toLowerCase() === target);
    if (found) return found;

    // Check common aliases
    if (target === 'alex@example.com' || target === 'alex@fitness.com') {
      return this.data.users.find(u => u.id === 'usr_alex_002' || u.email.toLowerCase().includes('alex'));
    }
    if (target === 'admin@fitnesstracker.com' || target === 'admin@fitness.com' || target === 'admin@example.com') {
      return this.data.users.find(u => u.id === 'usr_admin_001' || u.role === 'ADMIN');
    }

    return undefined;
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.data.profiles[user.id] = {
      userId: user.id,
      dailyWaterGoal: 3000,
      dailyStepGoal: 10000,
      dailyCalorieGoal: 2200,
      dailyProteinGoal: 120,
      dailyCarbsGoal: 250,
      dailyFatGoal: 65
    };
    this.saveData();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  deleteUser(id: string): boolean {
    const initLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    delete this.data.profiles[id];
    this.data.workouts = this.data.workouts.filter(w => w.userId !== id);
    this.data.nutrition = this.data.nutrition.filter(n => n.userId !== id);
    this.data.goals = this.data.goals.filter(g => g.userId !== id);
    this.data.water = this.data.water.filter(w => w.userId !== id);
    this.data.steps = this.data.steps.filter(s => s.userId !== id);
    this.data.measurements = this.data.measurements.filter(m => m.userId !== id);
    this.data.bmiHistory = this.data.bmiHistory.filter(b => b.userId !== id);
    this.saveData();
    return this.data.users.length < initLen;
  }

  // Profile
  getProfile(userId: string): UserProfile {
    if (!this.data.profiles[userId]) {
      this.data.profiles[userId] = {
        userId,
        dailyWaterGoal: 3000,
        dailyStepGoal: 10000,
        dailyCalorieGoal: 2200,
        dailyProteinGoal: 120,
        dailyCarbsGoal: 250,
        dailyFatGoal: 65
      };
      this.saveData();
    }
    return this.data.profiles[userId];
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile(userId);
    this.data.profiles[userId] = { ...current, ...updates };
    this.saveData();
    return this.data.profiles[userId];
  }

  // Workouts
  getWorkouts(userId: string): Workout[] {
    return this.data.workouts.filter(w => w.userId === userId);
  }

  getAllWorkouts(): Workout[] {
    return this.data.workouts;
  }

  addWorkout(workout: Workout): Workout {
    this.data.workouts.unshift(workout);
    this.saveData();
    return workout;
  }

  updateWorkout(id: string, updates: Partial<Workout>): Workout | null {
    const idx = this.data.workouts.findIndex(w => w.id === id);
    if (idx === -1) return null;
    this.data.workouts[idx] = { ...this.data.workouts[idx], ...updates };
    this.saveData();
    return this.data.workouts[idx];
  }

  deleteWorkout(id: string): boolean {
    const len = this.data.workouts.length;
    this.data.workouts = this.data.workouts.filter(w => w.id !== id);
    this.saveData();
    return this.data.workouts.length < len;
  }

  // Exercises
  getExercises(): Exercise[] {
    return this.data.exercises;
  }

  addExercise(exercise: Exercise): Exercise {
    this.data.exercises.push(exercise);
    this.saveData();
    return exercise;
  }

  updateExercise(id: string, updates: Partial<Exercise>): Exercise | null {
    const idx = this.data.exercises.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.exercises[idx] = { ...this.data.exercises[idx], ...updates };
    this.saveData();
    return this.data.exercises[idx];
  }

  deleteExercise(id: string): boolean {
    const len = this.data.exercises.length;
    this.data.exercises = this.data.exercises.filter(e => e.id !== id);
    this.data.videos = this.data.videos.filter(v => v.exerciseId !== id);
    this.saveData();
    return this.data.exercises.length < len;
  }

  // Videos
  getVideos(): ExerciseVideo[] {
    return this.data.videos;
  }

  addVideo(video: ExerciseVideo): ExerciseVideo {
    this.data.videos.push(video);
    this.saveData();
    return video;
  }

  updateVideo(id: string, updates: Partial<ExerciseVideo>): ExerciseVideo | null {
    const idx = this.data.videos.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.videos[idx] = { ...this.data.videos[idx], ...updates };
    this.saveData();
    return this.data.videos[idx];
  }

  deleteVideo(id: string): boolean {
    const len = this.data.videos.length;
    this.data.videos = this.data.videos.filter(v => v.id !== id);
    this.saveData();
    return this.data.videos.length < len;
  }

  // Weekly Plan
  getUserPlan(userId: string): WeeklyWorkoutPlan {
    if (!this.data.plans[userId]) {
      // Create user personalized plan
      const user = this.getUserById(userId);
      const initial = getInitialData().plans['usr_alex_002'];
      this.data.plans[userId] = {
        userId,
        schedule: JSON.parse(JSON.stringify(initial.schedule))
      };
      this.saveData();
    }
    return this.data.plans[userId];
  }

  updateUserPlan(userId: string, plan: WeeklyWorkoutPlan): WeeklyWorkoutPlan {
    this.data.plans[userId] = plan;
    this.saveData();
    return plan;
  }

  // Completions
  getCompletions(userId: string, date?: string): WorkoutCompletion[] {
    return this.data.completions.filter(c => c.userId === userId && (!date || c.date === date));
  }

  toggleCompletion(userId: string, date: string, dayName: string, exerciseName: string): boolean {
    const existingIdx = this.data.completions.findIndex(
      c => c.userId === userId && c.date === date && c.dayName === dayName && c.exerciseName === exerciseName
    );
    if (existingIdx >= 0) {
      this.data.completions.splice(existingIdx, 1);
      this.saveData();
      return false; // unmarked
    } else {
      this.data.completions.push({
        id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        date,
        dayName,
        exerciseName,
        completedAt: new Date().toISOString()
      });
      this.saveData();
      return true; // marked complete
    }
  }

  // Gamification & Comprehensive Session Recorder
  getUserGamification(userId: string): {
    xp: number;
    level: number;
    streak: number;
    nextLevelXp: number;
    badges: string[];
  } {
    const user = this.getUserById(userId);
    const userWorkouts = this.getWorkouts(userId);
    
    // Base defaults
    const currentXp = user?.xp ?? Math.max(750, userWorkouts.length * 120);
    const level = Math.max(1, Math.floor(currentXp / 500) + 1);
    const nextLevelXp = level * 500;
    const streak = user?.streak ?? 5;
    const badges = user?.badges ?? ['Consistency Starter', 'Form Master', 'Hydration Hero'];

    return {
      xp: currentXp,
      level,
      streak,
      nextLevelXp,
      badges
    };
  }

  recordWorkoutSession(params: {
    userId: string;
    workoutTitle: string;
    durationMinutes: number;
    caloriesBurned: number;
    exercises: Array<{ name: string; sets: number; reps: number; weight?: number; muscleGroup?: string }>;
  }): {
    workoutsLogged: Workout[];
    xpEarned: number;
    newTotalXp: number;
    level: number;
    streak: number;
    newBadges: string[];
  } {
    const { userId, workoutTitle, durationMinutes, caloriesBurned, exercises } = params;
    const today = new Date().toISOString().split('T')[0];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[new Date().getDay()];

    const workoutsLogged: Workout[] = [];
    const exerciseDuration = Math.max(5, Math.round(durationMinutes / Math.max(1, exercises.length)));
    const exerciseCalories = Math.max(30, Math.round(caloriesBurned / Math.max(1, exercises.length)));

    // 1. Log each completed exercise as individual Workout row
    exercises.forEach(ex => {
      // Look up muscle group
      const exerciseMeta = this.data.exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
      const muscleGroup = ex.muscleGroup || exerciseMeta?.muscleGroup || 'Full Body';

      const w: Workout = {
        id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        exercise: ex.name,
        muscleGroup,
        sets: Number(ex.sets) || 3,
        reps: Number(ex.reps) || 12,
        weight: Number(ex.weight) || 0,
        duration: exerciseDuration,
        caloriesBurned: exerciseCalories,
        date: today,
        notes: `Completed during ${workoutTitle} session.`
      };
      this.data.workouts.unshift(w);
      workoutsLogged.push(w);

      // 2. Mark exercise completed in today's plan
      const existingComp = this.data.completions.find(
        c => c.userId === userId && c.date === today && c.exerciseName === ex.name
      );
      if (!existingComp) {
        this.data.completions.push({
          id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          date: today,
          dayName,
          exerciseName: ex.name,
          completedAt: new Date().toISOString()
        });
      }
    });

    // 3. Update User XP & Gamification
    const user = this.getUserById(userId);
    const prevXp = user?.xp || 800;
    const totalSets = exercises.reduce((sum, e) => sum + (e.sets || 3), 0);
    const xpEarned = totalSets * 50 + 250; // Set completion bonus + session bonus
    const newTotalXp = prevXp + xpEarned;
    const newLevel = Math.floor(newTotalXp / 500) + 1;
    const newStreak = (user?.streak || 4) + 1;

    const existingBadges = user?.badges || ['Consistency Starter', 'Form Master'];
    const newBadges: string[] = [];
    if (newStreak >= 5 && !existingBadges.includes('5-Day Streak Master')) {
      newBadges.push('5-Day Streak Master');
    }
    if (newTotalXp >= 1500 && !existingBadges.includes('Iron Pioneer')) {
      newBadges.push('Iron Pioneer');
    }

    const updatedBadges = Array.from(new Set([...existingBadges, ...newBadges]));

    if (user) {
      user.xp = newTotalXp;
      user.level = newLevel;
      user.streak = newStreak;
      user.badges = updatedBadges;
    }

    // 4. Send celebration Notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId,
      title: 'Workout Completed!',
      message: `You crushed ${workoutTitle}! Logged ${exercises.length} exercises, burned ${caloriesBurned} kcal, and earned +${xpEarned} XP.`,
      type: 'workout',
      read: false,
      timestamp: 'Just now'
    });

    this.saveData();

    return {
      workoutsLogged,
      xpEarned,
      newTotalXp,
      level: newLevel,
      streak: newStreak,
      newBadges
    };
  }

  // Goals
  getGoals(userId: string): Goal[] {
    return this.data.goals.filter(g => g.userId === userId);
  }

  addGoal(goal: Goal): Goal {
    this.data.goals.push(goal);
    this.saveData();
    return goal;
  }

  updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const idx = this.data.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.data.goals[idx] = { ...this.data.goals[idx], ...updates };
    this.saveData();
    return this.data.goals[idx];
  }

  deleteGoal(id: string): boolean {
    const len = this.data.goals.length;
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    this.saveData();
    return this.data.goals.length < len;
  }

  // Nutrition
  getNutrition(userId: string, date?: string): NutritionLog[] {
    return this.data.nutrition.filter(n => n.userId === userId && (!date || n.date === date));
  }

  addNutrition(log: NutritionLog): NutritionLog {
    this.data.nutrition.push(log);
    this.saveData();
    return log;
  }

  updateNutrition(id: string, updates: Partial<NutritionLog>): NutritionLog | null {
    const idx = this.data.nutrition.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.data.nutrition[idx] = { ...this.data.nutrition[idx], ...updates };
    this.saveData();
    return this.data.nutrition[idx];
  }

  deleteNutrition(id: string): boolean {
    const len = this.data.nutrition.length;
    this.data.nutrition = this.data.nutrition.filter(n => n.id !== id);
    this.saveData();
    return this.data.nutrition.length < len;
  }

  // Food Library
  getFoods(): FoodItem[] {
    return this.data.foods;
  }

  addFood(food: FoodItem): FoodItem {
    this.data.foods.push(food);
    this.saveData();
    return food;
  }

  // Water
  getWater(userId: string, date?: string): WaterLog[] {
    return this.data.water.filter(w => w.userId === userId && (!date || w.date === date));
  }

  addWater(log: WaterLog): WaterLog {
    this.data.water.push(log);
    this.saveData();
    return log;
  }

  // Steps
  getSteps(userId: string, date?: string): StepLog[] {
    return this.data.steps.filter(s => s.userId === userId && (!date || s.date === date));
  }

  getAllStepsForUser(userId: string): StepLog[] {
    return this.data.steps.filter(s => s.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
  }

  setSteps(userId: string, date: string, count: number): StepLog {
    const existing = this.data.steps.find(s => s.userId === userId && s.date === date);
    if (existing) {
      existing.stepsCount = count;
      this.saveData();
      return existing;
    } else {
      const newStep: StepLog = {
        id: `stp_${Date.now()}`,
        userId,
        stepsCount: count,
        date
      };
      this.data.steps.push(newStep);
      this.saveData();
      return newStep;
    }
  }

  // Measurements
  getMeasurements(userId: string): BodyMeasurement[] {
    return this.data.measurements
      .filter(m => m.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  addMeasurement(item: BodyMeasurement): BodyMeasurement {
    this.data.measurements.unshift(item);
    this.saveData();
    return item;
  }

  deleteMeasurement(id: string): boolean {
    const len = this.data.measurements.length;
    this.data.measurements = this.data.measurements.filter(m => m.id !== id);
    this.saveData();
    return this.data.measurements.length < len;
  }

  // BMI
  getBmiHistory(userId: string): BmiRecord[] {
    return this.data.bmiHistory
      .filter(b => b.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  addBmiRecord(record: BmiRecord): BmiRecord {
    this.data.bmiHistory.unshift(record);
    // Also update current user height and weight
    this.updateUser(record.userId, {
      height: record.height,
      weight: record.weight
    });
    this.saveData();
    return record;
  }

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  markNotificationRead(id: string): void {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData();
    }
  }

  // Stats for Admin
  getSystemStats() {
    return {
      totalUsers: this.data.users.length,
      totalWorkouts: this.data.workouts.length,
      totalExercises: this.data.exercises.length,
      totalVideos: this.data.videos.length,
      totalMealsLogged: this.data.nutrition.length,
      totalGoals: this.data.goals.length
    };
  }

  getStorageInfo() {
    return {
      filePath: DATA_FILE,
      schemaFile: 'database.sql',
      lastModified: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).mtime.toISOString() : new Date().toISOString(),
      fileSizeBytes: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).size : 0,
      tableCounts: {
        users: this.data.users.length,
        profiles: Object.keys(this.data.profiles).length,
        workouts: this.data.workouts.length,
        exercises: this.data.exercises.length,
        videos: this.data.videos.length,
        plans: Object.keys(this.data.plans).length,
        goals: this.data.goals.length,
        nutrition: this.data.nutrition.length,
        foods: this.data.foods.length,
        water: this.data.water.length,
        steps: this.data.steps.length,
        measurements: this.data.measurements.length,
        bmiHistory: this.data.bmiHistory.length,
        notifications: this.data.notifications.length
      }
    };
  }

  getFullDatabaseSnapshot() {
    const safeUsers = this.data.users.map(({ passwordHash: _, ...rest }) => rest);
    return {
      ...this.data,
      users: safeUsers
    };
  }
}

export const db = new FitnessDatabase();
