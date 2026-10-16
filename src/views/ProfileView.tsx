import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Footprints,
  Scale
} from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface ProfileViewProps {
  user: User | null;
  onUserUpdate: (u: User) => void;
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdate, showToast }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age || 27);
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [height, setHeight] = useState(user?.height || 175);
  const [currentWeight, setCurrentWeight] = useState(user?.currentWeight || 74);
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight || 78);
  const [primaryGoal, setPrimaryGoal] = useState(user?.primaryGoal || 'Muscle Building');
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'Moderately Active');
  
  // Target Preferences
  const [stepGoal, setStepGoal] = useState(user?.stepGoal || 10000);
  const [waterGoal, setWaterGoal] = useState(user?.waterGoal || 3000);
  const [calorieGoal, setCalorieGoal] = useState(user?.calorieGoal || 2400);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAge(user.age || 27);
      setGender(user.gender || 'Male');
      setHeight(user.height || 175);
      setCurrentWeight(user.currentWeight || 74);
      setTargetWeight(user.targetWeight || 78);
      setPrimaryGoal(user.primaryGoal || 'Muscle Building');
      setActivityLevel(user.activityLevel || 'Moderately Active');
      setStepGoal(user.stepGoal || 10000);
      setWaterGoal(user.waterGoal || 3000);
      setCalorieGoal(user.calorieGoal || 2400);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        name,
        age: Number(age),
        gender,
        height: Number(height),
        currentWeight: Number(currentWeight),
        targetWeight: Number(targetWeight),
        primaryGoal,
        activityLevel,
        stepGoal: Number(stepGoal),
        waterGoal: Number(waterGoal),
        calorieGoal: Number(calorieGoal)
      });
      onUserUpdate(updated.user);
      showToast('success', 'Profile & Settings updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      showToast('success', 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <UserIcon className="w-6 h-6 text-emerald-400" />
          Athlete Profile & System Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage personal biometric baseline data, targets, security credentials, and preferences
        </p>
      </div>

      {/* Main Profile Form Card */}
      <form onSubmit={handleSaveProfile} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
              {name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{name || 'Athlete'}</h2>
              <span className="text-xs text-slate-400 block">{email}</span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {user?.role === 'admin' ? 'System Administrator' : 'Premium Member'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Biometrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            1. Identity & Physical Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
              <input
                type="number"
                min="12"
                max="100"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="240"
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                step="0.5"
                value={currentWeight}
                onChange={e => setCurrentWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                step="0.5"
                value={targetWeight}
                onChange={e => setTargetWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Fitness Strategy */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            2. Primary Fitness Strategy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Fitness Goal</label>
              <select
                value={primaryGoal}
                onChange={e => setPrimaryGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Muscle Building">Muscle Building & Hypertrophy</option>
                <option value="Weight Loss">Weight Loss & Fat Reduction</option>
                <option value="Weight Gain">Healthy Weight Gain</option>
                <option value="Strength">Strength & Powerlifting</option>
                <option value="General Fitness">General Fitness & Longevity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={e => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Sedentary">Sedentary (desk job, low movement)</option>
                <option value="Lightly Active">Lightly Active (training 1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (training 3-5 days/week)</option>
                <option value="Very Active">Very Active (training 6-7 days/week)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Target Baselines */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            3. Daily Target Baselines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                Daily Step Target
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                step="500"
                value={stepGoal}
                onChange={e => setStepGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Daily Water Target (ml)
              </label>
              <input
                type="number"
                min="500"
                max="10000"
                step="250"
                value={waterGoal}
                onChange={e => setWaterGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Daily Calorie Target (kcal)
              </label>
              <input
                type="number"
                min="1000"
                max="8000"
                step="50"
                value={calorieGoal}
                onChange={e => setCalorieGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Password Management Card */}
      <form onSubmit={handleChangePassword} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <KeyRound className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Security & Password Management</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
          >
            {savingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};
