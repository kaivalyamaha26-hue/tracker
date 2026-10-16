import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit2,
  Clock,
  Flame,
  X,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../api';
import { Workout } from '../types';

interface WorkoutsViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
  onWatchDemo?: (exerciseName: string) => void;
}

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'];

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ showToast, onWatchDemo }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Form Fields
  const [formExercise, setFormExercise] = useState('');
  const [formMuscle, setFormMuscle] = useState('Chest');
  const [formSets, setFormSets] = useState(3);
  const [formReps, setFormReps] = useState(10);
  const [formWeight, setFormWeight] = useState(60);
  const [formDuration, setFormDuration] = useState(30);
  const [formCalories, setFormCalories] = useState(180);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.getWorkouts({
        muscleGroup: selectedMuscle !== 'All' ? selectedMuscle : undefined,
        exercise: searchQuery || undefined,
        date: filterDate || undefined
      });
      setWorkouts(res.workouts);
    } catch (err: any) {
      showToast('error', 'Failed to fetch workout logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [selectedMuscle, filterDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkouts();
  };

  const openAddModal = () => {
    setEditingWorkout(null);
    setFormExercise('');
    setFormMuscle('Chest');
    setFormSets(3);
    setFormReps(10);
    setFormWeight(60);
    setFormDuration(30);
    setFormCalories(180);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (w: Workout) => {
    setEditingWorkout(w);
    setFormExercise(w.exercise);
    setFormMuscle(w.muscleGroup);
    setFormSets(w.sets);
    setFormReps(w.reps);
    setFormWeight(w.weight);
    setFormDuration(w.duration);
    setFormCalories(w.caloriesBurned);
    setFormDate(w.date);
    setFormNotes(w.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExercise.trim()) {
      showToast('error', 'Exercise name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        exercise: formExercise,
        muscleGroup: formMuscle,
        sets: Number(formSets),
        reps: Number(formReps),
        weight: Number(formWeight),
        duration: Number(formDuration),
        caloriesBurned: Number(formCalories),
        date: formDate,
        notes: formNotes
      };

      if (editingWorkout) {
        await api.updateWorkout(editingWorkout.id, payload);
        showToast('success', 'Workout session updated successfully!');
      } else {
        await api.addWorkout(payload);
        showToast('success', 'New workout session logged successfully!');
      }
      setIsModalOpen(false);
      fetchWorkouts();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save workout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the workout log for "${name}"?`)) {
      return;
    }
    try {
      await api.deleteWorkout(id);
      showToast('success', 'Workout log deleted.');
      fetchWorkouts();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete workout');
    }
  };

  // Aggregated Stats
  const totalSets = workouts.reduce((acc, w) => acc + (w.sets || 0), 0);
  const totalCalories = workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
  const totalDuration = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
  const totalVolume = workouts.reduce((acc, w) => acc + (w.sets * w.reps * (w.weight || 1)), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
            Workout Tracker & History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log sets, reps, weight volume, and track muscular hypertrophy progression
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Log Workout
        </button>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Sets</span>
            <span className="text-xl font-black text-white">{totalSets} sets</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Calories Burned</span>
            <span className="text-xl font-black text-white">{totalCalories} kcal</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Time Trained</span>
            <span className="text-xl font-black text-white">{totalDuration} mins</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Estimated Volume</span>
            <span className="text-xl font-black text-white">{Math.round(totalVolume).toLocaleString()} kg</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        {/* Muscle Group Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1 shrink-0">Muscle:</span>
          {MUSCLE_GROUPS.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
                selectedMuscle === muscle
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/70">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search exercise name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Date:</span>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none text-xs"
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => { setSearchQuery(''); setFilterDate(''); setSelectedMuscle('All'); fetchWorkouts(); }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Workout Logs Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Exercise Name</th>
                <th className="p-4">Muscle Group</th>
                <th className="p-4">Sets × Reps</th>
                <th className="p-4">Weight (kg)</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Calories</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Loading workout logs...
                  </td>
                </tr>
              ) : workouts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No workouts logged matching the selected filters. Click "Log Workout" above to start tracking!
                  </td>
                </tr>
              ) : (
                workouts.map(w => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-medium text-slate-400 whitespace-nowrap">{w.date}</td>
                    <td className="p-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{w.exercise}</span>
                        {onWatchDemo && (
                          <button
                            onClick={() => onWatchDemo(w.exercise)}
                            className="text-[10px] font-bold text-emerald-400 hover:underline bg-emerald-500/10 px-1.5 py-0.5 rounded"
                          >
                            Demo
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                        {w.muscleGroup}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white whitespace-nowrap">
                      {w.sets} sets × {w.reps} reps
                    </td>
                    <td className="p-4 whitespace-nowrap font-medium text-slate-200">
                      {w.weight > 0 ? `${w.weight} kg` : 'Bodyweight'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-400">{w.duration} mins</td>
                    <td className="p-4 whitespace-nowrap font-semibold text-orange-400">
                      {w.caloriesBurned} kcal
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-400">{w.notes || '—'}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(w)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Workout"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.exercise)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 transition-colors"
                          title="Delete Workout"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT WORKOUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingWorkout ? 'Edit Workout Session' : 'Log New Workout'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Exercise Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline Bench Press"
                    value={formExercise}
                    onChange={e => setFormExercise(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Muscle Group *</label>
                  <select
                    value={formMuscle}
                    onChange={e => setFormMuscle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  >
                    {MUSCLE_GROUPS.filter(m => m !== 'All').map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formSets}
                    onChange={e => setFormSets(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formReps}
                    onChange={e => setFormReps(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    step="0.5"
                    value={formWeight}
                    onChange={e => setFormWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={formDuration}
                    onChange={e => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Calories Burned</label>
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    value={formCalories}
                    onChange={e => setFormCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Notes / Form Cues</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Felt strong, RPE 8, increased weight on last set"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  {submitting ? 'Saving...' : editingWorkout ? 'Update Workout' : 'Log Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
