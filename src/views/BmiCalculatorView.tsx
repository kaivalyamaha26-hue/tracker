import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Scale,
  Save,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import { BmiRecord } from '../types';

interface BmiCalculatorViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const BmiCalculatorView: React.FC<BmiCalculatorViewProps> = ({ showToast }) => {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(74);

  // Imperial inputs
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(9);
  const [weightLbs, setWeightLbs] = useState(163);

  const [history, setHistory] = useState<BmiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getBmiHistory();
      setHistory(res.history);
    } catch (err: any) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Compute active height in cm and weight in kg
  const activeHeightCm = unitMode === 'metric' ? heightCm : Math.round((heightFeet * 30.48 + heightInches * 2.54) * 10) / 10;
  const activeWeightKg = unitMode === 'metric' ? weightKg : Math.round((weightLbs * 0.453592) * 10) / 10;

  // Calculate BMI: weight / (heightInMeters ^ 2)
  const heightInMeters = activeHeightCm / 100;
  const bmiValue = heightInMeters > 0 ? Math.round((activeWeightKg / (heightInMeters * heightInMeters)) * 10) / 10 : 0;

  let bmiCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obesity' = 'Normal';
  let categoryColor = 'text-emerald-400';
  let categoryBg = 'bg-emerald-500/20 border-emerald-500/30';
  let advice = '';

  if (bmiValue < 18.5) {
    bmiCategory = 'Underweight';
    categoryColor = 'text-cyan-400';
    categoryBg = 'bg-cyan-500/20 border-cyan-500/30';
    advice = 'Your weight is below the standard clinical baseline. Consider adopting a controlled caloric surplus (+300-500 kcal) rich in protein and wholesome fats to build lean mass.';
  } else if (bmiValue < 25) {
    bmiCategory = 'Normal';
    categoryColor = 'text-emerald-400';
    categoryBg = 'bg-emerald-500/20 border-emerald-500/30';
    advice = 'You are within the optimal healthy weight range. Maintain regular resistance training and cardiovascular fitness to support metabolic health and body composition.';
  } else if (bmiValue < 30) {
    bmiCategory = 'Overweight';
    categoryColor = 'text-amber-400';
    categoryBg = 'bg-amber-500/20 border-amber-500/30';
    advice = 'Your weight is elevated compared to height. A moderate caloric deficit (-300 to -500 kcal/day) paired with 10,000 steps and weightlifting will encourage gradual, sustainable fat reduction.';
  } else {
    bmiCategory = 'Obesity';
    categoryColor = 'text-rose-400';
    categoryBg = 'bg-rose-500/20 border-rose-500/30';
    advice = 'Elevated BMI is correlated with increased cardiometabolic risks. We recommend speaking with a certified physician or sports dietitian to design a safe, progressive activity regimen.';
  }

  // Ideal weight range for height (BMI 18.5 - 24.9)
  const minIdealWeight = Math.round(18.5 * (heightInMeters * heightInMeters) * 10) / 10;
  const maxIdealWeight = Math.round(24.9 * (heightInMeters * heightInMeters) * 10) / 10;

  // Gauge pointer percent (clamped from 15 to 35 BMI)
  const gaugePercent = Math.max(0, Math.min(100, Math.round(((bmiValue - 15) / 20) * 100)));

  const handleSaveToHistory = async () => {
    setSaving(true);
    try {
      await api.recordBmi(activeHeightCm, activeWeightKg);
      showToast('success', `Saved BMI record (${bmiValue}) to your health history!`);
      fetchHistory();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to record BMI');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-purple-400" />
            Body Mass Index (BMI) Clinical Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standard clinical biometric assessment with unit toggle and continuous telemetry tracking
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setUnitMode('metric')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              unitMode === 'metric'
                ? 'bg-purple-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Metric (cm, kg)
          </button>
          <button
            onClick={() => setUnitMode('imperial')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              unitMode === 'imperial'
                ? 'bg-purple-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Imperial (ft/in, lbs)
          </button>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Input Sliders */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white">Enter Physical Dimensions</h2>

          {unitMode === 'metric' ? (
            <>
              {/* Height Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Height</span>
                  <span className="text-lg font-black text-white">{heightCm} <span className="text-xs text-slate-400 font-normal">cm</span></span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="230"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>120 cm</span>
                  <span>175 cm</span>
                  <span>230 cm</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weight</span>
                  <span className="text-lg font-black text-white">{weightKg} <span className="text-xs text-slate-400 font-normal">kg</span></span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="180"
                  step="0.5"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>35 kg</span>
                  <span>70 kg</span>
                  <span>180 kg</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Imperial Height Inputs */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Height</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Feet</label>
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={heightFeet}
                      onChange={e => setHeightFeet(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Inches</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={e => setHeightInches(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Imperial Weight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weight</span>
                  <span className="text-lg font-black text-white">{weightLbs} <span className="text-xs text-slate-400 font-normal">lbs</span></span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="400"
                  value={weightLbs}
                  onChange={e => setWeightLbs(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Action to save */}
          <button
            disabled={saving}
            onClick={handleSaveToHistory}
            className="w-full py-3 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Recording to Database...' : 'Save Record to History'}
          </button>
        </div>

        {/* Right 2 Cols: Result Gauge, Advice & Ideal Weight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Primary Result Display */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Your Body Mass Index
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-white">{bmiValue}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${categoryBg} ${categoryColor}`}>
                    {bmiCategory}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-right sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Ideal Weight for {activeHeightCm} cm
                </span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {minIdealWeight} kg – {maxIdealWeight} kg
                </span>
              </div>
            </div>

            {/* Visual Color Spectrum Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span className="text-cyan-400">Underweight (&lt;18.5)</span>
                <span className="text-emerald-400">Normal (18.5 - 24.9)</span>
                <span className="text-amber-400">Overweight (25 - 29.9)</span>
                <span className="text-rose-400">Obese (&ge;30)</span>
              </div>

              {/* Gradient Track */}
              <div className="relative h-3 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 via-amber-400 to-rose-500 overflow-hidden">
                {/* Pointer marker */}
              </div>

              {/* Marker pin */}
              <div className="relative h-4">
                <div
                  className="absolute -top-1 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-slate-900 transition-all duration-500 transform -translate-x-1/2"
                  style={{ left: `${gaugePercent}%` }}
                />
              </div>
            </div>

            {/* Personalized Guidance */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs leading-relaxed text-slate-300">
              <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Clinical Interpretation & Coaching Notes
              </h4>
              <p>{advice}</p>
            </div>
          </div>

          {/* Historical Log */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              BMI History Timeline
            </h3>

            {history.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No historical records saved yet. Click "Save Record to History" above!
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium text-slate-400">{item.date}</span>
                      <span className="text-slate-300 font-semibold">{item.height} cm • {item.weight} kg</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.bmi}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-purple-300 border border-slate-700">
                        {item.category}
                      </span>
                    </div>
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
