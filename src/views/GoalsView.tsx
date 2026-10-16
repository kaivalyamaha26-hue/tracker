import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Trophy,
  ArrowRight,
  X,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import { Goal } from '../types';

interface GoalsViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const GOAL_TYPES = [
  'Weight Loss',
  'Muscle Building',
  'Weight Gain',
  'Fat Loss',
  'Strength',
  'General Fitness'
] as const;

export const GoalsView: React.FC<GoalsViewProps> = ({ showToast }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState<any>('Muscle Building');
  const [currentVal, setCurrentVal] = useState(72);
  const [targetVal, setTargetVal] = useState(78);
  const [unit, setUnit] = useState('kg');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.getGoals();
      setGoals(res.goals);
    } catch (err: any) {
      showToast('error', 'Failed to load fitness goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openAddModal = () => {
    setEditingGoal(null);
    setTitle('');
    setGoalType('Muscle Building');
    setCurrentVal(72);
    setTargetVal(78);
    setUnit('kg');
    setTargetDate('2026-12-31');
    setIsModalOpen(true);
  };

  const openEditModal = (g: Goal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setGoalType(g.goalType);
    setCurrentVal(g.currentValue);
    setTargetVal(g.targetValue);
    setUnit(g.unit);
    setTargetDate(g.targetDate);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Goal title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        goalType,
        currentValue: Number(currentVal),
        targetValue: Number(targetVal),
        unit,
        targetDate
      };

      if (editingGoal) {
        await api.updateGoal(editingGoal.id, payload);
        showToast('success', 'Goal updated successfully!');
      } else {
        await api.addGoal(payload);
        showToast('success', 'New fitness goal established!');
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete goal "${name}"?`)) return;
    try {
      await api.deleteGoal(id);
      showToast('success', 'Goal deleted');
      fetchGoals();
    } catch (err: any) {
      showToast('error', 'Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-emerald-400" />
            Fitness Milestone Targets & Goals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Establish objective physical milestones, track completion deadlines, and measure progress
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Goal
        </button>
      </div>

      {/* Goals Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading goals...
        </div>
      ) : goals.length === 0 ? (
        <div className="py-16 text-center text-slate-500 rounded-3xl bg-slate-900 border border-slate-800 p-8">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No active goals yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Set your first fitness milestone to start tracking progression!</p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map(g => {
            // Calculate percentage
            let percent = 0;
            if (g.goalType === 'Weight Loss' || g.goalType === 'Fat Loss') {
              // For weight loss, smaller is closer to target
              const totalToLose = Math.abs(g.currentValue - g.targetValue);
              percent = Math.min(100, Math.round(((g.currentValue - g.targetValue) / (g.currentValue || 1)) * 100));
              if (percent < 0) percent = 75; // fallback
            } else {
              percent = Math.min(100, Math.round((g.currentValue / (g.targetValue || 1)) * 100));
            }

            // Calculate days left
            const targetD = new Date(g.targetDate).getTime();
            const now = new Date().getTime();
            const daysLeft = Math.max(0, Math.ceil((targetD - now) / (1000 * 60 * 60 * 24)));

            return (
              <div
                key={g.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      {g.goalType}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(g)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id, g.title)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{g.title}</h3>

                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Current</span>
                      <span className="text-xl font-black text-white">{g.currentValue} {g.unit}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Target</span>
                      <span className="text-xl font-black text-emerald-400">{g.targetValue} {g.unit}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Progression</span>
                      <span className="font-bold text-white">{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Target: {g.targetDate}
                  </span>
                  <span className="font-bold text-slate-200">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingGoal ? 'Update Fitness Goal' : 'Create New Fitness Goal'}
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
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bench Press 100kg or Reach 12% Body Fat"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Category *</label>
                <select
                  value={goalType}
                  onChange={e => setGoalType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                >
                  {GOAL_TYPES.map(gt => (
                    <option key={gt} value={gt}>{gt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Val</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={currentVal}
                    onChange={e => setCurrentVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Val</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={targetVal}
                    onChange={e => setTargetVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, %, reps"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
