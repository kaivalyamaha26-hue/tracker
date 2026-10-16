import React from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  Video,
  CalendarDays,
  UtensilsCrossed,
  Apple,
  Droplets,
  Footprints,
  Target,
  TrendingUp,
  Calculator,
  Flame,
  FileText,
  User,
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';
import { User as UserType } from '../types';

export type NavView =
  | 'dashboard'
  | 'workouts'
  | 'videos'
  | 'workout-plan'
  | 'diet-plan'
  | 'nutrition'
  | 'water'
  | 'steps'
  | 'goals'
  | 'progress'
  | 'bmi'
  | 'calories'
  | 'reports'
  | 'profile'
  | 'database'
  | 'admin';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  user,
  isOpen,
  onClose
}) => {
  const navItems: { id: NavView; label: string; icon: React.FC<any>; badge?: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'database', label: 'Database Explorer', icon: Database, badge: 'Live DB' },
    { id: 'workouts', label: 'My Workouts', icon: Dumbbell },
    { id: 'videos', label: 'Exercise Videos', icon: Video, badge: 'HD Demos' },
    { id: 'workout-plan', label: 'Workout Plan', icon: CalendarDays },
    { id: 'diet-plan', label: 'Diet Plan', icon: UtensilsCrossed },
    { id: 'nutrition', label: 'Nutrition Tracker', icon: Apple, badge: 'Indian Foods' },
    { id: 'water', label: 'Water Intake', icon: Droplets },
    { id: 'steps', label: 'Step Tracker', icon: Footprints },
    { id: 'goals', label: 'Fitness Goals', icon: Target },
    { id: 'progress', label: 'Progress & Measurements', icon: TrendingUp },
    { id: 'bmi', label: 'BMI Calculator', icon: Calculator },
    { id: 'calories', label: 'Calorie Calculator', icon: Flame },
    { id: 'reports', label: 'Fitness Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, adminOnly: true, badge: 'Admin' }
  ];

  const handleItemClick = (id: NavView) => {
    onSelectView(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-350 ease-in-out flex flex-col justify-between overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Fitness Operations
          </div>

          {navItems.map(item => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null;

            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        item.adminOnly
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Logged in as</span>
              <span className="font-bold text-white truncate max-w-[130px] block">
                {user ? user.name : 'Guest'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {user?.role || 'GUEST'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
