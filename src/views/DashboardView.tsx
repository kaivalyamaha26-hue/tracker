import React, { useState, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Footprints,
  Dumbbell,
  Scale,
  CalendarCheck,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  LogIn,
  Zap,
  Trophy,
  Award,
  Database
} from 'lucide-react';

import { api } from '../api';
import { DashboardStats, Exercise, User } from '../types';
import { NavView } from '../components/Sidebar';

interface DashboardViewProps {
  user?: User | null;
  onNavigate?: (view: NavView) => void;
  onSelectView?: (view: NavView) => void;
  onWatchExercise?: (exerciseName: string) => void;
  onOpenVideoModal?: (video: any) => void;
  onOpenAuth?: () => void;
  onStartWorkoutSession?: (workout: { title: string; exercises: any[] }) => void;
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onSelectView,
  onWatchExercise,
  onOpenVideoModal,
  onOpenAuth,
  onStartWorkoutSession,
  showToast
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickWaterLoading, setQuickWaterLoading] = useState(false);

  // Safe navigation helper supporting both onNavigate and onSelectView
  const navigateTo = (view: NavView) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (onSelectView) {
      onSelectView(view);
    }
  };

  // Safe video/exercise viewer supporting both signatures
  const handleWatch = (exerciseName: string) => {
    if (onWatchExercise) {
      onWatchExercise(exerciseName);
    } else if (onOpenVideoModal) {
      onOpenVideoModal({ name: exerciseName });
    }
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardStats();
      if (res && res.stats) {
        setStats(res.stats);
      } else {
        throw new Error('Invalid dashboard response format');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to load dashboard metrics';
      setError(msg);
      // If unauthorized, don't spam toast, show in UI
      if (!msg.toLowerCase().includes('unauthorized') && !msg.toLowerCase().includes('login')) {
        showToast('error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user?.id, user?.email]);

  const handleToggleExercise = async (exerciseName: string) => {
    if (!stats) return;
    const currentDayName = stats.todayPlan?.dayName || 'Today';
    try {
      const res = await api.togglePlanCompletion(currentDayName, exerciseName);
      showToast('success', res.message || 'Exercise completion updated');
      loadStats();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update exercise completion');
    }
  };

  const handleQuickAddWater = async (amount: number) => {
    setQuickWaterLoading(true);
    try {
      await api.addWater(amount);
      showToast('success', `Added ${amount}ml of water! Stay hydrated.`);
      loadStats();
    } catch (err: any) {
      showToast('error', 'Failed to log water');
    } finally {
      setQuickWaterLoading(false);
    }
  };

  // Loading state with skeleton & retry
  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 animate-fadeIn">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-base font-bold text-white">Aggregating fitness telemetry...</p>
          <p className="text-xs text-slate-400 mt-1">Syncing workouts, nutrition, hydration, and daily targets</p>
        </div>
      </div>
    );
  }

  // Error state with immediate recovery options
  if (error && !stats) {
    const isAuth = error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('login');
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto shadow-2xl animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {isAuth ? 'Sign In to View Dashboard' : 'Dashboard Telemetry Unavailable'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {isAuth
              ? 'Please sign in or select a profile to view your real-time workout schedule and metrics.'
              : error}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          {isAuth && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
          <button
            onClick={loadStats}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Safe KPI calculations
  const caloriesCurrent = stats.calories?.current ?? 0;
  const caloriesTarget = stats.calories?.target || 2200;
  const caloriePercent = Math.min(100, Math.round((caloriesCurrent / caloriesTarget) * 100));

  const waterCurrent = stats.water?.currentMl ?? 0;
  const waterTarget = stats.water?.targetMl || 3000;
  const waterPercent = Math.min(100, stats.water?.percent ?? Math.round((waterCurrent / waterTarget) * 100));

  const stepsCurrent = stats.steps?.current ?? 0;
  const stepsTarget = stats.steps?.target || 10000;
  const stepsPercent = Math.min(100, stats.steps?.percent ?? Math.round((stepsCurrent / stepsTarget) * 100));

  const todayPlan = stats.todayPlan || {
    dayName: 'Today',
    title: 'Daily Training & Activity',
    focus: 'General Fitness',
    exercises: []
  };
  const planExercises = todayPlan.exercises || [];
  const notifications = stats.notifications || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Welcome & Daily Score Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Today's Performance Overview
              </span>
              <button
                onClick={loadStats}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh dashboard stats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Keep Pushing Towards Your Goals
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Target goal: <span className="text-emerald-400 font-semibold">{stats.fitnessGoal || 'Fitness'}</span>. You have logged{' '}
              <span className="text-white font-semibold">{stats.weeklyWorkoutCount ?? 0} workouts</span> this week. Stay consistent!
            </p>

            {/* Quick Action: Start Workout Button */}
            {planExercises.length > 0 && onStartWorkoutSession && (
              <div className="pt-2">
                <button
                  onClick={() =>
                    onStartWorkoutSession({
                      title: todayPlan.title || `${todayPlan.dayName} Workout`,
                      exercises: planExercises
                    })
                  }
                  className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Start Today's Workout Session ({planExercises.length} Exercises)
                </button>
              </div>
            )}
          </div>

          {/* Daily Completion Score Circle */}
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${stats.overallDailyProgress || 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold text-white">
                {stats.overallDailyProgress ?? 0}%
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Daily Completion
              </span>
              <span className="text-xs text-slate-300">
                {(stats.overallDailyProgress ?? 0) >= 80
                  ? 'Excellent pacing!'
                  : (stats.overallDailyProgress ?? 0) >= 50
                  ? 'Solid progress'
                  : 'Get active today'}
              </span>
            </div>
          </div>
        </div>

        {/* Gamification, Streak & Milestone Progress Banner */}
        {(() => {
          const gamification = stats.gamification || {
            xp: 1250,
            level: 3,
            streak: 5,
            nextLevelXp: 1500,
            badges: ['Consistency Master', 'Form Master', 'Hydration Hero']
          };
          const xpInLevel = gamification.xp % 500;
          const xpPercent = Math.min(100, Math.round((xpInLevel / 500) * 100));

          return (
            <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Streak info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-white">
                      {gamification.streak} Day Streak!
                    </span>
                    <span className="text-xs">🔥</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Keep training daily to compound streak XP multipliers
                  </span>
                </div>
              </div>

              {/* XP & Level Progress */}
              <div className="w-full md:w-64 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> Level {gamification.level} Athlete
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {gamification.xp} / {gamification.nextLevelXp} XP
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              {/* Badges unlocked */}
              <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                {gamification.badges.slice(0, 2).map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1"
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    {badge}
                  </span>
                ))}
              </div>

            </div>
          );
        })()}
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Calories Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calories</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{caloriesCurrent}</span>
              <span className="text-xs text-slate-400">/ {caloriesTarget} kcal</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Protein: {stats.calories?.protein ?? 0}g / {stats.calories?.proteinTarget ?? 120}g</span>
            <button
              onClick={() => navigateTo('nutrition')}
              className="text-orange-400 hover:underline font-semibold flex items-center gap-0.5"
            >
              Log Meal <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Water Hydration Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Water Intake</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{waterCurrent}</span>
              <span className="text-xs text-slate-400">/ {waterTarget} ml</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1">
              <button
                disabled={quickWaterLoading}
                onClick={() => handleQuickAddWater(250)}
                className="px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold transition-colors"
              >
                +250ml
              </button>
              <button
                disabled={quickWaterLoading}
                onClick={() => handleQuickAddWater(500)}
                className="px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold transition-colors"
              >
                +500ml
              </button>
            </div>
            <button
              onClick={() => navigateTo('water')}
              className="text-cyan-400 hover:underline font-semibold text-[11px] flex items-center gap-0.5"
            >
              Details <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Steps Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Steps</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Footprints className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">
                {stepsCurrent.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">/ {stepsTarget.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>{Math.round((stepsCurrent * 0.00075) * 10) / 10} km estimated</span>
            <button
              onClick={() => navigateTo('steps')}
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
            >
              Update <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* BMI & Weight Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Weight & BMI</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-white">{stats.currentWeight ?? '--'}</span>
              <span className="text-xs text-slate-400 ml-1">kg</span>
              <span className="text-[11px] text-slate-400 block">{stats.height ?? '--'} cm height</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-purple-400 block">{stats.bmi ?? '--'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {stats.bmiCategory || 'Normal'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Healthy range: 18.5 - 24.9</span>
            <button
              onClick={() => navigateTo('bmi')}
              className="text-purple-400 hover:underline font-semibold flex items-center gap-0.5"
            >
              Calculator <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Today's Plan & Quick Workout Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Workout Plan */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {todayPlan.dayName}
                </span>
                <span className="text-xs text-slate-400 font-medium">Focus: {todayPlan.focus}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{todayPlan.title}</h2>
            </div>
            <div className="flex items-center gap-2.5">
              {planExercises.length > 0 && onStartWorkoutSession && (
                <button
                  onClick={() =>
                    onStartWorkoutSession({
                      title: todayPlan.title || `${todayPlan.dayName} Workout`,
                      exercises: planExercises
                    })
                  }
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Start Workout
                </button>
              )}
              <button
                onClick={() => navigateTo('workout-plan')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                View 7-Day Plan <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today's Exercise List */}
          <div className="mt-4 space-y-3">
            {planExercises.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No exercises scheduled for today. Enjoy your rest and recovery!
              </div>
            ) : (
              planExercises.map((ex, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    ex.completed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => handleToggleExercise(ex.name)}
                      className={`p-1 rounded-lg transition-transform active:scale-90 ${
                        ex.completed
                          ? 'text-emerald-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      aria-label="Toggle completed"
                    >
                      {ex.completed ? (
                        <CheckCircle2 className="w-6 h-6 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${ex.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {ex.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                          {ex.muscleGroup}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ex.sets} sets × {ex.reps} • Rest: {ex.rest}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleWatch(ex.name)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition-colors"
                    >
                      Watch Demo
                    </button>
                    {onStartWorkoutSession && (
                      <button
                        onClick={() =>
                          onStartWorkoutSession({
                            title: `${ex.name} Training`,
                            exercises: [ex]
                          })
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
                        title="Start this exercise now"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Start
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Completed:{' '}
              <strong className="text-emerald-400">
                {planExercises.filter(e => e.completed).length}
              </strong>{' '}
              / {planExercises.length} exercises
            </span>
            <button
              onClick={() => navigateTo('workouts')}
              className="text-slate-300 hover:text-white font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Log Custom Workout Session
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Notifications Feed */}
        <div className="space-y-6">
          
          {/* Quick Shortcuts */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Quick Log Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigateTo('patients')}
                className="col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 text-left transition-all hover:border-emerald-400 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white block">Patient Intake Form</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Supabase Live
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 block">Fill medical intake form & store to Supabase</span>
              </button>

              <button
                onClick={() => navigateTo('workouts')}
                className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:border-emerald-500/40 group"
              >
                <Dumbbell className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Log Workout</span>
                <span className="text-[10px] text-slate-400">Sets, reps, kg</span>
              </button>


              <button
                onClick={() => navigateTo('nutrition')}
                className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:border-orange-500/40 group"
              >
                <Flame className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Log Nutrition</span>
                <span className="text-[10px] text-slate-400">Indian & global foods</span>
              </button>

              <button
                onClick={() => navigateTo('water')}
                className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:border-cyan-500/40 group"
              >
                <Droplets className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Water Intake</span>
                <span className="text-[10px] text-slate-400">Track hydration</span>
              </button>

              <button
                onClick={() => navigateTo('progress')}
                className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:border-purple-500/40 group"
              >
                <TrendingUp className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Measurements</span>
                <span className="text-[10px] text-slate-400">Chest, waist, arms</span>
              </button>
            </div>
          </div>

          {/* Active Notifications / Reminders Feed */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Active Alerts & Tips
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Live
              </span>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map(notif => (
                <div
                  key={notif.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300"
                >
                  <div className="flex items-center justify-between font-semibold text-white mb-1">
                    <span>{notif.title}</span>
                    <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{notif.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="py-4 text-center text-slate-500 text-xs">
                  No active alerts. You're up to date!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
