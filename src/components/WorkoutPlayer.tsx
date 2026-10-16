import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Clock,
  Flame,
  Dumbbell,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  Layers,
  Info
} from 'lucide-react';
import { ExerciseAnimation, CameraView, AnimationSpeed } from './ExerciseAnimation';
import { Exercise, WorkoutSessionSummary } from '../types';
import { playSound } from '../utils/audio';

export interface WorkoutPlayerExercise {
  id?: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string | number;
  rest?: string;
  difficulty?: string;
  equipment?: string;
  instructions?: string[];
  commonMistakes?: string[];
  safetyTips?: string[];
  targetMuscles?: { primary: string[]; secondary: string[] };
}

interface WorkoutPlayerProps {
  workoutTitle: string;
  exercises: WorkoutPlayerExercise[];
  isOpen: boolean;
  onClose: () => void;
  onCompleteWorkout: (summary: WorkoutSessionSummary) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  workoutTitle,
  exercises,
  isOpen,
  onClose,
  onCompleteWorkout,
  showToast
}) => {
  // Navigation & State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [repCount, setRepCount] = useState<number>(12);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'animation' | 'form' | 'mistakes' | 'muscles'>('animation');
  const [confirmExit, setConfirmExit] = useState(false);

  // Biomechanical animation controls
  const [cameraView, setCameraView] = useState<CameraView>('side');
  const [animSpeed, setAnimSpeed] = useState<AnimationSpeed>(1);

  // Overall workout elapsed timer
  const [workoutSeconds, setWorkoutSeconds] = useState(0);

  // Rest timer
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(60);
  const [restInitial, setRestInitial] = useState(60);

  // Completed tracking for summary
  const [loggedSets, setLoggedSets] = useState<Record<number, number>>({}); // exerciseIndex -> sets completed
  const [submitting, setSubmitting] = useState(false);

  const currentExercise = exercises[currentExerciseIndex] || {
    name: 'Push Ups',
    muscleGroup: 'Chest',
    sets: 3,
    reps: 12,
    rest: '60s'
  };

  const totalSetsForCurrent = currentExercise.sets || 3;

  // Initialize rep count when exercise changes
  useEffect(() => {
    if (currentExercise) {
      const parsedReps = parseInt(String(currentExercise.reps), 10);
      setRepCount(isNaN(parsedReps) ? 12 : parsedReps);
      setCurrentSet(1);

      // Parse rest time (e.g. "60s" -> 60, "90-120 sec" -> 90)
      const restMatch = String(currentExercise.rest || '60s').match(/\d+/);
      const seconds = restMatch ? parseInt(restMatch[0], 10) : 60;
      setRestInitial(seconds);
      setRestRemaining(seconds);
    }
  }, [currentExerciseIndex, currentExercise.name]);

  // Overall workout timer interval
  useEffect(() => {
    if (!isOpen || isPaused || isResting) return;
    const interval = setInterval(() => {
      setWorkoutSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPaused, isResting]);

  // Rest countdown timer interval
  useEffect(() => {
    if (!isOpen || !isResting) return;

    const interval = setInterval(() => {
      setRestRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishRest();
          return 0;
        }

        // Sound cue on 3, 2, 1
        if (soundEnabled && prev <= 4 && prev > 1) {
          playSound.countdownTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isResting, soundEnabled, currentExerciseIndex, currentSet]);

  const handleFinishRest = () => {
    if (soundEnabled) {
      playSound.countdownGo();
    }
    setIsResting(false);

    // If we finished the final set of the current exercise
    if (currentSet > totalSetsForCurrent) {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        showToast('info', `Next exercise: ${exercises[currentExerciseIndex + 1].name}`);
      } else {
        // Entire workout finished!
        handleCompleteWorkout();
      }
    }
  };

  // Complete a set
  const handleCompleteSet = () => {
    if (soundEnabled) {
      playSound.setComplete();
    }

    const nextSet = currentSet + 1;
    setLoggedSets(prev => ({
      ...prev,
      [currentExerciseIndex]: Math.max(prev[currentExerciseIndex] || 0, currentSet)
    }));

    if (nextSet <= totalSetsForCurrent) {
      // Move to next set and start rest timer
      setCurrentSet(nextSet);
      setRestRemaining(restInitial);
      setIsResting(true);
      showToast('success', `Set ${currentSet}/${totalSetsForCurrent} complete! Take a breather.`);
    } else {
      // Completed all sets for this exercise!
      showToast('success', `Finished all sets for ${currentExercise.name}!`);
      setRestRemaining(restInitial);
      setIsResting(true);
      setCurrentSet(nextSet); // Marked as beyond total
    }
  };

  // Skip Rest
  const handleSkipRest = () => {
    setIsResting(false);
    setRestRemaining(restInitial);
    if (currentSet > totalSetsForCurrent) {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
      } else {
        handleCompleteWorkout();
      }
    }
  };

  // Adjust Rest Timer
  const handleAdjustRest = (delta: number) => {
    setRestRemaining(prev => Math.max(5, prev + delta));
  };

  // Next Exercise button
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setIsResting(false);
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
    } else {
      handleCompleteWorkout();
    }
  };

  // Previous Exercise button
  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setIsResting(false);
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSet(1);
    }
  };

  // Complete Entire Workout
  const handleCompleteWorkout = async () => {
    setSubmitting(true);
    try {
      const totalExercises = exercises.length;
      let totalCalculatedSets = 0;
      let totalCalculatedReps = 0;

      const exerciseBreakdown = exercises.map((ex, idx) => {
        const setsDone = loggedSets[idx] || ex.sets || 3;
        const repsDone = parseInt(String(ex.reps), 10) || 12;
        totalCalculatedSets += setsDone;
        totalCalculatedReps += setsDone * repsDone;
        return {
          name: ex.name,
          sets: setsDone,
          reps: repsDone,
          completed: true
        };
      });

      // Calculate realistic calorie burn: ~7-9 kcal per minute of active workout
      const durationMins = Math.max(1, Math.round(workoutSeconds / 60));
      const caloriesBurned = Math.round(durationMins * 8.5) + (totalCalculatedSets * 4);
      const xpEarned = totalCalculatedSets * 50 + 250; // 50 XP per set + 250 bonus

      const summary: WorkoutSessionSummary = {
        workoutTitle,
        exercisesCompleted: totalExercises,
        totalExercises,
        totalSets: totalCalculatedSets,
        totalReps: totalCalculatedReps,
        durationSeconds: Math.max(30, workoutSeconds),
        caloriesBurned,
        xpEarned,
        currentStreak: 5, // will be updated by server response
        exercises: exerciseBreakdown
      };

      await onCompleteWorkout(summary);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save workout results');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Format elapsed workout time
  const elapsedMinutes = Math.floor(workoutSeconds / 60);
  const elapsedSecs = workoutSeconds % 60;
  const timeFormatted = `${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSecs.toString().padStart(2, '0')}`;

  // Rest percentage ring calculation
  const restProgressPercent = restInitial > 0 ? (restRemaining / restInitial) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = circumference - (restProgressPercent / 100) * circumference;

  // Instructions, mistakes, tips
  const instructions = currentExercise.instructions || [
    'Adopt proper stance and brace core musculature before lifting.',
    'Initiate movement with full controlled range of motion.',
    'Exhale on the concentric contraction, inhale on the eccentric return.'
  ];

  const commonMistakes = currentExercise.commonMistakes || [
    'Rushing repetitions without controlling the eccentric lowering',
    'Flaring joints outwards past biomechanical alignment',
    'Hyperextending spine or using momentum'
  ];

  const safetyTips = currentExercise.safetyTips || [
    'Keep your wrists and spine in a neutral line throughout.',
    'Breathe continuously; do not perform the Valsalva maneuver on warmups.',
    'Set up safety catch bars when lifting heavy barbell loads.'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none overflow-hidden animate-fadeIn">
      
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirmExit(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Exit Workout"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </span>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-xs">
              {workoutTitle || "Interactive Workout"}
            </h1>
          </div>
        </div>

        {/* Workout Metrics Pill: Elapsed Time & Estimated Burn */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeFormatted}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>~{Math.round(workoutSeconds * 0.14)} kcal</span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Sound On' : 'Mute Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl border transition-colors ${
              isPaused
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isPaused ? 'Resume Workout' : 'Pause Workout'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </header>

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 top-16 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/40">
            <Pause className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Workout Paused</h2>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Take your time. Hydrate and get mentally prepared for the next repetition.
          </p>
          <button
            onClick={() => setIsPaused(false)}
            className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Resume Workout
          </button>
        </div>
      )}

      {/* CONFIRM EXIT MODAL */}
      {confirmExit && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Quit Active Workout?</h3>
            <p className="text-xs text-slate-400 mb-6">
              You are on exercise {currentExerciseIndex + 1} of {exercises.length}. Your progress so far can still be saved to your logs.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmExit(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Keep Going
              </button>
              <button
                onClick={() => {
                  setConfirmExit(false);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all"
              >
                Exit Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN: LARGE BIOMECHANICAL ANIMATION STAGE & REST TIMER */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-[380px]">
          
          {/* Exercise Title Pill Header */}
          <div className="w-full max-w-2xl flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentExercise.muscleGroup}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {currentExercise.difficulty || 'Intermediate'}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" /> {currentExercise.equipment || 'Standard'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentExercise.name}
              </h2>
            </div>

            {/* Set Progression Badges (e.g. Set 1/3) */}
            <div className="text-right">
              <span className="text-xs font-black text-emerald-400 block">
                SET {Math.min(currentSet, totalSetsForCurrent)} OF {totalSetsForCurrent}
              </span>
              <div className="flex items-center gap-1.5 mt-1 justify-end">
                {Array.from({ length: totalSetsForCurrent }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i + 1 < currentSet
                        ? 'w-6 bg-emerald-500'
                        : i + 1 === currentSet
                        ? 'w-8 bg-emerald-400 animate-pulse'
                        : 'w-4 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE REST TIMER OVERLAY */}
          {isResting ? (
            <div className="w-full max-w-lg aspect-square sm:aspect-video rounded-3xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn shadow-2xl relative">
              
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                Rest & Recovery
              </span>

              {/* Circular SVG Progress Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#1e293b"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#10b981"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {restRemaining}s
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">REMAINING</span>
                </div>
              </div>

              {/* Next Up preview */}
              <p className="text-xs text-slate-300 mt-2">
                {currentSet <= totalSetsForCurrent ? (
                  <>Up Next: <span className="text-emerald-400 font-bold">Set {currentSet} of {totalSetsForCurrent}</span> ({repCount} reps)</>
                ) : (
                  <>Next Exercise: <span className="text-emerald-400 font-bold">{exercises[currentExerciseIndex + 1]?.name || 'Final Celebration!'}</span></>
                )}
              </p>

              {/* Rest Adjusters */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={() => handleAdjustRest(-15)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  -15s
                </button>
                <button
                  onClick={() => handleAdjustRest(15)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  +15s
                </button>
                <button
                  onClick={handleSkipRest}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20"
                >
                  Skip Rest <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            /* Real Human Athlete Interactive Exercise Demonstrator */
            <div className="w-full max-w-2xl h-[380px] sm:h-[430px] bg-slate-900/60 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl relative flex items-center justify-center">
              <ExerciseAnimation
                exerciseName={currentExercise.name}
                muscleGroup={currentExercise.muscleGroup}
                videoUrl={currentExercise.videoUrl}
                speed={animSpeed}
                isPlaying={!isPaused}
                interactiveControls={true}
                onSpeedChange={setAnimSpeed}
              />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN / BOTTOM PANEL: INTERACTIVE REPS COUNTER & FORM GUIDANCE */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between shrink-0 p-4 sm:p-6 overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* Set & Rep Counter Tactical Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Repetitions
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  Set {Math.min(currentSet, totalSetsForCurrent)} / {totalSetsForCurrent}
                </span>
              </div>

              {/* Rep Count Stepper */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setRepCount(prev => Math.max(1, prev - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xl font-black text-white flex items-center justify-center transition-transform active:scale-95"
                >
                  -
                </button>

                <div className="text-center">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {repCount}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold block">REPS</span>
                </div>

                <button
                  onClick={() => setRepCount(prev => prev + 1)}
                  className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xl font-black text-white flex items-center justify-center transition-transform active:scale-95"
                >
                  +
                </button>
              </div>

              {/* Big Complete Set Button */}
              <button
                onClick={handleCompleteSet}
                disabled={isResting || submitting}
                className={`w-full mt-4 py-3.5 px-6 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isResting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20 active:scale-[0.98]'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 fill-current" />
                {currentSet === totalSetsForCurrent ? 'Complete Final Set' : `Complete Set ${currentSet}`}
              </button>
            </div>

            {/* Form Guidance Tabs */}
            <div>
              <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('animation')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === 'animation'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Good Form
                </button>
                <button
                  onClick={() => setActiveTab('mistakes')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === 'mistakes'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mistakes
                </button>
                <button
                  onClick={() => setActiveTab('muscles')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === 'muscles'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Muscles
                </button>
              </div>

              {/* Tab 1: Good Form Step-by-Step */}
              {activeTab === 'animation' && (
                <div className="pt-3 space-y-2.5">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Execution Steps
                  </span>
                  {instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 leading-relaxed">{step}</span>
                    </div>
                  ))}

                  {/* Safety Tip Box */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    <span className="font-bold flex items-center gap-1 text-[11px] mb-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Safety & Joint Protection
                    </span>
                    {safetyTips[0]}
                  </div>
                </div>
              )}

              {/* Tab 2: Common Mistakes */}
              {activeTab === 'mistakes' && (
                <div className="pt-3 space-y-2.5">
                  <span className="text-[11px] font-extrabold uppercase text-rose-400 tracking-wider block">
                    Common Mistakes to Avoid
                  </span>
                  {commonMistakes.map((mistake, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 leading-relaxed">{mistake}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Target Muscles */}
              {activeTab === 'muscles' && (
                <div className="pt-3 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Primary Target</span>
                    <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> {currentExercise.muscleGroup}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Synergists & Stabilizers</span>
                    <p className="text-slate-300 leading-relaxed">
                      Core stabilizers, rotator cuff, antagonist stabilizers maintaining pelvic and scapular control throughout the repetition cycle.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* 3. BOTTOM WORKOUT CONTROLS */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
            {/* Previous Exercise */}
            <button
              onClick={handlePrevExercise}
              disabled={currentExerciseIndex === 0}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-300 transition-colors flex items-center gap-1"
            >
              <SkipBack className="w-4 h-4" /> Prev
            </button>

            {/* Skip Exercise */}
            <button
              onClick={handleNextExercise}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Skip
            </button>

            {/* Next Exercise or Complete Workout */}
            {currentExerciseIndex < exercises.length - 1 ? (
              <button
                onClick={handleNextExercise}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold text-white transition-all flex items-center gap-1 shadow-sm"
              >
                Next <SkipForward className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCompleteWorkout}
                disabled={submitting}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20"
              >
                Finish Workout <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
