import { User, UserProfile, Workout, Exercise, ExerciseVideo, WeeklyWorkoutPlan, Goal, NutritionLog, FoodItem, WaterLog, StepLog, BodyMeasurement, BmiRecord, NotificationItem, DashboardStats } from './types';

const TOKEN_STORAGE_KEY = 'fitness_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Server returned error (${response.status})`);
    }
    data = {};
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || 'An unexpected error occurred.');
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.token);
    return res;
  },

  async register(userData: any): Promise<{ token: string; user: User; message: string }> {
    const res = await request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    setAuthToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore error on logout
    }
    setAuthToken(null);
  },

  async forgotPassword(email: string, newPassword?: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return request<{ message: string }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async getMe(): Promise<{ user: User; profile: UserProfile }> {
    return request<{ user: User; profile: UserProfile }>('/api/auth/me');
  },

  async updateProfile(updates: any): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async updateTargets(targets: any): Promise<{ profile: UserProfile }> {
    return request<{ profile: UserProfile }>('/api/profile/targets', {
      method: 'PUT',
      body: JSON.stringify(targets)
    });
  },

  // Dashboard
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    return request<{ stats: DashboardStats }>('/api/dashboard/stats');
  },

  // Workouts
  async getWorkouts(filters?: { date?: string; muscleGroup?: string; exercise?: string }): Promise<{ workouts: Workout[] }> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.muscleGroup) params.append('muscleGroup', filters.muscleGroup);
    if (filters?.exercise) params.append('exercise', filters.exercise);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ workouts: Workout[] }>(`/api/workouts${query}`);
  },

  async addWorkout(data: any): Promise<{ workout: Workout; message: string }> {
    return request<{ workout: Workout; message: string }>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateWorkout(id: string, data: any): Promise<{ workout: Workout; message: string }> {
    return request<{ workout: Workout; message: string }>(`/api/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteWorkout(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/workouts/${id}`, {
      method: 'DELETE'
    });
  },

  async completeWorkoutSession(data: any): Promise<{
    success: boolean;
    message: string;
    workoutsLogged: Workout[];
    xpEarned: number;
    newTotalXp: number;
    level: number;
    streak: number;
    newBadges: string[];
  }> {
    return request<{
      success: boolean;
      message: string;
      workoutsLogged: Workout[];
      xpEarned: number;
      newTotalXp: number;
      level: number;
      streak: number;
      newBadges: string[];
    }>('/api/workouts/complete-session', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Exercises
  async getExercises(): Promise<{ exercises: Exercise[] }> {
    return request<{ exercises: Exercise[] }>('/api/exercises');
  },

  async addExercise(data: any): Promise<{ exercise: Exercise; message: string }> {
    return request<{ exercise: Exercise; message: string }>('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateExercise(id: string, data: any): Promise<{ exercise: Exercise; message: string }> {
    return request<{ exercise: Exercise; message: string }>(`/api/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteExercise(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/exercises/${id}`, {
      method: 'DELETE'
    });
  },

  // Videos
  async getVideos(): Promise<{ videos: ExerciseVideo[] }> {
    return request<{ videos: ExerciseVideo[] }>('/api/videos');
  },

  async addVideo(data: any): Promise<{ video: ExerciseVideo; message: string }> {
    return request<{ video: ExerciseVideo; message: string }>('/api/videos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateVideo(id: string, data: any): Promise<{ video: ExerciseVideo }> {
    return request<{ video: ExerciseVideo }>(`/api/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteVideo(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/videos/${id}`, {
      method: 'DELETE'
    });
  },

  // Plans & Completions
  async getPlan(): Promise<{ plan: WeeklyWorkoutPlan; completions: any[] }> {
    return request<{ plan: WeeklyWorkoutPlan; completions: any[] }>('/api/plans');
  },

  async updatePlan(schedule: any): Promise<{ plan: WeeklyWorkoutPlan; message: string }> {
    return request<{ plan: WeeklyWorkoutPlan; message: string }>('/api/plans', {
      method: 'PUT',
      body: JSON.stringify({ schedule })
    });
  },

  async togglePlanCompletion(dayName: string, exerciseName: string, date?: string): Promise<{ isCompleted: boolean; message: string }> {
    return request<{ isCompleted: boolean; message: string }>('/api/plans/complete', {
      method: 'POST',
      body: JSON.stringify({ dayName, exerciseName, date })
    });
  },

  // Nutrition & Foods
  async getNutrition(date?: string): Promise<{ date: string; logs: NutritionLog[]; totals: any }> {
    const query = date ? `?date=${date}` : '';
    return request<{ date: string; logs: NutritionLog[]; totals: any }>(`/api/nutrition${query}`);
  },

  async addNutrition(data: any): Promise<{ log: NutritionLog; message: string }> {
    return request<{ log: NutritionLog; message: string }>('/api/nutrition', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteNutrition(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/nutrition/${id}`, {
      method: 'DELETE'
    });
  },

  async getFoods(): Promise<{ foods: FoodItem[] }> {
    return request<{ foods: FoodItem[] }>('/api/foods');
  },

  async addFood(data: any): Promise<{ food: FoodItem; message: string }> {
    return request<{ food: FoodItem; message: string }>('/api/foods', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Water
  async getWater(date?: string): Promise<{ date: string; logs: WaterLog[]; totalMl: number; goalMl: number; percentage: number }> {
    const query = date ? `?date=${date}` : '';
    return request<{ date: string; logs: WaterLog[]; totalMl: number; goalMl: number; percentage: number }>(`/api/water${query}`);
  },

  async addWater(amountMl: number, date?: string): Promise<{ log: WaterLog; message: string }> {
    return request<{ log: WaterLog; message: string }>('/api/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl, date })
    });
  },

  // Steps
  async getSteps(): Promise<{ todaySteps: number; dailyTarget: number; weeklyAverage: number; history: StepLog[] }> {
    return request<{ todaySteps: number; dailyTarget: number; weeklyAverage: number; history: StepLog[] }>('/api/steps');
  },

  async setSteps(stepsCount: number, date?: string): Promise<{ log: StepLog; message: string }> {
    return request<{ log: StepLog; message: string }>('/api/steps', {
      method: 'POST',
      body: JSON.stringify({ stepsCount, date })
    });
  },

  // Goals
  async getGoals(): Promise<{ goals: Goal[] }> {
    return request<{ goals: Goal[] }>('/api/goals');
  },

  async addGoal(data: any): Promise<{ goal: Goal; message: string }> {
    return request<{ goal: Goal; message: string }>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateGoal(id: string, data: any): Promise<{ goal: Goal; message: string }> {
    return request<{ goal: Goal; message: string }>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteGoal(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/goals/${id}`, {
      method: 'DELETE'
    });
  },

  // Measurements
  async getMeasurements(): Promise<{ measurements: BodyMeasurement[] }> {
    return request<{ measurements: BodyMeasurement[] }>('/api/measurements');
  },

  async addMeasurement(data: any): Promise<{ measurement: BodyMeasurement; message: string }> {
    return request<{ measurement: BodyMeasurement; message: string }>('/api/measurements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteMeasurement(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/measurements/${id}`, {
      method: 'DELETE'
    });
  },

  // BMI
  async getBmiHistory(): Promise<{ history: BmiRecord[] }> {
    return request<{ history: BmiRecord[] }>('/api/bmi');
  },

  async recordBmi(height: number, weight: number, date?: string): Promise<{ record: BmiRecord; message: string }> {
    return request<{ record: BmiRecord; message: string }>('/api/bmi', {
      method: 'POST',
      body: JSON.stringify({ height, weight, date })
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<void> {
    await request(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  // Reports
  async getReports(): Promise<{ report: any }> {
    return request<{ report: any }>('/api/reports');
  },

  async getReport(period?: string, startDate?: string, endDate?: string): Promise<{ report: any }> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ report: any }>(`/api/reports${qs}`);
  },

  // Admin
  async getAdminStats(): Promise<{ stats: any; users: User[] }> {
    const statsRes = await request<{ stats: any }>('/api/admin/stats');
    const usersRes = await request<{ users: User[] }>('/api/admin/users');
    return { stats: statsRes.stats, users: usersRes.users };
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/admin/users');
  },

  async updateUserRole(id: string, role: string): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role: role.toUpperCase() })
    });
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  async addAdminUser(data: any): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminUser(id: string, data: any): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  async getDatabaseOverview(): Promise<{
    storageInfo: {
      filePath: string;
      schemaFile: string;
      lastModified: string;
      fileSizeBytes: number;
      tableCounts: Record<string, number>;
    };
    data: any;
  }> {
    return request('/api/admin/database/overview');
  },

  async getDatabaseSqlSchema(): Promise<{ schema: string; path: string }> {
    return request('/api/admin/database/sql-schema');
  }
};
