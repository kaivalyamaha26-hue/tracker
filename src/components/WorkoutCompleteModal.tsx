import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Zap, Clock, Dumbbell, CheckCircle2, Award, ArrowRight, Share2 } from 'lucide-react';
import { WorkoutSessionSummary } from '../types';
import { playSound } from '../utils/audio';

interface WorkoutCompleteModalProps {
  summary: WorkoutSessionSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onViewWorkouts?: () => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  summary,
  isOpen,
  onClose,
  onViewWorkouts
}) => {
  useEffect(() => {
    if (isOpen && summary) {
      // Play triumph audio fanfare
      playSound.workoutComplete();

      // Launch multi-stage subtle celebratory confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#10b981', '#34d399', '#38bdf8']
      });
      fire(0.2, {
        spread: 60,
        colors: ['#f59e0b', '#fbbf24', '#10b981']
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        colors: ['#06b6d4', '#10b981']
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45
      });
    }
  }, [isOpen, summary]);

  if (!isOpen || !summary) return null;

  const minutes = Math.floor(summary.durationSeconds / 60);
  const seconds = summary.durationSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 p-6 sm:p-8 my-8 text-center">
        
        {/* Glow backdrop header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-emerald-500/20 blur-3xl -z-10 pointer-events-none" />

        {/* Trophy Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 mb-4 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-emerald-400 fill-emerald-400/20" />
          </div>
        </div>

        {/* Title & Workout Name */}
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block mb-2">
          Workout Complete!
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {summary.workoutTitle || "Today's Session"} Smashed!
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Incredible effort today. All exercises, sets, reps, and calories have been logged to your permanent fitness history.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-left">
          
          {/* Exercises Completed */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Exercises
            </div>
            <div className="text-lg font-black text-white">
              {summary.exercisesCompleted}/{summary.totalExercises}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">100% finished</span>
          </div>

          {/* Calories Burned */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Calories
            </div>
            <div className="text-lg font-black text-white">
              {summary.caloriesBurned} <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold">High burn</span>
          </div>

          {/* Workout Duration */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Duration
            </div>
            <div className="text-lg font-black text-white">
              {timeFormatted}
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold">Focused tempo</span>
          </div>

          {/* XP Earned */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-bold mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> XP Earned
            </div>
            <div className="text-lg font-black text-emerald-400">
              +{summary.xpEarned}
            </div>
            <span className="text-[10px] text-emerald-300 font-semibold">Level booster</span>
          </div>

        </div>

        {/* Streak & Gamification Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">Workout Streak</div>
              <div className="text-base font-black text-white flex items-center gap-1.5">
                {summary.currentStreak} Days Consecutive <span className="text-amber-400">🔥</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1 justify-end">
              <Award className="w-3 h-3" /> Badge Unlocked
            </span>
            <span className="text-xs font-bold text-slate-300">Consistency Master</span>
          </div>
        </div>

        {/* Completed Exercises Summary List */}
        <div className="max-h-40 overflow-y-auto rounded-2xl bg-slate-950/80 border border-slate-800/80 p-3 mb-6 space-y-1.5 text-left text-xs">
          {summary.exercises.map((ex, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white font-semibold">{ex.name}</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {ex.sets} sets × {ex.reps} reps
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            Return to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          {onViewWorkouts && (
            <button
              onClick={() => {
                onClose();
                onViewWorkouts();
              }}
              className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              View Workout Logs
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
