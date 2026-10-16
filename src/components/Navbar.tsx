import React, { useState } from 'react';
import {
  Dumbbell,
  Bell,
  LogOut,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Flame,
  ChevronDown,
  UserCheck,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, NotificationItem } from '../types';

interface NavbarProps {
  user: User | null;
  notifications: NotificationItem[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onQuickSwitchUser: (type: 'user' | 'admin' | 'kaivalya') => void;
  onMarkNotificationRead: (id: string) => void;
  isSidebarOpen: boolean;
  onNavigateToPatients?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  notifications,
  onOpenAuth,
  onLogout,
  onToggleSidebar,
  onQuickSwitchUser,
  onMarkNotificationRead,
  isSidebarOpen,
  onNavigateToPatients
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 h-16 gap-2">
        
        {/* Left: Brand & Hide / View Menu Option Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dedicated Hide / View Menu Button */}
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium text-xs transition-all border focus:outline-none ${
              isSidebarOpen
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/70 shadow-xs'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
            }`}
            title={isSidebarOpen ? 'Hide Menu Option (Ctrl+B)' : 'View Menu Option (Ctrl+B)'}
            aria-label={isSidebarOpen ? 'Hide Menu' : 'View Menu'}
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline font-semibold">Hide Menu</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline font-bold text-emerald-300">View Menu</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="hidden min-[480px]:block">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block leading-tight">
                Personal Fitness Tracker
              </span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" />
                Active Training Engine
              </span>
            </div>
          </div>
        </div>

        {/* Center: Supabase Live Database Pill & Quick Role Switch */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Supabase Status Pill */}
          {onNavigateToPatients && (
            <button
              onClick={onNavigateToPatients}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
              title="View Patients in Supabase Database"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Connected</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>
          )}

          {/* Quick Role Switch Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 text-[11px] px-1.5 font-medium">Switch:</span>
            <button
              onClick={() => onQuickSwitchUser('user')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.email === 'alex@fitness.com'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Alex
            </button>
            <button
              onClick={() => onQuickSwitchUser('kaivalya')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.email === 'kaivalya.maha26@gmail.com'
                  ? 'bg-indigo-500 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Kaivalya
            </button>
            <button
              onClick={() => onQuickSwitchUser('admin')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                user?.role === 'ADMIN'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Coach
            </button>
          </div>
        </div>

        {/* Right: Notifications & User Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-4 text-slate-200 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Daily Reminders & Alerts</h4>
                  </div>
                  <span className="text-xs text-slate-400">{notifications.length} alerts</span>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No active reminders</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          n.read
                            ? 'bg-slate-800/30 border-slate-800 text-slate-400'
                            : 'bg-slate-800/80 border-emerald-500/30 text-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-emerald-400 hover:underline font-medium"
                  >
                    Close Reminders
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight truncate max-w-[100px]">{user.name}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${user.role === 'ADMIN' ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="p-3 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Goal: {user.fitnessGoal}
                    </div>
                  </div>

                  <div className="p-1 space-y-1">
                    {/* Toggle Menu in Dropdown */}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onToggleSidebar();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {isSidebarOpen ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                        {isSidebarOpen ? 'Hide Navigation Menu' : 'View Navigation Menu'}
                      </span>
                      <kbd className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">Ctrl+B</kbd>
                    </button>

                    {onNavigateToPatients && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onNavigateToPatients();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Database className="w-4 h-4 text-emerald-400" />
                        Patients (Supabase)
                      </button>
                    )}

                    <button
                      onClick={() => { setShowUserDropdown(false); onOpenAuth(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Switch Account / Sign In
                    </button>

                    <button
                      onClick={() => { setShowUserDropdown(false); onLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-transform active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
