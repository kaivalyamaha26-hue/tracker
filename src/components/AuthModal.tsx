import React, { useState } from 'react';
import { User, Lock, Mail, Phone, Calendar, ArrowRight, ShieldCheck, Dumbbell, Sparkles, CheckCircle, AlertCircle, X, KeyRound, UserCheck } from 'lucide-react';
import { api } from '../api';
import { User as UserType } from '../types';
import { insertPatientToSupabase } from '../lib/supabase';


interface AuthModalProps {
  isOpen?: boolean;
  onSuccess?: (user: UserType) => void;
  onAuthSuccess?: (user: UserType) => void;
  onClose?: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen = true, 
  onSuccess, 
  onAuthSuccess, 
  onClose, 
  initialTab = 'login',
  showToast 
}) => {
  if (isOpen === false) return null;

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('1998-05-15');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Muscle Building');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [availableDays, setAvailableDays] = useState(4);
  const [equipment, setEquipment] = useState('Gym');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleAuthComplete = (user: UserType) => {
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
    if (onSuccess) {
      onSuccess(user);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const res = await api.login(cleanEmail, loginPassword);
      handleAuthComplete(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (type: 'user' | 'admin' | 'kaivalya') => {
    setError(null);
    setLoading(true);
    try {
      let email = 'alex@fitness.com';
      let password = 'user123';
      if (type === 'admin') {
        email = 'admin@fitness.com';
        password = 'admin123';
      } else if (type === 'kaivalya') {
        email = 'kaivalya.maha26@gmail.com';
        password = 'Kaivalya_2006';
      }
      const res = await api.login(email, password);
      handleAuthComplete(res.user);
    } catch (err: any) {
      setError(err.message || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: phone.trim(),
        dob,
        gender,
        height: Number(height) || 175,
        weight: Number(weight) || 70,
        password: regPassword,
        confirmPassword,
        fitnessGoal,
        experienceLevel,
        availableDays: Number(availableDays) || 4,
        equipment
      });

      // Synchronize to Supabase patients table
      insertPatientToSupabase({
        full_name: name.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: phone.trim(),
        dob,
        gender,
        height_cm: Number(height) || 175,
        weight_kg: Number(weight) || 70,
        fitness_goal: fitnessGoal,
        experience_level: experienceLevel,
        available_days: Number(availableDays) || 4,
        equipment_access: equipment,
        notes: 'Registered through user portal'
      }).catch(() => {});

      handleAuthComplete(res.user);
    } catch (err: any) {

      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const res = await api.forgotPassword(cleanEmail, newPassword);
      setSuccessMsg(res.message);
      setTimeout(() => {
        setTab('login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-6">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Decorative Top Accent */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Brand Header */}
        <div className="p-6 pb-4 text-center border-b border-slate-800/80">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/20 mb-3 text-slate-950 font-black">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Personal Fitness Tracker</h2>
          <p className="text-sm text-slate-400 mt-1">Smart workout analytics, meal planning & goal progression</p>
          
          {/* Quick Demo Access Pills */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">1-Click Sign In:</span>
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              disabled={loading}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3 h-3" />
              Athlete Alex
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3 h-3" />
              Coach Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('kaivalya')}
              disabled={loading}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3 h-3" />
              Kaivalya
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              tab === 'login'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              tab === 'register'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setTab('forgot'); setError(null); }}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              tab === 'forgot'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {(error.toLowerCase().includes('no account') || error.toLowerCase().includes('not found')) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRegEmail(loginEmail);
                      setTab('register');
                      setError(null);
                    }}
                    className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline block"
                  >
                    Click here to create an account with this email →
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. kaivalya.maha26@gmail.com or alex@fitness.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Fill suggestions */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quick Credentials Autocomplete:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('alex@fitness.com');
                      setLoginPassword('user123');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px]"
                  >
                    Fill: Alex (user123)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@fitness.com');
                      setLoginPassword('admin123');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px]"
                  >
                    Fill: Coach Admin (admin123)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('kaivalya.maha26@gmail.com');
                      setLoginPassword('Kaivalya_2006');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px]"
                  >
                    Fill: Kaivalya
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM (Full user profile) */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0100"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Physical Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={height}
                    onChange={e => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    step="0.1"
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 text-white text-sm"
                  />
                </div>
              </div>

              {/* Preferences for Personalized Plan Generation (Section 36) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Fitness Goal
                  </label>
                  <select
                    value={fitnessGoal}
                    onChange={e => setFitnessGoal(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  >
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Fat Loss">Fat Loss</option>
                    <option value="Strength">Strength</option>
                    <option value="General Fitness">General Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={e => setExperienceLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Available Days / Week
                  </label>
                  <select
                    value={availableDays}
                    onChange={e => setAvailableDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  >
                    <option value={3}>3 Days</option>
                    <option value={4}>4 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={6}>6 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Equipment Available
                  </label>
                  <select
                    value={equipment}
                    onChange={e => setEquipment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  >
                    <option value="Gym">Commercial Gym</option>
                    <option value="Home Equipment">Home Equipment (Dumbbells/Bands)</option>
                    <option value="No Equipment">No Equipment (Bodyweight)</option>
                  </select>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating Account & Plan...' : 'Create Account & Start Tracking'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your registered account email and specify a new secure password to reset your access immediately.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="your-email@fitness.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        {onClose && (
          <div className="p-4 border-t border-slate-800 text-center bg-slate-950/40">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors"
            >
              Continue exploring as guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
