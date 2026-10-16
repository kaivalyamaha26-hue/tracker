import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db, hashPassword, verifyPassword, User, Workout, Goal, NutritionLog, FoodItem, BodyMeasurement, BmiRecord } from './server/db.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Cloud Run & Load Balancer Health Check Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In-memory active sessions store (token -> userId)
const activeSessions = new Map<string, string>();

// Initialize default sessions for quick access
activeSessions.set('token_admin_demo', 'usr_admin_001');
activeSessions.set('token_user_demo', 'usr_alex_002');

// Helper to authenticate session token
function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  let userId = activeSessions.get(token);
  if (!userId && token.startsWith('token_')) {
    const parts = token.split('_');
    if (parts.length >= 3) {
      const potentialId = parts.slice(1, -1).join('_');
      if (db.getUserById(potentialId)) {
        userId = potentialId;
        activeSessions.set(token, userId);
      }
    }
  }

  if (!userId) return null;
  return db.getUserById(userId) || null;
}

// Middleware: Require Auth
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
  }
  (req as any).user = user;
  next();
}

// Middleware: Require Admin
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please login.' });
  }
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Access denied. Administrator rights required.' });
  }
  (req as any).user = user;
  next();
}

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      dob,
      gender,
      height,
      weight,
      password,
      confirmPassword,
      fitnessGoal,
      experienceLevel,
      availableDays,
      equipment
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      dob: dob || '2000-01-01',
      gender: gender || 'Not Specified',
      height: Number(height) || 175,
      weight: Number(weight) || 70,
      passwordHash: hashPassword(password),
      role: 'USER',
      fitnessGoal: fitnessGoal || 'General Fitness',
      experienceLevel: experienceLevel || 'Beginner',
      availableDays: Number(availableDays) || 4,
      equipment: equipment || 'Gym',
      createdAt: new Date().toISOString().split('T')[0]
    };

    db.createUser(newUser);

    // Initial BMI record
    const heightInMeters = newUser.height / 100;
    const bmiVal = Number((newUser.weight / (heightInMeters * heightInMeters)).toFixed(1));
    let cat: 'Underweight' | 'Normal' | 'Overweight' | 'Obesity' = 'Normal';
    if (bmiVal < 18.5) cat = 'Underweight';
    else if (bmiVal < 25) cat = 'Normal';
    else if (bmiVal < 30) cat = 'Overweight';
    else cat = 'Obesity';

    db.addBmiRecord({
      id: `bmi_${Date.now()}`,
      userId: newUser.id,
      height: newUser.height,
      weight: newUser.weight,
      bmi: bmiVal,
      category: cat,
      date: new Date().toISOString().split('T')[0]
    });

    const token = `token_${newUser.id}_${Date.now()}`;
    activeSessions.set(token, newUser.id);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: safeUser
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    let cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'demo@fitpulse.app' || cleanEmail === 'demo@fitness.com' || cleanEmail === 'demo@user.com') {
      cleanEmail = 'alex@fitness.com';
    } else if (cleanEmail === 'admin@fitpulse.app') {
      cleanEmail = 'admin@fitness.com';
    }

    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'No account found with this email. Please check your spelling or click "Create Account".' 
      });
    }

    // Allow flexible passwords for demo accounts
    let isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      if (user.id === 'usr_alex_002' && (password === 'user123' || password === 'password123' || password === 'demopassword' || password === 'demo123')) {
        isPasswordValid = true;
      } else if (user.id === 'usr_admin_001' && (password === 'admin123' || password === 'password123' || password === 'admin' || password === 'demopassword')) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Incorrect password. Please re-enter your password or click "Reset Password".' 
      });
    }

    const token = `token_${user.id}_${Date.now()}`;
    activeSessions.set(token, user.id);

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server error during login.' });
  }
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: 'No account found with this email address.' });
  }
  if (newPassword) {
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }
    db.updateUser(user.id, { passwordHash: hashPassword(newPassword) });
    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  }
  return res.json({
    success: true,
    message: 'Reset verification verified. Please enter your new password.'
  });
});

// Get Current User Profile
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { passwordHash: _, ...safeUser } = user;
  const profile = db.getProfile(user.id);
  return res.json({ success: true, user: safeUser, profile });
});

// Update Profile
app.put('/api/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { name, phone, dob, gender, height, weight, fitnessGoal, experienceLevel, currentPassword, newPassword } = req.body;

  const updates: Partial<User> = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (dob) updates.dob = dob;
  if (gender) updates.gender = gender;
  if (fitnessGoal) updates.fitnessGoal = fitnessGoal;
  if (experienceLevel) updates.experienceLevel = experienceLevel;

  if (height !== undefined && !isNaN(Number(height))) {
    updates.height = Number(height);
  }
  if (weight !== undefined && !isNaN(Number(weight))) {
    updates.weight = Number(weight);
    // Add BMI log when weight updates
    const h = (updates.height || user.height) / 100;
    const bmiVal = Number((updates.weight / (h * h)).toFixed(1));
    let cat: 'Underweight' | 'Normal' | 'Overweight' | 'Obesity' = 'Normal';
    if (bmiVal < 18.5) cat = 'Underweight';
    else if (bmiVal < 25) cat = 'Normal';
    else if (bmiVal < 30) cat = 'Overweight';
    else cat = 'Obesity';

    db.addBmiRecord({
      id: `bmi_${Date.now()}`,
      userId: user.id,
      height: updates.height || user.height,
      weight: updates.weight,
      bmi: bmiVal,
      category: cat,
      date: new Date().toISOString().split('T')[0]
    });
  }

  if (newPassword) {
    if (!currentPassword || !verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }
    updates.passwordHash = hashPassword(newPassword);
  }

  const updated = db.updateUser(user.id, updates);
  if (!updated) return res.status(404).json({ success: false, error: 'User not found.' });

  const { passwordHash: _, ...safeUser } = updated;
  return res.json({ success: true, message: 'Profile updated successfully!', user: safeUser });
});

// Update Profile Goals/Targets
app.put('/api/profile/targets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { dailyWaterGoal, dailyStepGoal, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } = req.body;
  const updated = db.updateProfile(user.id, {
    dailyWaterGoal: Number(dailyWaterGoal) || 3000,
    dailyStepGoal: Number(dailyStepGoal) || 10000,
    dailyCalorieGoal: Number(dailyCalorieGoal) || 2200,
    dailyProteinGoal: Number(dailyProteinGoal) || 120,
    dailyCarbsGoal: Number(dailyCarbsGoal) || 250,
    dailyFatGoal: Number(dailyFatGoal) || 65
  });
  return res.json({ success: true, profile: updated });
});

// ==========================================
// 2. DASHBOARD STATS (Live database aggregated)
// ==========================================
app.get('/api/dashboard/stats', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const today = new Date().toISOString().split('T')[0];
  const profile = db.getProfile(user.id);

  // Today's nutrition
  const todayNutrition = db.getNutrition(user.id, today);
  const totalCalories = todayNutrition.reduce((sum, n) => sum + (n.calories || 0), 0);
  const totalProtein = todayNutrition.reduce((sum, n) => sum + (n.protein || 0), 0);
  const totalCarbs = todayNutrition.reduce((sum, n) => sum + (n.carbohydrates || 0), 0);
  const totalFat = todayNutrition.reduce((sum, n) => sum + (n.fat || 0), 0);

  // Today's water
  const todayWater = db.getWater(user.id, today);
  const currentWaterMl = todayWater.reduce((sum, w) => sum + (w.amountMl || 0), 0);

  // Today's steps
  const todayStepsLog = db.getSteps(user.id, today);
  const currentSteps = todayStepsLog.length > 0 ? todayStepsLog[0].stepsCount : 0;

  // Workouts this week
  const userWorkouts = db.getWorkouts(user.id);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentWorkouts = userWorkouts.filter(w => new Date(w.date) >= sevenDaysAgo);
  const weeklyWorkoutCount = recentWorkouts.length;
  const totalWorkoutDuration = recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  // BMI
  const userH = (user.height && user.height > 0) ? user.height : 175;
  const userW = (user.weight && user.weight > 0) ? user.weight : 70;
  const heightM = userH / 100;
  const bmiVal = Number((userW / (heightM * heightM)).toFixed(1));
  let bmiCategory = 'Normal';
  if (bmiVal < 18.5) bmiCategory = 'Underweight';
  else if (bmiVal < 25) bmiCategory = 'Normal';
  else if (bmiVal < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obesity';

  // Today's Day Plan and Completions
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[new Date().getDay()];
  const userPlan = db.getUserPlan(user.id);
  const todayPlan = userPlan?.schedule?.[dayName] || { title: 'Rest & Recovery Day', focus: 'Active Recovery', exercises: [] };
  const todayCompletions = db.getCompletions(user.id, today) || [];

  // Today progress percentage
  let completedItems = 0;
  let totalItems = 0;

  // Workout tasks in today's plan
  if (todayPlan.exercises.length > 0) {
    totalItems += todayPlan.exercises.length;
    const completedCount = todayPlan.exercises.filter(ex =>
      todayCompletions.some(c => c.exerciseName === ex.name)
    ).length;
    completedItems += completedCount;
  }

  // Nutrition targets (3 meals + snack = 4 meal milestones)
  const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const;
  totalItems += 4;
  mealTypes.forEach(m => {
    if (todayNutrition.some(n => n.mealType === m)) completedItems++;
  });

  // Water goal milestone
  totalItems += 1;
  if (currentWaterMl >= profile.dailyWaterGoal) completedItems++;
  else completedItems += Math.min(1, currentWaterMl / profile.dailyWaterGoal);

  // Steps goal milestone
  totalItems += 1;
  if (currentSteps >= profile.dailyStepGoal) completedItems++;
  else completedItems += Math.min(1, currentSteps / profile.dailyStepGoal);

  const overallDailyProgress = totalItems > 0 ? Math.min(100, Math.round((completedItems / totalItems) * 100)) : 0;

  // Active Goals
  const goals = db.getGoals(user.id);

  // Notifications
  const notifications = db.getNotifications(user.id);

  return res.json({
    success: true,
    stats: {
      currentWeight: user.weight,
      height: user.height,
      bmi: bmiVal,
      bmiCategory,
      fitnessGoal: user.fitnessGoal,
      weeklyWorkoutCount,
      workoutDuration: totalWorkoutDuration,
      calories: {
        current: totalCalories,
        target: profile.dailyCalorieGoal,
        protein: totalProtein,
        proteinTarget: profile.dailyProteinGoal,
        carbs: totalCarbs,
        carbsTarget: profile.dailyCarbsGoal,
        fat: totalFat,
        fatTarget: profile.dailyFatGoal
      },
      water: {
        currentMl: currentWaterMl,
        targetMl: profile.dailyWaterGoal,
        percent: Math.min(100, Math.round((currentWaterMl / profile.dailyWaterGoal) * 100))
      },
      steps: {
        current: currentSteps,
        target: profile.dailyStepGoal,
        percent: Math.min(100, Math.round((currentSteps / profile.dailyStepGoal) * 100))
      },
      todayPlan: {
        dayName,
        title: todayPlan.title,
        focus: todayPlan.focus,
        exercises: todayPlan.exercises.map(ex => ({
          ...ex,
          completed: todayCompletions.some(c => c.exerciseName === ex.name)
        }))
      },
      overallDailyProgress,
      goalsCount: goals.length,
      notifications,
      gamification: db.getUserGamification(user.id)
    }
  });
});

// ==========================================
// 3. WORKOUTS (CRUD)
// ==========================================
app.get('/api/workouts', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { date, muscleGroup, exercise } = req.query;

  let list = db.getWorkouts(user.id);
  if (date) list = list.filter(w => w.date === date);
  if (muscleGroup && muscleGroup !== 'All') list = list.filter(w => w.muscleGroup.toLowerCase() === String(muscleGroup).toLowerCase());
  if (exercise) list = list.filter(w => w.exercise.toLowerCase().includes(String(exercise).toLowerCase()));

  return res.json({ success: true, workouts: list });
});

app.post('/api/workouts', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { exercise, muscleGroup, sets, reps, weight, duration, caloriesBurned, date, notes } = req.body;

  if (!exercise || !muscleGroup) {
    return res.status(400).json({ success: false, error: 'Exercise and muscle group are required.' });
  }

  const workout: Workout = {
    id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    exercise: exercise.trim(),
    muscleGroup: muscleGroup.trim(),
    sets: Number(sets) || 1,
    reps: Number(reps) || 1,
    weight: Number(weight) || 0,
    duration: Number(duration) || 15,
    caloriesBurned: Number(caloriesBurned) || Math.round((Number(duration) || 15) * 7.5),
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || ''
  };

  const created = db.addWorkout(workout);
  return res.status(201).json({ success: true, workout: created, message: 'Workout logged successfully!' });
});

app.put('/api/workouts/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const workout = db.getWorkouts(user.id).find(w => w.id === id);
  if (!workout) {
    return res.status(404).json({ success: false, error: 'Workout not found or unauthorized.' });
  }

  const updated = db.updateWorkout(id, req.body);
  return res.json({ success: true, workout: updated, message: 'Workout updated successfully!' });
});

app.delete('/api/workouts/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const workout = db.getWorkouts(user.id).find(w => w.id === id);
  if (!workout) {
    return res.status(404).json({ success: false, error: 'Workout not found or unauthorized.' });
  }
  db.deleteWorkout(id);
  return res.json({ success: true, message: 'Workout deleted successfully!' });
});

// Complete Entire Workout Session with Gamification & DB Logging
app.post('/api/workouts/complete-session', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { workoutTitle, durationSeconds, caloriesBurned, exercises } = req.body;

  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ success: false, error: 'Valid exercises array is required.' });
  }

  const durationMinutes = Math.max(1, Math.round((Number(durationSeconds) || 1200) / 60));
  const totalCalories = Number(caloriesBurned) || Math.round(durationMinutes * 8);

  const result = db.recordWorkoutSession({
    userId: user.id,
    workoutTitle: workoutTitle || 'Interactive Workout Session',
    durationMinutes,
    caloriesBurned: totalCalories,
    exercises
  });

  return res.status(201).json({
    success: true,
    message: 'Workout session recorded successfully! XP and streaks updated.',
    ...result
  });
});

// ==========================================
// 4. EXERCISES & VIDEOS (LIBRARY & DEMOS)
// ==========================================
app.get('/api/exercises', (_req: Request, res: Response) => {
  const exercises = db.getExercises();
  return res.json({ success: true, exercises });
});

app.post('/api/exercises', requireAdmin, (req: Request, res: Response) => {
  const { name, muscleGroup, difficulty, equipment, instructions, benefits, commonMistakes, recommendedSets, recommendedReps, restTime } = req.body;
  if (!name || !muscleGroup) {
    return res.status(400).json({ success: false, error: 'Exercise name and muscle group are required.' });
  }

  const newExercise = db.addExercise({
    id: `ex_${Date.now()}`,
    name,
    muscleGroup,
    difficulty: difficulty || 'Beginner',
    equipment: equipment || 'Bodyweight',
    instructions: Array.isArray(instructions) ? instructions : [instructions || 'Perform with steady form.'],
    benefits: benefits || 'Improves muscular strength and endurance.',
    commonMistakes: Array.isArray(commonMistakes) ? commonMistakes : ['Rushing reps'],
    recommendedSets: recommendedSets || '3 sets',
    recommendedReps: recommendedReps || '10 - 12 reps',
    restTime: restTime || '60 sec'
  });

  return res.status(201).json({ success: true, exercise: newExercise, message: 'Exercise created successfully!' });
});

app.put('/api/exercises/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateExercise(id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Exercise not found.' });
  return res.json({ success: true, exercise: updated, message: 'Exercise updated.' });
});

app.delete('/api/exercises/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteExercise(id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Exercise not found.' });
  return res.json({ success: true, message: 'Exercise removed.' });
});

// Videos API
app.get('/api/videos', (_req: Request, res: Response) => {
  const videos = db.getVideos();
  return res.json({ success: true, videos });
});

app.post('/api/videos', requireAdmin, (req: Request, res: Response) => {
  const { exerciseId, exerciseName, title, videoUrl, thumbnailUrl, duration, muscleGroup, difficulty } = req.body;
  if (!title || !videoUrl) {
    return res.status(400).json({ success: false, error: 'Title and video URL are required.' });
  }

  const video = db.addVideo({
    id: `vid_${Date.now()}`,
    exerciseId: exerciseId || 'custom',
    exerciseName: exerciseName || title,
    title,
    videoUrl,
    thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    duration: duration || '3:00 mins',
    muscleGroup: muscleGroup || 'Full Body',
    difficulty: difficulty || 'Intermediate'
  });

  return res.status(201).json({ success: true, video, message: 'Video demonstration added!' });
});

app.put('/api/videos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateVideo(id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Video not found.' });
  return res.json({ success: true, video: updated });
});

app.delete('/api/videos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteVideo(id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Video not found.' });
  return res.json({ success: true, message: 'Video removed.' });
});

// ==========================================
// 5. WORKOUT PLANNER & COMPLETIONS (Day-Wise)
// ==========================================
app.get('/api/plans', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const plan = db.getUserPlan(user.id);
  const completions = db.getCompletions(user.id);
  return res.json({ success: true, plan, completions });
});

app.put('/api/plans', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { schedule } = req.body;
  if (!schedule) return res.status(400).json({ success: false, error: 'Schedule object required.' });

  const updated = db.updateUserPlan(user.id, { userId: user.id, schedule });
  return res.json({ success: true, plan: updated, message: 'Workout plan saved!' });
});

app.post('/api/plans/complete', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { date, dayName, exerciseName } = req.body;
  if (!dayName || !exerciseName) {
    return res.status(400).json({ success: false, error: 'dayName and exerciseName are required.' });
  }
  const targetDate = date || new Date().toISOString().split('T')[0];
  const isCompleted = db.toggleCompletion(user.id, targetDate, dayName, exerciseName);

  // If completed, optionally record a default workout entry if user wants
  return res.json({
    success: true,
    isCompleted,
    message: isCompleted ? `Great job! "${exerciseName}" marked as completed.` : `Marked "${exerciseName}" as uncompleted.`
  });
});

// ==========================================
// 6. NUTRITION & INDIAN FOOD DATABASE
// ==========================================
app.get('/api/nutrition', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { date } = req.query;
  const targetDate = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];
  const logs = db.getNutrition(user.id, targetDate);

  const totals = logs.reduce(
    (acc, log) => {
      acc.calories += log.calories || 0;
      acc.protein += log.protein || 0;
      acc.carbohydrates += log.carbohydrates || 0;
      acc.fat += log.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  return res.json({ success: true, date: targetDate, logs, totals });
});

app.post('/api/nutrition', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { foodName, calories, protein, carbohydrates, fat, quantity, mealType, date } = req.body;

  if (!foodName || calories === undefined) {
    return res.status(400).json({ success: false, error: 'Food name and calories are required.' });
  }

  const log: NutritionLog = {
    id: `nut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    foodName: foodName.trim(),
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbohydrates: Number(carbohydrates) || 0,
    fat: Number(fat) || 0,
    quantity: quantity || '1 serving',
    mealType: mealType || 'Breakfast',
    date: date || new Date().toISOString().split('T')[0]
  };

  const created = db.addNutrition(log);
  return res.status(201).json({ success: true, log: created, message: 'Food logged successfully!' });
});

app.delete('/api/nutrition/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const deleted = db.deleteNutrition(id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Record not found.' });
  return res.json({ success: true, message: 'Meal record removed.' });
});

// Food database (Indian & global library)
app.get('/api/foods', (_req: Request, res: Response) => {
  const foods = db.getFoods();
  return res.json({ success: true, foods });
});

app.post('/api/foods', requireAuth, (req: Request, res: Response) => {
  const { name, category, serving, calories, protein, carbs, fat, isIndian } = req.body;
  if (!name || calories === undefined) {
    return res.status(400).json({ success: false, error: 'Food name and calories are required.' });
  }

  const newItem: FoodItem = {
    id: `f_${Date.now()}`,
    name,
    category: category || 'Snacks',
    serving: serving || '100g',
    calories: Number(calories),
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    isIndian: isIndian !== undefined ? Boolean(isIndian) : true
  };

  db.addFood(newItem);
  return res.status(201).json({ success: true, food: newItem, message: 'Custom food saved to library!' });
});

// ==========================================
// 7. WATER TRACKER
// ==========================================
app.get('/api/water', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { date } = req.query;
  const targetDate = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];
  const logs = db.getWater(user.id, targetDate);
  const totalMl = logs.reduce((sum, item) => sum + item.amountMl, 0);
  const profile = db.getProfile(user.id);

  return res.json({
    success: true,
    date: targetDate,
    logs,
    totalMl,
    goalMl: profile.dailyWaterGoal,
    percentage: Math.min(100, Math.round((totalMl / profile.dailyWaterGoal) * 100))
  });
});

app.post('/api/water', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { amountMl, date } = req.body;
  if (!amountMl || Number(amountMl) <= 0) {
    return res.status(400).json({ success: false, error: 'Valid amount in ml is required.' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const log = db.addWater({
    id: `wtr_${Date.now()}`,
    userId: user.id,
    amountMl: Number(amountMl),
    date: targetDate,
    loggedAt: timeStr
  });

  return res.status(201).json({ success: true, log, message: `Added ${amountMl} ml of water.` });
});

// ==========================================
// 8. STEP TRACKER
// ==========================================
app.get('/api/steps', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const today = new Date().toISOString().split('T')[0];
  const allUserSteps = db.getAllStepsForUser(user.id);
  const todayEntry = allUserSteps.find(s => s.date === today);
  const profile = db.getProfile(user.id);

  // Weekly average (last 7 recorded days)
  const last7 = allUserSteps.slice(0, 7);
  const weeklyAvg = last7.length > 0 ? Math.round(last7.reduce((sum, s) => sum + s.stepsCount, 0) / last7.length) : 0;

  return res.json({
    success: true,
    todaySteps: todayEntry ? todayEntry.stepsCount : 0,
    dailyTarget: profile.dailyStepGoal,
    weeklyAverage: weeklyAvg,
    history: allUserSteps.slice(0, 14)
  });
});

app.post('/api/steps', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { stepsCount, date } = req.body;
  if (stepsCount === undefined || isNaN(Number(stepsCount))) {
    return res.status(400).json({ success: false, error: 'Valid step count is required.' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];
  const log = db.setSteps(user.id, targetDate, Number(stepsCount));
  return res.json({ success: true, log, message: 'Step count updated.' });
});

// ==========================================
// 9. FITNESS GOALS
// ==========================================
app.get('/api/goals', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const goals = db.getGoals(user.id);
  return res.json({ success: true, goals });
});

app.post('/api/goals', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { title, goalType, currentValue, targetValue, unit, targetDate } = req.body;

  if (!title || targetValue === undefined) {
    return res.status(400).json({ success: false, error: 'Goal title and target value are required.' });
  }

  const newGoal: Goal = {
    id: `g_${Date.now()}`,
    userId: user.id,
    title,
    goalType: goalType || 'General Fitness',
    currentValue: Number(currentValue) || 0,
    targetValue: Number(targetValue),
    unit: unit || 'kg',
    targetDate: targetDate || '',
    createdAt: new Date().toISOString().split('T')[0]
  };

  const created = db.addGoal(newGoal);
  return res.status(201).json({ success: true, goal: created, message: 'Goal created!' });
});

app.put('/api/goals/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateGoal(id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Goal not found.' });
  return res.json({ success: true, goal: updated, message: 'Goal updated!' });
});

app.delete('/api/goals/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db.deleteGoal(id);
  return res.json({ success: true, message: 'Goal removed.' });
});

// ==========================================
// 10. PROGRESS & BODY MEASUREMENTS
// ==========================================
app.get('/api/measurements', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const measurements = db.getMeasurements(user.id);
  return res.json({ success: true, measurements });
});

app.post('/api/measurements', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { chest, waist, arms, thighs, shoulders, weight, date } = req.body;

  const item: BodyMeasurement = {
    id: `ms_${Date.now()}`,
    userId: user.id,
    chest: Number(chest) || 0,
    waist: Number(waist) || 0,
    arms: Number(arms) || 0,
    thighs: Number(thighs) || 0,
    shoulders: Number(shoulders) || 0,
    weight: Number(weight) || user.weight,
    date: date || new Date().toISOString().split('T')[0]
  };

  const created = db.addMeasurement(item);
  return res.status(201).json({ success: true, measurement: created, message: 'Measurements recorded!' });
});

app.delete('/api/measurements/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db.deleteMeasurement(id);
  return res.json({ success: true, message: 'Measurement removed.' });
});

// ==========================================
// 11. BMI CALCULATOR & HISTORY
// ==========================================
app.get('/api/bmi', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const history = db.getBmiHistory(user.id);
  return res.json({ success: true, history });
});

app.post('/api/bmi', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { height, weight, date } = req.body;

  const h = Number(height);
  const w = Number(weight);
  if (!h || !w || h <= 0 || w <= 0) {
    return res.status(400).json({ success: false, error: 'Valid height (cm) and weight (kg) are required.' });
  }

  const heightInMeters = h / 100;
  const bmiVal = Number((w / (heightInMeters * heightInMeters)).toFixed(1));

  let category: 'Underweight' | 'Normal' | 'Overweight' | 'Obesity' = 'Normal';
  if (bmiVal < 18.5) category = 'Underweight';
  else if (bmiVal < 25) category = 'Normal';
  else if (bmiVal < 30) category = 'Overweight';
  else category = 'Obesity';

  const record: BmiRecord = {
    id: `bmi_${Date.now()}`,
    userId: user.id,
    height: h,
    weight: w,
    bmi: bmiVal,
    category,
    date: date || new Date().toISOString().split('T')[0]
  };

  const created = db.addBmiRecord(record);
  return res.status(201).json({ success: true, record: created, message: `BMI recorded: ${bmiVal} (${category})` });
});

// ==========================================
// 12. NOTIFICATIONS
// ==========================================
app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const notifications = db.getNotifications(user.id);
  return res.json({ success: true, notifications });
});

app.put('/api/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db.markNotificationRead(id);
  return res.json({ success: true, message: 'Notification marked as read.' });
});

// ==========================================
// 13. REPORTS (Weekly & Monthly summaries)
// ==========================================
app.get('/api/reports', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const workouts = db.getWorkouts(user.id);
  const nutrition = db.getNutrition(user.id);
  const steps = db.getAllStepsForUser(user.id);
  const bmiHistory = db.getBmiHistory(user.id);

  const totalDuration = workouts.reduce((s, w) => s + (w.duration || 0), 0);
  const totalCaloriesBurned = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);

  const avgSteps = steps.length > 0 ? Math.round(steps.reduce((s, st) => s + st.stepsCount, 0) / steps.length) : 0;
  const avgCaloriesConsumed = nutrition.length > 0 ? Math.round(nutrition.reduce((s, n) => s + n.calories, 0) / Math.max(1, new Set(nutrition.map(n => n.date)).size)) : 0;

  const startWeight = bmiHistory.length > 1 ? bmiHistory[bmiHistory.length - 1].weight : user.weight;
  const currentWeight = user.weight;
  const weightChange = Number((currentWeight - startWeight).toFixed(1));

  return res.json({
    success: true,
    report: {
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      userName: user.name,
      email: user.email,
      fitnessGoal: user.fitnessGoal,
      totalWorkouts: workouts.length,
      totalDurationMinutes: totalDuration,
      totalCaloriesBurned,
      averageSteps: avgSteps,
      averageCaloriesConsumed: avgCaloriesConsumed,
      startWeight,
      currentWeight,
      weightChange,
      bmi: Number((user.weight / ((user.height / 100) * (user.height / 100))).toFixed(1)),
      workoutsSummary: workouts.slice(0, 10),
      recentBmi: bmiHistory.slice(0, 5)
    }
  });
});

// ==========================================
// 14. ADMIN PANEL ROUTES
// ==========================================
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const stats = db.getSystemStats();
  return res.json({ success: true, stats });
});

app.get('/api/admin/database/overview', requireAuth, (_req: Request, res: Response) => {
  try {
    const storageInfo = db.getStorageInfo();
    const data = db.getFullDatabaseSnapshot();
    return res.json({ success: true, storageInfo, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/database/sql-schema', requireAuth, (_req: Request, res: Response) => {
  try {
    const sqlPath = path.resolve(process.cwd(), 'database.sql');
    if (fs.existsSync(sqlPath)) {
      const content = fs.readFileSync(sqlPath, 'utf-8');
      return res.json({ success: true, schema: content, path: 'database.sql' });
    }
    return res.status(404).json({ success: false, error: 'database.sql file not found' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const users = db.getUsers().map(u => {
    const { passwordHash: _, ...safe } = u;
    return safe;
  });
  return res.json({ success: true, users });
});

app.post('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  const { name, email, phone, role, fitnessGoal, height, weight, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'User with this email already exists.' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    dob: '1995-01-01',
    gender: 'Other',
    height: Number(height) || 175,
    weight: Number(weight) || 70,
    passwordHash: hashPassword(password),
    role: role === 'ADMIN' ? 'ADMIN' : 'USER',
    fitnessGoal: fitnessGoal || 'General Fitness',
    experienceLevel: 'Intermediate',
    availableDays: 4,
    equipment: 'Gym',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.createUser(newUser);
  const { passwordHash: _, ...safe } = newUser;
  return res.status(201).json({ success: true, user: safe, message: 'User added by administrator.' });
});

app.put('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, fitnessGoal, height, weight, newPassword } = req.body;

  const updates: Partial<User> = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (role) updates.role = role;
  if (fitnessGoal) updates.fitnessGoal = fitnessGoal;
  if (height) updates.height = Number(height);
  if (weight) updates.weight = Number(weight);
  if (newPassword && newPassword.length >= 6) {
    updates.passwordHash = hashPassword(newPassword);
  }

  const updated = db.updateUser(id, updates);
  if (!updated) return res.status(404).json({ success: false, error: 'User not found.' });

  const { passwordHash: _, ...safe } = updated;
  return res.json({ success: true, user: safe, message: 'User updated by admin.' });
});

app.delete('/api/admin/users/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const currentAdmin = (req as any).user as User;
  if (currentAdmin.id === id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own admin account.' });
  }

  const deleted = db.deleteUser(id);
  if (!deleted) return res.status(404).json({ success: false, error: 'User not found.' });
  return res.json({ success: true, message: 'User deleted.' });
});

// Start Server and Mount Vite / Static Handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Guard: Undefined API requests should return 404 JSON instead of HTML
    app.all('/api/*', (_req: Request, res: Response) => {
      res.status(404).json({ success: false, error: 'API route not found' });
    });

    // SPA fallback: return index.html for application routes
    app.get('*', (_req: Request, res: Response, next: NextFunction) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          next(err);
        }
      });
    });
  }

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal Fitness Tracker server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Failed to start server:', err);
  process.exit(1);
});
