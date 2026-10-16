export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  currentWeight?: number;
  targetWeight?: number;
  role: 'USER' | 'ADMIN' | 'user' | 'admin';
  fitnessGoal?: string;
  primaryGoal?: string;
  experienceLevel?: string;
  availableDays?: number;
  equipment?: string;
  activityLevel?: string;
  stepGoal?: number;
  waterGoal?: number;
  calorieGoal?: number;
  xp?: number;
  level?: number;
  streak?: number;
  badges?: string[];
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  dailyWaterGoal: number;
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
  duration: number;
  caloriesBurned: number;
  date: string;
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
  safetyTips?: string[];
  targetMuscles?: { primary: string[]; secondary: string[] };
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface ExerciseVideo {
  id: string;
  exerciseId?: string;
  exerciseName?: string;
  title: string;
  videoUrl?: string;
  youtubeId?: string;
  thumbnailUrl: string;
  duration: string;
  muscleGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  category?: string;
  description?: string;
  instructions?: string[];
}

export interface DayPlanExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: string;
  completed?: boolean;
}

export interface WeeklyWorkoutPlan {
  userId: string;
  schedule: Record<string, { title: string; focus: string; exercises: DayPlanExercise[] }>;
}

export interface WorkoutCompletion {
  id: string;
  userId: string;
  date: string;
  dayName: string;
  exerciseName: string;
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

export interface DashboardStats {
  currentWeight: number;
  height: number;
  bmi: number;
  bmiCategory: string;
  fitnessGoal: string;
  weeklyWorkoutCount: number;
  workoutDuration: number;
  calories: {
    current: number;
    target: number;
    protein: number;
    proteinTarget: number;
    carbs: number;
    carbsTarget: number;
    fat: number;
    fatTarget: number;
  };
  water: {
    currentMl: number;
    targetMl: number;
    percent: number;
  };
  steps: {
    current: number;
    target: number;
    percent: number;
  };
  todayPlan: {
    dayName: string;
    title: string;
    focus: string;
    exercises: DayPlanExercise[];
  };
  overallDailyProgress: number;
  goalsCount: number;
  notifications: NotificationItem[];
  gamification?: {
    xp: number;
    level: number;
    streak: number;
    nextLevelXp: number;
    badges: string[];
  };
}

export interface WorkoutSessionSummary {
  workoutTitle: string;
  exercisesCompleted: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  durationSeconds: number;
  caloriesBurned: number;
  xpEarned: number;
  currentStreak: number;
  newBadges?: string[];
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    completed: boolean;
  }>;
}

export interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  dob?: string | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  blood_group?: string | null;
  medical_conditions?: string | null;
  allergies?: string | null;
  fitness_goal?: string | null;
  experience_level?: string | null;
  available_days?: number | null;
  equipment_access?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

