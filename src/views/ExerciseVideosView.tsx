import React, { useState, useEffect } from 'react';
import {
  Video,
  Search,
  Dumbbell,
  Play,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../api';
import { Exercise } from '../types';
import { ExerciseAnimation } from '../components/ExerciseAnimation';

interface ExerciseVideosViewProps {
  onWatchExercise?: (exercise: Exercise) => void;
  onOpenVideoModal?: (exercise: Exercise) => void;
  onStartWorkout?: (exercise: Exercise) => void;
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const MUSCLE_TABS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'];

export const ExerciseVideosView: React.FC<ExerciseVideosViewProps> = ({
  onWatchExercise,
  onOpenVideoModal,
  onStartWorkout,
  showToast
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleWatch = (ex: Exercise) => {
    if (onWatchExercise) onWatchExercise(ex);
    else if (onOpenVideoModal) onOpenVideoModal(ex);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getExercises();
        setExercises(res.exercises);
      } catch (err: any) {
        showToast('error', 'Failed to load exercise video library');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = exercises.filter(ex => {
    const matchesTab = activeTab === 'All' || ex.muscleGroup === activeTab;
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || ex.difficulty === difficultyFilter;
    return matchesTab && matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Exercise Library
            </span>
            <span className="text-xs text-slate-400">Real Human Athlete Demonstrations & Videos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-emerald-400" />
            Exercise Demonstration & Form Library
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real human athlete demonstrations with looping movement cadences, trainer HD video, step-by-step form checkpoints, and injury prevention cues.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-semibold">Difficulty:</span>
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        {/* Muscle Group Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {MUSCLE_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search exercises by name, target muscle, or equipment (e.g. Bench, Squat, Delts)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading exercise animations...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm rounded-3xl bg-slate-900 border border-slate-800">
          No exercises found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(ex => {
            const isExpanded = expandedId === ex.id;
            return (
              <div
                key={ex.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden shadow-xl group hover:shadow-emerald-500/5"
              >
                <div>
                  
                  {/* Embedded Looping Vector Animation Window */}
                  <div
                    onClick={() => handleWatch(ex)}
                    className="relative aspect-video bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden cursor-pointer group/anim border-b border-slate-800/80 flex items-center justify-center p-2"
                  >
                    {/* Live 3D Real Human Animation Loop */}
                    <ExerciseAnimation
                      exerciseName={ex.name}
                      muscleGroup={ex.muscleGroup}
                      cameraView="hero"
                      speed={1}
                      isCompact={true}
                      interactiveControls={false}
                    />

                    {/* Muscle Tag Pill */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-950/85 text-emerald-400 backdrop-blur-xs border border-emerald-500/30">
                        {ex.muscleGroup}
                      </span>
                    </div>

                    {/* Difficulty Tag Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/85 text-cyan-300 backdrop-blur-xs border border-cyan-500/30">
                        {ex.difficulty}
                      </span>
                    </div>

                    {/* Hover demonstration badge overlay */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/anim:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-current" /> Watch Demonstration
                      </div>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {ex.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Dumbbell className="w-3 h-3 text-slate-500" />
                          {ex.equipment}
                        </span>
                      </div>
                    </div>

                    {/* Primary Benefit Summary */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {ex.benefits || ex.instructions[0]}
                    </p>

                    {/* Prescription Metrics Bar */}
                    <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                      <span>
                        Sets: <strong className="text-white">{ex.recommendedSets}</strong>
                      </span>
                      <span>
                        Reps: <strong className="text-white">{ex.recommendedReps}</strong>
                      </span>
                      <span className="text-emerald-400 font-semibold">Rest: {ex.restTime}</span>
                    </div>

                    {/* Expandable Form & Common Mistakes Drawer */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-2.5 animate-fadeIn text-xs">
                        {/* Step-by-Step Instructions */}
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                            Instructions
                          </span>
                          <ol className="space-y-1 list-decimal list-inside text-slate-300 text-[11px] leading-relaxed">
                            {ex.instructions.map((inst, idx) => (
                              <li key={idx} className="truncate">{inst}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Common Mistakes */}
                        {ex.commonMistakes && ex.commonMistakes.length > 0 && (
                          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]">
                            <span className="font-bold flex items-center gap-1 mb-0.5">
                              <AlertTriangle className="w-3 h-3" /> Avoid:
                            </span>
                            <span>{ex.commonMistakes[0]}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle Drawer */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                      className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-200 py-1 flex items-center justify-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>Hide Form Details <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>View Full Form Details <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>

                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 flex gap-2">
                  <button
                    onClick={() => handleWatch(ex)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Watch Demo
                  </button>

                  {onStartWorkout && (
                    <button
                      onClick={() => onStartWorkout(ex)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1 shadow-sm"
                      title="Start Workout with this Exercise"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Start
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
