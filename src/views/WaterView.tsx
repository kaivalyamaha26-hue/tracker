import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { WaterLog } from '../types';

interface WaterViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const WaterView: React.FC<WaterViewProps> = ({ showToast }) => {
  const [totalMl, setTotalMl] = useState(0);
  const [goalMl, setGoalMl] = useState(3000);
  const [percentage, setPercentage] = useState(0);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [customAmount, setCustomAmount] = useState(250);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchWater = async () => {
    setLoading(true);
    try {
      const res = await api.getWater();
      setTotalMl(res.totalMl);
      setGoalMl(res.goalMl);
      setPercentage(res.percentage);
      setLogs(res.logs);
    } catch (err: any) {
      showToast('error', 'Failed to fetch hydration metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  const handleAddWater = async (amount: number) => {
    if (amount <= 0) return;
    setSaving(true);
    try {
      await api.addWater(amount);
      showToast('success', `Logged +${amount} ml of clean water!`);
      fetchWater();
    } catch (err: any) {
      showToast('error', 'Failed to log water intake');
    } finally {
      setSaving(false);
    }
  };

  const remainingMl = Math.max(0, goalMl - totalMl);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Droplets className="w-6 h-6 text-cyan-400" />
          Daily Water Hydration Tracker
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Maintain cellular hydration, boost metabolic rate, and accelerate muscle recovery
        </p>
      </div>

      {/* Main Hydration Dashboard Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Water Level Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {/* Animated Wave Fluid Level Container */}
          <div className="relative w-44 h-64 rounded-3xl border-4 border-cyan-500/40 bg-slate-950 overflow-hidden flex flex-col justify-end shadow-inner mb-6">
            <div
              className="w-full bg-gradient-to-t from-cyan-600 via-cyan-500 to-teal-400 transition-all duration-700 ease-out relative"
              style={{ height: `${Math.min(100, percentage)}%` }}
            >
              {/* Subtle top ripple glow */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 animate-pulse" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white drop-shadow-md">{totalMl}</span>
              <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
                of {goalMl} ml
              </span>
              <span className="text-lg font-black text-white mt-1 drop-shadow">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">
              {remainingMl === 0 ? 'Hydration Target Achieved! 💧' : `${remainingMl} ml Remaining Today`}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Recommended daily intake: {Math.round(goalMl / 250)} glasses of water based on your weight and workout intensity.
            </p>
          </div>
        </div>

        {/* Quick Log Controls & Custom Amount */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Quick Log Actions
            </h3>

            {/* Quick Add Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { amount: 250, label: 'Standard Glass', icon: '🥛' },
                { amount: 500, label: 'Small Bottle', icon: '🍶' },
                { amount: 750, label: 'Sports Shaker', icon: '🥤' },
                { amount: 1000, label: '1 Liter Bottle', icon: '💧' }
              ].map(preset => (
                <button
                  key={preset.amount}
                  disabled={saving}
                  onClick={() => handleAddWater(preset.amount)}
                  className="p-4 rounded-2xl bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700/80 hover:border-cyan-500/40 text-left transition-all active:scale-95 group"
                >
                  <span className="text-2xl mb-1 block group-hover:scale-110 transition-transform">
                    {preset.icon}
                  </span>
                  <span className="text-sm font-bold text-white block">+{preset.amount} ml</span>
                  <span className="text-[11px] text-slate-400 block">{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Log Input */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-300">Custom volume:</span>
                <input
                  type="number"
                  min="50"
                  max="3000"
                  step="50"
                  value={customAmount}
                  onChange={e => setCustomAmount(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 text-xs font-bold text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400">ml</span>
              </div>

              <button
                disabled={saving}
                onClick={() => handleAddWater(customAmount)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              >
                Log Custom Intake
              </button>
            </div>
          </div>

          {/* Today's Water History Log */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Today's Intake History
              </h3>
              <span className="text-xs text-slate-500">{logs.length} entries</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No water logged yet today. Take a glass and click +250ml above!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">+{log.amountMl} ml</span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {log.loggedAt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
