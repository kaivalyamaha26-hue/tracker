import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Calculator,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Apple
} from 'lucide-react';

export const CalorieCalculatorView: React.FC = () => {
  const [age, setAge] = useState(27);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(74);
  const [activity, setActivity] = useState<number>(1.55); // Moderately active default
  const [selectedGoal, setSelectedGoal] = useState<string>('maintenance');

  // 1. Mifflin-St Jeor Formula for BMR:
  // For men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // For women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const bmrBase = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = Math.round(gender === 'Male' ? bmrBase + 5 : bmrBase - 161);

  // 2. TDEE:
  const tdee = Math.round(bmr * activity);

  // Goal Presets
  const GOAL_OPTIONS: Record<string, { label: string; calories: number; desc: string; type: 'loss' | 'gain' | 'maintain' }> = {
    extreme_loss: {
      label: 'Intense Weight Loss',
      calories: tdee - 1000,
      desc: 'Aggressive deficit (~1 kg / week). Requires high protein to minimize muscle catabolism.',
      type: 'loss'
    },
    weight_loss: {
      label: 'Standard Weight Loss',
      calories: tdee - 500,
      desc: 'Optimal clinical recommendation (~0.5 kg / week). Highly sustainable.',
      type: 'loss'
    },
    mild_loss: {
      label: 'Mild Weight Loss',
      calories: tdee - 250,
      desc: 'Gentle deficit (~0.25 kg / week). Ideal for preserving top strength.',
      type: 'loss'
    },
    maintenance: {
      label: 'Maintain Current Weight',
      calories: tdee,
      desc: 'Energy balance to sustain current body weight and metabolic equilibrium.',
      type: 'maintain'
    },
    mild_gain: {
      label: 'Lean Muscle Surplus',
      calories: tdee + 300,
      desc: 'Moderate hyper-caloric surplus (+0.25 kg / week) to optimize lean tissue accrual.',
      type: 'gain'
    },
    fast_gain: {
      label: 'Rapid Bulking Surplus',
      calories: tdee + 500,
      desc: 'Substantial surplus (+0.5 kg / week) for hardgainers or heavy strength phases.',
      type: 'gain'
    }
  };

  const activeTargetCalories = GOAL_OPTIONS[selectedGoal]?.calories || tdee;

  // Macro calculation for active goal:
  // Protein: 2.0g per kg of weight
  const proteinGrams = Math.round(weightKg * 2.0);
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% of total calories
  const fatCalories = Math.round(activeTargetCalories * 0.25);
  const fatGrams = Math.round(fatCalories / 9);

  // Remaining calories go to carbohydrates
  const carbCalories = Math.max(0, activeTargetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(carbCalories / 4);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Flame className="w-6 h-6 text-orange-400" />
          Mifflin-St Jeor Calorie & Macro Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scientifically calculates Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and targeted macronutrients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: User Parameters */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white">Biometric Inputs</h2>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Biological Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('Male')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  gender === 'Male'
                    ? 'bg-orange-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('Female')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  gender === 'Female'
                    ? 'bg-orange-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age (yrs)</label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="240"
                value={heightCm}
                onChange={e => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="35"
                max="250"
                step="0.5"
                value={weightKg}
                onChange={e => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Activity Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Weekly Activity Level (PAL Factor)
            </label>
            <select
              value={activity}
              onChange={e => setActivity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value={1.2}>Sedentary (Little or no exercise)</option>
              <option value={1.375}>Lightly Active (Training 1-3 days/wk)</option>
              <option value={1.55}>Moderately Active (Training 3-5 days/wk)</option>
              <option value={1.725}>Very Active (Hard training 6-7 days/wk)</option>
              <option value={1.9}>Extra Active (Intense athlete training 2x/day)</option>
            </select>
          </div>

          {/* BMR & TDEE Badges */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Basal Metabolic Rate</span>
                <span className="text-xs text-slate-300">Calories burned at complete rest</span>
              </div>
              <span className="text-lg font-black text-white">{bmr} <span className="text-xs text-slate-400 font-normal">kcal</span></span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-orange-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-400 block">TDEE (Total Burn)</span>
                <span className="text-xs text-slate-300">Maintenance energy baseline</span>
              </div>
              <span className="text-xl font-black text-orange-400">{tdee} <span className="text-xs text-slate-400 font-normal">kcal</span></span>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Goal Options & Targeted Macronutrient Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Caloric Goal Cards Selector */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Select Your Caloric Strategy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(GOAL_OPTIONS).map(([key, opt]) => {
                const isSelected = selectedGoal === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedGoal(key)}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/60 shadow-lg'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-orange-400' : 'text-white'}`}>
                        {opt.label}
                      </span>
                      {opt.type === 'loss' ? (
                        <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
                      ) : opt.type === 'gain' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Activity className="w-3.5 h-3.5 text-orange-400" />
                      )}
                    </div>
                    <span className="text-xl font-black text-white block">
                      {opt.calories} <span className="text-xs text-slate-400 font-normal">kcal/day</span>
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Goal Macronutrient Breakdown */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Daily Macronutrient Targets</h3>
                <p className="text-xs text-slate-400">
                  Calculated for <strong className="text-orange-400">{GOAL_OPTIONS[selectedGoal]?.label}</strong> ({activeTargetCalories} kcal)
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                2.0g Protein / kg
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Protein */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Protein</span>
                <span className="text-3xl font-black text-emerald-400">{proteinGrams}g</span>
                <span className="text-xs text-slate-400 block mt-1">
                  {proteinCalories} kcal ({Math.round((proteinCalories / activeTargetCalories) * 100)}%)
                </span>
                <p className="text-[10px] text-slate-500 mt-2">
                  Protects muscle mass during deficit & supplies amino acids for repair.
                </p>
              </div>

              {/* Carbs */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Carbohydrates</span>
                <span className="text-3xl font-black text-cyan-400">{carbGrams}g</span>
                <span className="text-xs text-slate-400 block mt-1">
                  {carbCalories} kcal ({Math.round((carbCalories / activeTargetCalories) * 100)}%)
                </span>
                <p className="text-[10px] text-slate-500 mt-2">
                  Replenishes muscle glycogen and fuels high-intensity performance.
                </p>
              </div>

              {/* Fats */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Dietary Fats</span>
                <span className="text-3xl font-black text-purple-400">{fatGrams}g</span>
                <span className="text-xs text-slate-400 block mt-1">
                  {fatCalories} kcal ({Math.round((fatCalories / activeTargetCalories) * 100)}%)
                </span>
                <p className="text-[10px] text-slate-500 mt-2">
                  Vital for testosterone synthesis, endocrine function & fat-soluble vitamins.
                </p>
              </div>
            </div>

            {/* Macro Visual Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(proteinCalories / activeTargetCalories) * 100}%` }}
                />
                <div
                  className="h-full bg-cyan-500"
                  style={{ width: `${(carbCalories / activeTargetCalories) * 100}%` }}
                />
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${(fatCalories / activeTargetCalories) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                <span className="text-emerald-400">Protein: {Math.round((proteinCalories / activeTargetCalories) * 100)}%</span>
                <span className="text-cyan-400">Carbs: {Math.round((carbCalories / activeTargetCalories) * 100)}%</span>
                <span className="text-purple-400">Fats: {Math.round((fatCalories / activeTargetCalories) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
