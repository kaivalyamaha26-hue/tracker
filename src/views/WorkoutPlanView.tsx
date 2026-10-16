import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Play,
  Sparkles,
  Trophy,
  Clock,
  Dumbbell,
  RefreshCw,
  Flame,
  Zap
} from 'lucide-react';
import { api } from '../api';
import { WeeklyWorkoutPlan, DayPlanExercise } from '../types';

interface WorkoutPlanViewProps {
  onWatchDemo?: (exerciseName: string) => void;
  onOpenVideoModal?: (video: any) => void;
  onStartWorkoutSession?: (workout: { title: string; exercises: any[] }) => void;
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const WorkoutPlanView: React.FC<WorkoutPlanViewProps> = ({
  onWatchDemo,
  onOpenVideoModal,
  onStartWorkoutSession,
  showToast
}) => {
  const handleWatch = (name: string) => {
    if (onWatchDemo) onWatchDemo(name);
    else if (onOpenVideoModal) onOpenVideoModal({ name, exerciseName: name });
  };
  const [plan, setPlan] = useState<WeeklyWorkoutPlan | null>(null);
  const [completions, setCompletions] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState(true);
  const [celebrate, setCelebrate] = useState(false);

  // Set today by default
  useEffect(() => {
    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setSelectedDay(dayMap[todayIndex]);
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const res = await api.getPlan();
      setPlan(res.plan);
      setCompletions(res.completions);
    } catch (err: any) {
      showToast('error', 'Failed to load weekly workout plan');
    } finally {
      setLoading(false);
    }
  };

  const isExerciseCompleted = (dayName: string, exerciseName: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return completions.some(
      c => c.dayName === dayName && c.exerciseName === exerciseName && c.date === today
    );
  };

  const handleToggle = async (dayName: string, exerciseName: string) => {
    try {
      const res = await api.togglePlanCompletion(dayName, exerciseName);
      if (res.isCompleted) {
        showToast('success', `Completed: ${exerciseName}! Well done.`);
        // Trigger celebratory animation
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2500);
      } else {
        showToast('info', `Marked ${exerciseName} as incomplete`);
      }
      loadPlan();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update completion');
    }
  };

  if (loading || !plan) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading weekly workout blueprint...
      </div>
    );
  }

  const currentDayPlan = plan.schedule[selectedDay] || {
    title: 'Rest & Recovery',
    focus: 'Mobility & Rest',
    exercises: []
  };

  const completedCount = currentDayPlan.exercises.filter(e =>
    isExerciseCompleted(selectedDay, e.name)
  ).length;
  const isDayFullyCompleted =
    currentDayPlan.exercises.length > 0 &&
    completedCount === currentDayPlan.exercises.length;

  return (
    <div className="space-y-6 animate-fadeIn relative">
      
      {/* Celebration Overlay Effect */}
      {celebrate && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-emerald-500/90 text-slate-950 px-8 py-4 rounded-3xl font-black text-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <Trophy className="w-8 h-8 fill-current" />
            <span>Exercise Completed! Rep by Rep Mastery!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-emerald-400" />
            7-Day Personalized Workout Blueprint
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Systematic day-wise programming customized to your recovery cycle and strength goals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPlan}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh Plan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day Selector Pills (Monday to Sunday) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map(day => {
          const dayData = plan.schedule[day];
          const isSelected = selectedDay === day;
          const exCount = dayData?.exercises?.length || 0;
          const doneCount = dayData?.exercises?.filter(e => isExerciseCompleted(day, e.name)).length || 0;
          const allDone = exCount > 0 && doneCount === exCount;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`p-3 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/60 shadow-lg'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {day}
                </span>
                {allDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : exCount === 0 ? (
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">{doneCount}/{exCount}</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-white block mt-1 truncate">
                {dayData?.title || 'Rest Day'}
              </span>
              <span className="text-[9px] text-slate-500 truncate block">
                {dayData?.focus || 'Rest'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Workout Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        {/* Day Title & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {selectedDay}
              </span>
              <span className="text-xs text-slate-400 font-medium">Focus: {currentDayPlan.focus}</span>
            </div>
            <h2 className="text-2xl font-black text-white">{currentDayPlan.title}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentDayPlan.exercises.length > 0 && onStartWorkoutSession && (
              <button
                onClick={() =>
                  onStartWorkoutSession({
                    title: `${selectedDay} - ${currentDayPlan.title}`,
                    exercises: currentDayPlan.exercises
                  })
                }
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-current" />
                Start Day's Workout ({currentDayPlan.exercises.length} Exercises)
              </button>
            )}

            <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Session Progress</span>
                <span className="text-sm font-extrabold text-white">
                  {completedCount} of {currentDayPlan.exercises.length} Completed
                </span>
              </div>
              {isDayFullyCompleted && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> All Done!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="mt-6 space-y-3.5">
          {currentDayPlan.exercises.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Scheduled Rest & Muscle Recovery</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Muscle tissue repairs and grows during resting periods. Focus on hydration, 8 hours of sleep, and protein synthesis!
              </p>
            </div>
          ) : (
            currentDayPlan.exercises.map((ex, idx) => {
              const completed = isExerciseCompleted(selectedDay, ex.name);
              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                    completed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300 shadow-sm'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggle(selectedDay, ex.name)}
                      className={`p-1 rounded-xl transition-all active:scale-90 ${
                        completed
                          ? 'text-emerald-400'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-7 h-7 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-7 h-7" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                        <h4 className={`text-sm font-bold ${completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {ex.name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-semibold">
                          {ex.muscleGroup}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>
                          <strong className="text-slate-200">{ex.sets}</strong> sets ×{' '}
                          <strong className="text-slate-200">{ex.reps}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          Rest: {ex.rest}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleWatch(ex.name)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Demo Video
                    </button>
                    {onStartWorkoutSession && (
                      <button
                        onClick={() =>
                          onStartWorkoutSession({
                            title: `${ex.name} Training`,
                            exercises: [ex]
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1 shadow-sm"
                        title="Start this exercise in player"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        Start
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
