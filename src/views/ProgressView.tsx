import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Scale,
  Sparkles,
  Layers,
  X,
  Activity
} from 'lucide-react';
import { api } from '../api';
import { BodyMeasurement } from '../types';

interface ProgressViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ showToast }) => {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weight, setWeight] = useState(74);
  const [chest, setChest] = useState(102);
  const [waist, setWaist] = useState(82);
  const [arms, setArms] = useState(37);
  const [thighs, setThighs] = useState(58);
  const [shoulders, setShoulders] = useState(118);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchMeasurements = async () => {
    setLoading(true);
    try {
      const res = await api.getMeasurements();
      setMeasurements(res.measurements);
    } catch (err: any) {
      showToast('error', 'Failed to fetch measurements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addMeasurement({
        weight: Number(weight),
        chest: Number(chest),
        waist: Number(waist),
        arms: Number(arms),
        thighs: Number(thighs),
        shoulders: Number(shoulders),
        date
      });
      showToast('success', 'Body measurement record saved!');
      setIsModalOpen(false);
      fetchMeasurements();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save measurement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteMeasurement(id);
      showToast('success', 'Measurement record deleted');
      fetchMeasurements();
    } catch (err: any) {
      showToast('error', 'Failed to delete record');
    }
  };

  // Latest vs Initial change
  const initialRecord = measurements[0];
  const latestRecord = measurements[measurements.length - 1];
  const weightDelta = latestRecord && initialRecord ? Math.round((latestRecord.weight - initialRecord.weight) * 10) / 10 : 0;
  const waistDelta = latestRecord && initialRecord ? Math.round((latestRecord.waist - initialRecord.waist) * 10) / 10 : 0;
  const armsDelta = latestRecord && initialRecord ? Math.round((latestRecord.arms - initialRecord.arms) * 10) / 10 : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Body Composition & Measurement Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track muscular circumferences, waist-to-hip ratio, and body weight progression
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Log Measurements
        </button>
      </div>

      {/* Delta Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Weight Transformation
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{latestRecord ? latestRecord.weight : '—'} kg</span>
            {weightDelta !== 0 && (
              <span className={`text-xs font-bold ${weightDelta > 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {weightDelta > 0 ? `+${weightDelta} kg` : `${weightDelta} kg`} net
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Since baseline recorded</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Waist Circumference
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{latestRecord ? latestRecord.waist : '—'} cm</span>
            {waistDelta !== 0 && (
              <span className={`text-xs font-bold ${waistDelta < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {waistDelta > 0 ? `+${waistDelta} cm` : `${waistDelta} cm`}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Key marker for visceral fat</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Arm Hypertrophy
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{latestRecord ? latestRecord.arms : '—'} cm</span>
            {armsDelta !== 0 && (
              <span className="text-xs font-bold text-emerald-400">
                {armsDelta > 0 ? `+${armsDelta} cm` : `${armsDelta} cm`}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Biceps & triceps peak growth</span>
        </div>
      </div>

      {/* Visual Trend Chart */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Weight Progression History</h3>
            <p className="text-xs text-slate-400">Chronological measurement checkpoints</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {measurements.length} Records
          </span>
        </div>

        {/* CSS Trend Graphic */}
        <div className="flex items-end justify-between gap-3 h-48 pt-4 px-2">
          {measurements.map((m, idx) => {
            const minW = 60;
            const maxW = 90;
            const heightPercent = Math.max(15, Math.min(100, Math.round(((m.weight - minW) / (maxW - minW)) * 100)));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {m.weight} kg
                </span>
                <div className="w-full bg-slate-800/80 rounded-xl h-full flex flex-col justify-end p-1 overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all duration-500 shadow-md shadow-emerald-500/20"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                  {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Measurements Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Detailed Measurement Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Weight (kg)</th>
                <th className="p-4">Chest (cm)</th>
                <th className="p-4">Waist (cm)</th>
                <th className="p-4">Arms (cm)</th>
                <th className="p-4">Thighs (cm)</th>
                <th className="p-4">Shoulders (cm)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {measurements.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-white whitespace-nowrap">{m.date}</td>
                  <td className="p-4 font-bold text-emerald-400 whitespace-nowrap">{m.weight} kg</td>
                  <td className="p-4 whitespace-nowrap">{m.chest} cm</td>
                  <td className="p-4 whitespace-nowrap">{m.waist} cm</td>
                  <td className="p-4 whitespace-nowrap">{m.arms} cm</td>
                  <td className="p-4 whitespace-nowrap">{m.thighs} cm</td>
                  <td className="p-4 whitespace-nowrap">{m.shoulders} cm</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MEASUREMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Log Body Measurements</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMeasurement} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Body Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chest}
                    onChange={e => setChest(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waist}
                    onChange={e => setWaist(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Arms (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={arms}
                    onChange={e => setArms(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Thighs (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={thighs}
                    onChange={e => setThighs(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shoulders (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={shoulders}
                    onChange={e => setShoulders(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
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
                  {submitting ? 'Saving...' : 'Save Measurements'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
