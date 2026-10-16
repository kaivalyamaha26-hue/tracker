import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Flame,
  Apple,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  Clock,
  CheckCircle,
  Award
} from 'lucide-react';

interface MealSlot {
  name: string;
  time: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tips?: string;
}

interface GoalPlan {
  goal: string;
  description: string;
  dailyTarget: { calories: number; protein: number; carbs: number; fat: number };
  meals: MealSlot[];
}

const GOAL_PLANS: Record<string, GoalPlan> = {
  'Muscle Building': {
    goal: 'Muscle Building & Hypertrophy',
    description: 'High-protein diet in a controlled caloric surplus (+300-400 kcal) with balanced complex carbohydrates to fuel heavy resistance training and support muscle protein synthesis.',
    dailyTarget: { calories: 2600, protein: 160, carbs: 310, fat: 75 },
    meals: [
      {
        name: 'Breakfast (Power Fuel)',
        time: '8:00 AM',
        items: ['Oatmeal bowl (80g) with 1 scoop whey protein & sliced banana', '3 Boiled egg whites + 1 whole egg', 'Handful of almonds & walnuts (25g)'],
        calories: 620,
        protein: 42,
        carbs: 72,
        fat: 16,
        tips: 'Consume within 1 hour of waking to stimulate anabolic signaling.'
      },
      {
        name: 'Mid-Morning Snack',
        time: '11:00 AM',
        items: ['Greek yogurt or low-fat paneer (100g) with berries', '1 Slice 100% whole grain toast with peanut butter'],
        calories: 310,
        protein: 22,
        carbs: 30,
        fat: 11
      },
      {
        name: 'Lunch (Clean Indian Macro)',
        time: '1:30 PM',
        items: ['2 Whole wheat rotis or 1.5 cups brown rice', '1 Bowl Rajma Masala or Grilled Chicken breast (150g)', '1 Cup Dal Tadka + large bowl cucumber cucumber salad'],
        calories: 720,
        protein: 48,
        carbs: 85,
        fat: 18,
        tips: 'Hydrate well with 1-2 glasses of water 30 minutes before meal.'
      },
      {
        name: 'Pre/Post Workout Evening Snack',
        time: '5:30 PM',
        items: ['1 Banana with 1 scoop whey in water or roasted chana (50g)', 'Coconut water or black coffee'],
        calories: 280,
        protein: 26,
        carbs: 40,
        fat: 4
      },
      {
        name: 'Dinner (Overnight Recovery)',
        time: '8:30 PM',
        items: ['Palak Paneer (150g) or Tofu stir fry with veggies', '1 Whole wheat roti or 1 bowl dal khichdi', 'Warm turmeric milk before bed (optional)'],
        calories: 670,
        protein: 34,
        carbs: 68,
        fat: 22,
        tips: 'Avoid heavy refined sugars to promote deep restorative sleep.'
      }
    ]
  },
  'Weight Loss': {
    goal: 'Weight Loss & Caloric Deficit',
    description: 'High-satiety, nutrient-dense diet in a mild caloric deficit (-400-500 kcal). Features elevated protein to spare lean muscle and high fiber vegetables to curb appetite.',
    dailyTarget: { calories: 1800, protein: 140, carbs: 170, fat: 50 },
    meals: [
      {
        name: 'Breakfast',
        time: '8:30 AM',
        items: ['Vegetable Poha or Upma (1 bowl, 150g) with squeezed lemon', '2 Boiled eggs or 100g sprouted moong chaat', 'Green tea (unsweetened)'],
        calories: 380,
        protein: 24,
        carbs: 48,
        fat: 9
      },
      {
        name: 'Mid-Morning Snack',
        time: '11:30 AM',
        items: ['1 Apple or Papaya bowl (150g)', 'Handful roasted makhana (fox nuts, 20g)'],
        calories: 160,
        protein: 4,
        carbs: 34,
        fat: 2
      },
      {
        name: 'Lunch',
        time: '1:30 PM',
        items: ['1 Whole wheat multigrain roti', '1 Bowl Yellow Moong Dal Tadka', '150g Paneer/Tofu bhurji or grilled fish', 'Generous green salad with lemon dressing'],
        calories: 520,
        protein: 38,
        carbs: 52,
        fat: 14
      },
      {
        name: 'Evening Snack',
        time: '5:00 PM',
        items: ['Sprouted Moong Chaat (1 bowl) or Black coffee + 30g roasted chana'],
        calories: 190,
        protein: 12,
        carbs: 30,
        fat: 3
      },
      {
        name: 'Dinner',
        time: '8:00 PM',
        items: ['Mixed vegetable & lentil soup bowl (250ml)', 'Grilled chicken breast or sautéed paneer with broccoli & bell peppers (150g)'],
        calories: 450,
        protein: 44,
        carbs: 22,
        fat: 16
      }
    ]
  },
  'Weight Gain': {
    goal: 'Healthy Weight Gain',
    description: 'Nutrient-dense caloric surplus (+500 kcal) rich in wholesome fats, complex carbohydrates, whole grains, nuts, seeds, and quality proteins.',
    dailyTarget: { calories: 2900, protein: 150, carbs: 380, fat: 85 },
    meals: [
      {
        name: 'Breakfast',
        time: '8:00 AM',
        items: ['Banana peanut butter smoothie with whole milk, oats, & whey', '2 Slices whole wheat bread with butter', '2 Boiled eggs'],
        calories: 780,
        protein: 45,
        carbs: 95,
        fat: 26
      },
      {
        name: 'Mid-Morning Snack',
        time: '11:00 AM',
        items: ['Handful of dates, figs, cashews, and almonds (60g)', '1 Glass fresh fruit juice'],
        calories: 360,
        protein: 8,
        carbs: 62,
        fat: 14
      },
      {
        name: 'Lunch',
        time: '1:30 PM',
        items: ['3 Rotis with a dab of desi ghee', '1 Big bowl Paneer butter masala or Chicken curry', '1 Cup rice + Dal', 'Curd (100g)'],
        calories: 880,
        protein: 42,
        carbs: 110,
        fat: 28
      },
      {
        name: 'Evening Snack',
        time: '5:30 PM',
        items: ['Sweet potato chaat or Paneer sandwich', '1 Glass full-cream milk with cocoa'],
        calories: 380,
        protein: 18,
        carbs: 55,
        fat: 12
      },
      {
        name: 'Dinner',
        time: '8:30 PM',
        items: ['Dal Khichdi with vegetables & ghee', 'Paneer tikka or egg curry', 'Mixed vegetable raita'],
        calories: 710,
        protein: 36,
        carbs: 88,
        fat: 22
      }
    ]
  },
  'General Fitness': {
    goal: 'General Health & Vitality',
    description: 'Balanced maintenance diet meeting daily micronutrient, antioxidant, and macronutrient requirements for boundless energy and longevity.',
    dailyTarget: { calories: 2200, protein: 120, carbs: 260, fat: 65 },
    meals: [
      {
        name: 'Breakfast',
        time: '8:00 AM',
        items: ['2 Steamed Idlis with Vegetable Sambar & coconut chutney', '1 Boiled egg or handful of sprouted beans'],
        calories: 420,
        protein: 18,
        carbs: 64,
        fat: 10
      },
      {
        name: 'Mid-Morning',
        time: '11:00 AM',
        items: ['Seasonal fresh fruit (Orange, Guava, or Kiwi)', 'Handful of pumpkin & chia seeds'],
        calories: 180,
        protein: 6,
        carbs: 26,
        fat: 6
      },
      {
        name: 'Lunch',
        time: '1:30 PM',
        items: ['2 Whole wheat rotis', '1 Katori Dal Tadka', '1 Bowl seasonal subzi (Bhindi/Gobi)', 'Fresh vegetable salad'],
        calories: 620,
        protein: 26,
        carbs: 90,
        fat: 16
      },
      {
        name: 'Evening Snack',
        time: '5:00 PM',
        items: ['Roasted Makhana or Bhuna Chana', 'Herbal ginger/tulsi tea'],
        calories: 180,
        protein: 8,
        carbs: 28,
        fat: 4
      },
      {
        name: 'Dinner',
        time: '8:00 PM',
        items: ['Moong Dal Khichdi or Grilled tofu with brown rice', 'Cucumber mint raita'],
        calories: 580,
        protein: 28,
        carbs: 78,
        fat: 14
      }
    ]
  }
};

export const DietPlanView: React.FC = () => {
  const [activeGoal, setActiveGoal] = useState<string>('Muscle Building');
  const plan = GOAL_PLANS[activeGoal] || GOAL_PLANS['Muscle Building'];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
            Personalized Goal-Based Diet Blueprint
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Precision daily meal scheduling tailored with authentic Indian and global nutrition items
          </p>
        </div>

        {/* Goal Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {Object.keys(GOAL_PLANS).map(goalKey => (
            <button
              key={goalKey}
              onClick={() => setActiveGoal(goalKey)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeGoal === goalKey
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {goalKey}
            </button>
          ))}
        </div>
      </div>

      {/* Target Overview Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Protocol: {plan.goal}
            </span>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {plan.description}
            </p>
          </div>

          {/* Daily Macro Targets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Calories</span>
              <span className="text-lg font-black text-white">{plan.dailyTarget.calories}</span>
              <span className="text-[10px] text-orange-400 block">kcal/day</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Protein</span>
              <span className="text-lg font-black text-emerald-400">{plan.dailyTarget.protein}g</span>
              <span className="text-[10px] text-slate-400 block">
                {Math.round((plan.dailyTarget.protein * 4 * 100) / plan.dailyTarget.calories)}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Carbs</span>
              <span className="text-lg font-black text-cyan-400">{plan.dailyTarget.carbs}g</span>
              <span className="text-[10px] text-slate-400 block">
                {Math.round((plan.dailyTarget.carbs * 4 * 100) / plan.dailyTarget.calories)}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Fats</span>
              <span className="text-lg font-black text-purple-400">{plan.dailyTarget.fat}g</span>
              <span className="text-[10px] text-slate-400 block">
                {Math.round((plan.dailyTarget.fat * 9 * 100) / plan.dailyTarget.calories)}%
              </span>
            </div>
          </div>
        </div>

        {/* 5 Meal Slots List */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Structured Daily Meal Slots
          </h3>

          <div className="space-y-4">
            {plan.meals.map((meal, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/50 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{meal.name}</h4>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> Suggested time: {meal.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                    <span className="text-orange-400 font-bold">{meal.calories} kcal</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{meal.protein}g Protein</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-semibold">{meal.carbs}g Carbs</span>
                    <span>•</span>
                    <span className="text-purple-400 font-semibold">{meal.fat}g Fat</span>
                  </div>
                </div>

                <div className="mt-3">
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {meal.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {meal.tips && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{meal.tips}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-amber-300 font-bold">Clinical Nutrition Safety Notice:</strong>
          <p className="leading-relaxed">
            These nutritional meal templates are designed for educational and fitness tracking purposes. Caloric requirements vary based on metabolism, health history, and thyroid profile. Individuals with renal conditions, diabetes, pregnancy, or metabolic disorders should consult a registered dietitian before initiating high-protein or restrictive caloric protocols.
          </p>
        </div>
      </div>
    </div>
  );
};
