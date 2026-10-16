import React, { useState, useEffect } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavView } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { VideoModal } from './components/VideoModal';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { WorkoutCompleteModal } from './components/WorkoutCompleteModal';
import { ToastContainer, ToastItem } from './components/Toast';

import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { SqliteDatabaseView } from './views/SqliteDatabaseView';
import { WorkoutsView } from './views/WorkoutsView';

import { ExerciseVideosView } from './views/ExerciseVideosView';
import { WorkoutPlanView } from './views/WorkoutPlanView';
import { DietPlanView } from './views/DietPlanView';
import { NutritionView } from './views/NutritionView';
import { WaterView } from './views/WaterView';
import { StepsView } from './views/StepsView';
import { GoalsView } from './views/GoalsView';
import { ProgressView } from './views/ProgressView';
import { BmiCalculatorView } from './views/BmiCalculatorView';
import { CalorieCalculatorView } from './views/CalorieCalculatorView';
import { ReportsView } from './views/ReportsView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';

import { api } from './api';
import { User, NotificationItem, ExerciseVideo, WorkoutSessionSummary } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  
  // Sidebar Hide / View state with persistence
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('fitness_menu_open');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default open on desktop, closed on small mobile
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<ExerciseVideo | null>(null);

  // Full-Screen Interactive Workout Player State
  const [isWorkoutPlayerOpen, setIsWorkoutPlayerOpen] = useState(false);
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<{
    title: string;
    exercises: any[];
  } | null>(null);

  // Workout Completion Celebration Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSessionSummary | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('fitness_menu_open', String(next));
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to Hide/View Menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const checkCurrentUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      // If token expired or not present, fallback to demo user login so dashboard loads smoothly
      try {
        const demoRes = await api.login('alex@fitness.com', 'user123');
        setUser(demoRes.user);
      } catch (e) {
        setUser(null);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    checkCurrentUser();
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    showToast('info', 'Logged out successfully');
  };

  const handleQuickSwitchUser = async (type: 'user' | 'admin' | 'kaivalya') => {
    try {
      if (type === 'admin') {
        const res = await api.login('admin@fitness.com', 'admin123');
        setUser(res.user);
        showToast('success', 'Switched to Coach Admin (Administrator Account)');
        setCurrentView('admin');
      } else if (type === 'kaivalya') {
        const res = await api.login('kaivalya.maha26@gmail.com', 'Kaivalya_2006');
        setUser(res.user);
        showToast('success', 'Switched to Kaivalya Mahajan Profile');
        if (currentView === 'admin') {
          setCurrentView('dashboard');
        }
      } else {
        const res = await api.login('alex@fitness.com', 'user123');
        setUser(res.user);
        showToast('success', 'Switched to Athlete Alex (Standard User)');
        if (currentView === 'admin') {
          setCurrentView('dashboard');
        }
      }
      fetchNotifications();
    } catch (err: any) {
      showToast('error', 'Failed to switch user account');
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // ignore
    }
  };

  // Launch Workout Player
  const handleStartWorkoutSession = (session: { title: string; exercises: any[] }) => {
    if (!session.exercises || session.exercises.length === 0) {
      showToast('info', 'No exercises found in selected routine');
      return;
    }
    setActiveWorkoutSession(session);
    setIsWorkoutPlayerOpen(true);
  };

  // Handle Workout Complete from Player
  const handleCompleteWorkoutSession = async (summary: WorkoutSessionSummary) => {
    try {
      const res = await api.completeWorkoutSession({
        workoutTitle: summary.workoutTitle,
        durationSeconds: summary.durationSeconds,
        caloriesBurned: summary.caloriesBurned,
        exercises: summary.exercises
      });

      if (res && res.success) {
        setWorkoutSummary({
          ...summary,
          xpEarned: res.xpEarned || summary.xpEarned,
          currentStreak: res.streak || summary.currentStreak
        });
        setIsWorkoutPlayerOpen(false);
        setIsCompleteModalOpen(true);
        showToast('success', 'Workout session logged and rewards applied!');
        fetchNotifications();

        if (user && res.newTotalXp) {
          setUser({
            ...user,
            xp: res.newTotalXp,
            level: res.level,
            streak: res.streak,
            badges: Array.from(new Set([...(user.badges || []), ...(res.newBadges || [])]))
          });
        }
      } else {
        setWorkoutSummary(summary);
        setIsWorkoutPlayerOpen(false);
        setIsCompleteModalOpen(true);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error saving workout session');
      setWorkoutSummary(summary);
      setIsWorkoutPlayerOpen(false);
      setIsCompleteModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Application Navbar with Hide/View Menu button & Supabase Status */}
      <Navbar
        user={user}
        notifications={notifications}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
        onQuickSwitchUser={handleQuickSwitchUser}
        onMarkNotificationRead={handleMarkNotificationRead}
        isSidebarOpen={isSidebarOpen}
        onNavigateToPatients={() => setCurrentView('patients')}
      />

      {/* Main Workspace with Responsive Sidebar and Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Navigation Sidebar (Collapsible with Hide Menu option) */}
        <Sidebar
          currentView={currentView}
          onSelectView={view => {
            setCurrentView(view);
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggleSidebar={toggleSidebar}
        />

        {/* Floating "View Menu" Button when sidebar is hidden */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-2xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 hover:scale-105 active:scale-95 transition-all group"
            title="View Menu (Ctrl+B)"
            aria-label="View Menu"
          >
            <PanelLeftOpen className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span>View Menu</span>
            <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-slate-950/20 text-slate-950">Ctrl+B</kbd>
          </button>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
          {currentView === 'dashboard' && (
            <DashboardView
              user={user}
              onSelectView={setCurrentView}
              onOpenVideoModal={video => setActiveVideo(video)}
              onWatchExercise={name => setActiveVideo({ exerciseName: name, name } as any)}
              onStartWorkoutSession={handleStartWorkoutSession}
              showToast={showToast}
            />
          )}

          {currentView === 'patients' && (
            <PatientsView showToast={showToast} />
          )}

          {currentView === 'sqlite' && (
            <SqliteDatabaseView showToast={showToast} />
          )}

          {currentView === 'workouts' && (

            <WorkoutsView showToast={showToast} />
          )}

          {currentView === 'videos' && (
            <ExerciseVideosView
              onOpenVideoModal={video => setActiveVideo(video)}
              onWatchExercise={exercise => setActiveVideo(exercise as any)}
              onStartWorkout={exercise =>
                handleStartWorkoutSession({
                  title: `${exercise.name} Focus Session`,
                  exercises: [exercise]
                })
              }
              showToast={showToast}
            />
          )}

          {currentView === 'workout-plan' && (
            <WorkoutPlanView
              onOpenVideoModal={video => setActiveVideo(video)}
              onWatchDemo={name => setActiveVideo({ exerciseName: name, name } as any)}
              onStartWorkoutSession={handleStartWorkoutSession}
              showToast={showToast}
            />
          )}

          {currentView === 'diet-plan' && (
            <DietPlanView />
          )}

          {currentView === 'nutrition' && (
            <NutritionView showToast={showToast} />
          )}

          {currentView === 'water' && (
            <WaterView showToast={showToast} />
          )}

          {currentView === 'steps' && (
            <StepsView showToast={showToast} />
          )}

          {currentView === 'goals' && (
            <GoalsView showToast={showToast} />
          )}

          {currentView === 'progress' && (
            <ProgressView showToast={showToast} />
          )}

          {currentView === 'bmi' && (
            <BmiCalculatorView showToast={showToast} />
          )}

          {currentView === 'calories' && (
            <CalorieCalculatorView />
          )}

          {currentView === 'reports' && (
            <ReportsView showToast={showToast} />
          )}

          {currentView === 'profile' && (
            <ProfileView
              user={user}
              onUserUpdate={updated => setUser(updated)}
              showToast={showToast}
            />
          )}

          {currentView === 'admin' && (
            <AdminView
              showToast={showToast}
              onOpenVideoModal={video => setActiveVideo(video)}
            />
          )}
        </main>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={authenticatedUser => {
          setUser(authenticatedUser);
          showToast('success', `Welcome back, ${authenticatedUser.name}!`);
          fetchNotifications();
        }}
        showToast={showToast}
      />

      {/* Global Exercise Video / Interactive Biomechanics Demonstration Modal */}
      <VideoModal
        video={activeVideo}
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        onStartExercise={ex => {
          setActiveVideo(null);
          handleStartWorkoutSession({
            title: `${ex.name} Training`,
            exercises: [ex]
          });
        }}
      />

      {/* FULL-SCREEN INTERACTIVE WORKOUT PLAYER */}
      {isWorkoutPlayerOpen && activeWorkoutSession && (
        <WorkoutPlayer
          workoutTitle={activeWorkoutSession.title}
          exercises={activeWorkoutSession.exercises}
          isOpen={isWorkoutPlayerOpen}
          onClose={() => setIsWorkoutPlayerOpen(false)}
          onCompleteWorkout={handleCompleteWorkoutSession}
          showToast={showToast}
        />
      )}

      {/* WORKOUT COMPLETION CELEBRATION MODAL */}
      <WorkoutCompleteModal
        summary={workoutSummary}
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onViewWorkouts={() => {
          setIsCompleteModalOpen(false);
          setCurrentView('workouts');
        }}
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
