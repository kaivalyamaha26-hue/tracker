import React, { useState, useEffect } from 'react';
import {
  Apple,
  Plus,
  Trash2,
  Search,
  Flame,
  Calendar,
  Sparkles,
  Layers,
  X,
  Check
} from 'lucide-react';
import { api } from '../api';
import { NutritionLog, FoodItem } from '../types';

interface NutritionViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;

export const NutritionView: React.FC<NutritionViewProps> = ({ showToast }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [totals, setTotals] = useState<any>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);

  // Food Library
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodSearch, setFoodSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'library' | 'custom'>('library');
  const [modalMealType, setModalMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Breakfast');

  // Custom Food Form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState(200);
  const [customProtein, setCustomProtein] = useState(15);
  const [customCarbs, setCustomCarbs] = useState(25);
  const [customFat, setCustomFat] = useState(5);
  const [customQty, setCustomQty] = useState('1 serving');
  const [submitting, setSubmitting] = useState(false);

  const fetchNutrition = async () => {
    setLoading(true);
    try {
      const res = await api.getNutrition(selectedDate);
      setLogs(res.logs);
      setTotals(res.totals);
    } catch (err: any) {
      showToast('error', 'Failed to fetch nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await api.getFoods();
      setFoods(res.foods);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [selectedDate]);

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleAddFromLibrary = async (food: FoodItem) => {
    setSubmitting(true);
    try {
      await api.addNutrition({
        foodName: food.name,
        calories: food.calories,
        protein: food.protein,
        carbohydrates: food.carbs,
        fat: food.fat,
        quantity: food.serving,
        mealType: modalMealType,
        date: selectedDate
      });
      showToast('success', `Added "${food.name}" to ${modalMealType}!`);
      setIsModalOpen(false);
      fetchNutrition();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add food');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      showToast('error', 'Food name is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.addNutrition({
        foodName: customName,
        calories: Number(customCalories),
        protein: Number(customProtein),
        carbohydrates: Number(customCarbs),
        fat: Number(customFat),
        quantity: customQty,
        mealType: modalMealType,
        date: selectedDate
      });
      showToast('success', `Logged "${customName}" to ${modalMealType}!`);
      setIsModalOpen(false);
      fetchNutrition();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to log custom food');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await api.deleteNutrition(id);
      showToast('success', `Removed "${name}" from logs`);
      fetchNutrition();
    } catch (err: any) {
      showToast('error', 'Failed to delete food log');
    }
  };

  const filteredFoods = foods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(foodSearch.toLowerCase());
    const matchesCat = filterCategory === 'All' || f.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Daily target assumptions
  const calorieTarget = 2400;
  const proteinTarget = 140;
  const carbsTarget = 260;
  const fatTarget = 65;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Apple className="w-6 h-6 text-emerald-400" />
            Nutrition & Macro Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Precision daily food diary with curated Indian meals and automatic macronutrient analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none text-xs font-semibold"
            />
          </div>

          <button
            onClick={() => {
              setModalMealType('Breakfast');
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Log Meal
          </button>
        </div>
      </div>

      {/* Daily Macro Summary Progress Bars */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">Daily Macro Absorption vs Targets</h2>
          </div>
          <span className="text-xs text-slate-400">
            Consumed: <strong className="text-white">{totals.calories} kcal</strong> / {calorieTarget} kcal target
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
          {/* Calories */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-orange-400">Calories</span>
              <span className="text-slate-300">{totals.calories} / {calorieTarget} kcal</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.calories / calorieTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-400">Protein</span>
              <span className="text-slate-300">{totals.protein}g / {proteinTarget}g</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.protein / proteinTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-cyan-400">Carbohydrates</span>
              <span className="text-slate-300">{totals.carbs}g / {carbsTarget}g</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.carbs / carbsTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-purple-400">Dietary Fats</span>
              <span className="text-slate-300">{totals.fat}g / {fatTarget}g</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.fat / fatTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meals Grouped by Type (Breakfast, Lunch, Dinner, Snacks) */}
      <div className="space-y-4">
        {MEAL_TYPES.map(mealType => {
          const mealLogs = logs.filter(l => l.mealType === mealType);
          const mealCalories = mealLogs.reduce((acc, l) => acc + l.calories, 0);
          const mealProtein = mealLogs.reduce((acc, l) => acc + l.protein, 0);

          return (
            <div
              key={mealType}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between p-4 bg-slate-950/50 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-bold text-white">{mealType}</h3>
                  <span className="text-xs text-slate-400">
                    ({mealLogs.length} items • <strong className="text-orange-400">{mealCalories} kcal</strong> • <strong className="text-emerald-400">{mealProtein}g P</strong>)
                  </span>
                </div>

                <button
                  onClick={() => {
                    setModalMealType(mealType);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to {mealType}
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {mealLogs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No items logged for {mealType}.
                  </div>
                ) : (
                  mealLogs.map(item => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block text-sm">{item.foodName}</span>
                        <span className="text-slate-400 text-[11px]">Serving: {item.quantity}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-slate-300 text-right">
                          <span className="font-bold text-orange-400">{item.calories} kcal</span>
                          <span className="text-emerald-400 font-semibold">{item.protein}g P</span>
                          <span className="text-cyan-400">{item.carbohydrates}g C</span>
                          <span className="text-purple-400">{item.fat}g F</span>
                        </div>

                        <button
                          onClick={() => handleDelete(item.id, item.foodName)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Food Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD MEAL MODAL (Indian Food Library or Custom) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Apple className="w-5 h-5 text-emerald-400" />
                  Log Food to {modalMealType}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select from curated Indian & global nutritional database or enter custom values
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2 my-4 border-b border-slate-800 pb-3">
              <button
                onClick={() => setModalMode('library')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  modalMode === 'library'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Curated Indian Food Library
              </button>
              <button
                onClick={() => setModalMode('custom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  modalMode === 'custom'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Custom Food Entry
              </button>
            </div>

            {/* TAB 1: CURATED FOOD LIBRARY */}
            {modalMode === 'library' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Indian foods (e.g. Poha, Idli, Roti, Dal, Paneer, Rajma, Khichdi)..."
                    value={foodSearch}
                    onChange={e => setFoodSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {filteredFoods.map(food => (
                    <div
                      key={food.id}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{food.name}</span>
                          {food.isIndian && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                              Indian
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Serving: {food.serving}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs">
                          <span className="font-bold text-orange-400 block">{food.calories} kcal</span>
                          <span className="text-[10px] text-slate-400">
                            {food.protein}g P • {food.carbs}g C • {food.fat}g F
                          </span>
                        </div>

                        <button
                          disabled={submitting}
                          onClick={() => handleAddFromLibrary(food)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOM FOOD ENTRY */}
            {modalMode === 'custom' && (
              <form onSubmit={handleAddCustom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Food Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grilled Salmon with Asparagus"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      min="0"
                      value={customCalories}
                      onChange={e => setCustomCalories(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customProtein}
                      onChange={e => setCustomProtein(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customCarbs}
                      onChange={e => setCustomCarbs(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customFat}
                      onChange={e => setCustomFat(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Portion / Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 plate (200g)"
                    value={customQty}
                    onChange={e => setCustomQty(e.target.value)}
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
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    {submitting ? 'Logging...' : 'Save Meal Item'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
