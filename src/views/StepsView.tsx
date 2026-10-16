import React, { useState, useEffect } from 'react';
import {
  Footprints,
  Flame,
  Clock,
  Compass,
  TrendingUp,
  Plus,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { StepLog } from '../types';

interface StepsViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const StepsView: React.FC<StepsViewProps> = ({ showToast }) => {
  const [todaySteps, setTodaySteps] = useState(7450);
  const [dailyTarget, setDailyTarget] = useState(10000);
  const [weeklyAverage, setWeeklyAverage] = useState(8200);
  const [history, setHistory] = useState<StepLog[]>([]);
  const [stepInput, setStepInput] = useState(7450);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const res = await api.getSteps();
      setTodaySteps(res.todaySteps);
      setDailyTarget(res.dailyTarget);
      setWeeklyAverage(res.weeklyAverage);
      setHistory(res.history);
      setStepInput(res.todaySteps);
    } catch (err: any) {
      showToast('error', 'Failed to load step metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteps();
  }, []);

  const handleUpdateSteps = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.setSteps(Number(stepInput));
      showToast('success', `Updated today's steps to ${Number(stepInput).toLocaleString()}!`);
      fetchSteps();
    } catch (err: any) {
      showToast('error', 'Failed to update step count');
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickAdd = async (increment: number) => {
    const newVal = todaySteps + increment;
    setStepInput(newVal);
    try {
      await api.setSteps(newVal);
      showToast('success', `Added +${increment.toLocaleString()} steps!`);
      fetchSteps();
    } catch (err: any) {
      showToast('error', 'Failed to update step count');
    }
  };

  const percent = Math.min(100, Math.round((todaySteps / dailyTarget) * 100));
  const distanceKm = Math.round(todaySteps * 0.00075 * 100) / 100;
  const caloriesBurned = Math.round(todaySteps * 0.04);
  const activeMinutes = Math.round(todaySteps / 100);
  const remainingSteps = Math.max(0, dailyTarget - todaySteps);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Footprints className="w-6 h-6 text-emerald-400" />
          Daily Step Activity Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor non-exercise physical activity thermogenesis (NEAT), distance covered, and daily active energy expenditure
        </p>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Today's Step Card with Circular Progress */}
        <div className="md:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Today's Step Progress
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-4xl font-black text-white">{todaySteps.toLocaleString()}</span>
              <span className="text-sm text-slate-400 font-semibold">/ {dailyTarget.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">
              {remainingSteps === 0
                ? 'Goal achieved today! Outstanding persistence.'
                : `${remainingSteps.toLocaleString()} steps remaining to reach your target.`}
            </p>

            {/* Quick add buttons */}
            <div className="pt-2 flex items-center gap-2 justify-center sm:justify-start">
              <button
                onClick={() => handleQuickAdd(1000)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                +1,000 steps
              </button>
              <button
                onClick={() => handleQuickAdd(2500)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                +2,500 steps
              </button>
            </div>
          </div>

          {/* Circle Gauge */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
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
                strokeDasharray={`${percent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{percent}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Target</span>
            </div>
          </div>
        </div>

        {/* Calculated Metrics */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Distance Covered</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-white">{distanceKm}</span>
            <span className="text-xs text-slate-400 ml-1">kilometers</span>
          </div>
          <span className="text-[11px] text-slate-500">Calculated via standard stride distance</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Calories</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-white">{caloriesBurned}</span>
            <span className="text-xs text-slate-400 ml-1">kcal burned</span>
          </div>
          <span className="text-[11px] text-slate-500">~{activeMinutes} mins active walking time</span>
        </div>
      </div>

      {/* Manual Input & Weekly Trend Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Last 7 Days Step Trend</h3>
              <p className="text-xs text-slate-400">Weekly Daily Average: <strong className="text-emerald-400">{weeklyAverage.toLocaleString()} steps</strong></p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              7-Day Cadence
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex items-end justify-between gap-3 h-48 pt-4 px-2">
            {history.slice(-7).map((item, idx) => {
              const heightPercent = Math.min(100, Math.round((item.stepsCount / 12000) * 100));
              const isGoalMet = item.stepsCount >= dailyTarget;
              const dateStr = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.stepsCount.toLocaleString()}
                  </span>
                  <div className="w-full bg-slate-800/80 rounded-xl h-full flex flex-col justify-end p-1 overflow-hidden">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isGoalMet
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                          : 'bg-gradient-to-t from-slate-700 to-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{dateStr}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Update Steps Input Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Update Step Counter</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Sync from your smartwatch, pedometer, or enter manual step count for today.
            </p>

            <form onSubmit={handleUpdateSteps} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Today's Total Steps
                </label>
                <div className="relative">
                  <Footprints className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    step="100"
                    required
                    value={stepInput}
                    onChange={e => setStepInput(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-sm font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                {updating ? 'Updating...' : 'Save Step Count'}
              </button>
            </form>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 mt-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Aim for 7,500 - 10,000 steps daily for optimal cardiometabolic longevity.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
