import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Dumbbell,
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react';
import { Exercise } from '../types';
import { ExerciseAnimation, CameraView, AnimationSpeed } from './ExerciseAnimation';

interface VideoModalProps {
  exercise?: Exercise | any | null;
  video?: any | null;
  isOpen?: boolean;
  onClose: () => void;
  onStartExercise?: (exercise: Exercise) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  exercise: propExercise,
  video,
  isOpen = true,
  onClose,
  onStartExercise
}) => {
  const [cameraView, setCameraView] = useState<CameraView>('side');
  const [speed, setSpeed] = useState<AnimationSpeed>(1);
  const [currentStep, setCurrentStep] = useState(0);

  const raw = propExercise || video;
  if (!raw || isOpen === false) return null;

  // Normalize exercise/video structure
  const exercise: Exercise = {
    id: raw.id || 'ex_demo',
    name: raw.name || raw.title || raw.exerciseName || 'Exercise Demonstration',
    muscleGroup: raw.muscleGroup || raw.category || raw.muscle || 'Chest',
    equipment: raw.equipment || 'Standard Gym Equipment',
    difficulty: raw.difficulty || 'Intermediate',
    videoUrl: raw.videoUrl || '',
    thumbnailUrl: raw.thumbnailUrl || '',
    instructions: Array.isArray(raw.instructions)
      ? raw.instructions
      : typeof raw.instructions === 'string'
      ? raw.instructions.split('\n').filter(Boolean)
      : [
          'Adopt stable balanced stance and brace core musculature before lifting.',
          'Execute repetition along natural joint articulation path with strict control.',
          'Maintain constant muscular tension throughout both concentric and eccentric phases.'
        ],
    recommendedSets: String(raw.recommendedSets || raw.sets || '3 - 4 sets'),
    recommendedReps: String(raw.recommendedReps || raw.reps || '10 - 12 reps'),
    restTime: String(raw.restTime || raw.rest || '60 - 90s'),
    benefits: raw.benefits || raw.description || 'Develops targeted muscular strength, explosive power, and joint stability.',
    commonMistakes: Array.isArray(raw.commonMistakes)
      ? raw.commonMistakes
      : [
          'Rushing the eccentric lowering phase',
          'Flaring elbows outward excessively past joint alignment',
          'Arching spine or using body momentum'
        ],
    safetyTips: Array.isArray(raw.safetyTips)
      ? raw.safetyTips
      : [
          'Maintain neutral spine curvature and avoid hyperextension.',
          'Warm up target tendons with light mobility sets before working weight.'
        ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/70 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {exercise.muscleGroup}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {exercise.difficulty}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                {exercise.equipment}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{exercise.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Human Athlete Interactive Exercise Demonstrator */}
        <div className="relative bg-slate-950 h-[380px] sm:h-[420px] flex items-center justify-center overflow-hidden border-b border-slate-800">
          <ExerciseAnimation
            exerciseName={exercise.name}
            muscleGroup={exercise.muscleGroup}
            videoUrl={exercise.videoUrl}
            speed={speed}
            interactiveControls={true}
            onSpeedChange={setSpeed}
          />
        </div>

        {/* Details & Instruction Content */}
        <div className="p-6 space-y-6 max-h-[45vh] overflow-y-auto">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Recommended Sets</span>
              <span className="text-base font-black text-white">{exercise.recommendedSets}</span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-xs text-slate-400 block font-semibold">Target Repetitions</span>
              <span className="text-base font-black text-white">{exercise.recommendedReps}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Optimal Rest</span>
              <span className="text-base font-black text-emerald-400">{exercise.restTime}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Primary Anatomical Focus & Benefits
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{exercise.benefits}</p>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Step-by-Step Biomechanical Execution
            </h4>
            <div className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                    currentStep === idx
                      ? 'bg-slate-800/90 border-emerald-500/40 text-white shadow-sm'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes & Safety Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Common Mistakes */}
            {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Common Mistakes to Avoid
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-200/90">
                  {exercise.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety/Form Tips */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-amber-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Joint Safety & Form Cues
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-200/90">
                {(exercise.safetyTips || [
                  'Keep joints stacked and core braced before moving load.',
                  'Stop sets before technical breakdown occurs.'
                ]).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Footer with Start Practice Option */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Full vector biomechanical kinematics (transparent background)
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              Close
            </button>

            {onStartExercise && (
              <button
                onClick={() => {
                  onClose();
                  onStartExercise(exercise);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                Start Interactive Workout
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
