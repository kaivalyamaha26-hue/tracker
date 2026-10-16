import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Video,
  Database,
  Activity,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Sparkles,
  Server,
  Download
} from 'lucide-react';
import { api } from '../api';
import { ExerciseVideo } from '../types';

interface AdminViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
  onOpenVideoModal?: (video: ExerciseVideo) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ showToast, onOpenVideoModal }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'videos'>('stats');
  const [loading, setLoading] = useState(true);

  // Video Modal for Add/Edit
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ExerciseVideo | null>(null);
  const [vTitle, setVTitle] = useState('');
  const [vCategory, setVCategory] = useState('Chest');
  const [vMuscle, setVMuscle] = useState('Pectorals');
  const [vDifficulty, setVDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [vDuration, setVDuration] = useState('4:15');
  const [vYoutubeId, setVYoutubeId] = useState('');
  const [vDescription, setVDescription] = useState('');
  const [vInstructions, setVInstructions] = useState('');
  const [submittingVideo, setSubmittingVideo] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStats();
      setStats(res.stats);
      setUsers(res.users);

      const vRes = await api.getVideos();
      setVideos(vRes.videos);
    } catch (err: any) {
      showToast('error', 'Admin access restricted or error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.updateUserRole(userId, newRole);
      showToast('success', `User role changed to ${newRole}`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    try {
      await api.deleteUser(userId);
      showToast('success', `User "${name}" has been deleted`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Failed to delete user');
    }
  };

  const openAddVideoModal = () => {
    setEditingVideo(null);
    setVTitle('');
    setVCategory('Chest');
    setVMuscle('Pectorals');
    setVDifficulty('Beginner');
    setVDuration('4:00');
    setVYoutubeId('');
    setVDescription('');
    setVInstructions('1. Set up properly.\n2. Keep core braced.\n3. Complete full range of motion.');
    setIsVideoModalOpen(true);
  };

  const openEditVideoModal = (video: ExerciseVideo) => {
    setEditingVideo(video);
    setVTitle(video.title);
    setVCategory(video.category);
    setVMuscle(video.muscleGroup);
    setVDifficulty(video.difficulty);
    setVDuration(video.duration);
    setVYoutubeId(video.youtubeId);
    setVDescription(video.description);
    setVInstructions(video.instructions.join('\n'));
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vTitle || !vYoutubeId) {
      showToast('error', 'Title and YouTube ID are required');
      return;
    }

    setSubmittingVideo(true);
    try {
      const payload = {
        title: vTitle,
        category: vCategory,
        muscleGroup: vMuscle,
        difficulty: vDifficulty,
        duration: vDuration,
        youtubeId: vYoutubeId,
        thumbnailUrl: `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80`,
        description: vDescription,
        instructions: vInstructions.split('\n').filter(line => line.trim().length > 0)
      };

      if (editingVideo) {
        await api.updateVideo(editingVideo.id, payload);
        showToast('success', `Exercise video "${vTitle}" updated!`);
      } else {
        await api.addVideo(payload);
        showToast('success', `Exercise video "${vTitle}" published!`);
      }
      setIsVideoModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save video');
    } finally {
      setSubmittingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: string, title: string) => {
    if (!window.confirm(`Delete video tutorial "${title}"?`)) return;
    try {
      await api.deleteVideo(videoId);
      showToast('success', `Video "${title}" deleted`);
      fetchAdminData();
    } catch (err: any) {
      showToast('error', 'Failed to delete video');
    }
  };

  const handleBackupExport = () => {
    const backupJson = JSON.stringify({ stats, users, videos, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fitness_Tracker_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'System backup snapshot downloaded!');
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Authenticating administrator telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            System Administrator Control Plane
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global telemetry, registered user access management, and exercise media catalog administration
          </p>
        </div>

        <button
          onClick={handleBackupExport}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-sm flex items-center gap-2 transition-colors active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Export Database Snapshot
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-rose-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          System Telemetry & Health
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-rose-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          User Account Registry ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'videos'
              ? 'bg-rose-500 text-slate-950 font-black shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Exercise Video Library ({videos.length})
        </button>
      </div>

      {/* TAB 1: SYSTEM STATS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Total Registered Users
              </span>
              <span className="text-3xl font-black text-white">{stats.totalUsers}</span>
              <span className="text-[11px] text-emerald-400 block mt-1">Active Accounts</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Workouts Completed
              </span>
              <span className="text-3xl font-black text-emerald-400">{stats.totalWorkouts}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Session Logs</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Exercise Video Library
              </span>
              <span className="text-3xl font-black text-cyan-400">{stats.totalVideos}</span>
              <span className="text-[11px] text-slate-400 block mt-1">High-def Tutorials</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Database Engine
              </span>
              <span className="text-2xl font-black text-white">{stats.dbStatus}</span>
              <span className="text-[11px] text-emerald-400 block mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Persistent Storage Active
              </span>
            </div>
          </div>

          {/* Database Specs & Stack Reference */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Infrastructure & Architecture Specs
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The application engine implements a resilient Express.js REST API with full CORS validation, bcrypt-standard password encryption, token session validation, and atomic JSON schema synchronization. For enterprise SQL migrations, the pre-generated <code className="text-emerald-400 font-mono">database.sql</code> and Python Flask bridge <code className="text-emerald-400 font-mono">app.py</code> are fully bundled and immediately accessible in the workspace root.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Registered User Accounts</h3>
            <span className="text-xs text-slate-400">{users.length} members</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Biometrics</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white whitespace-nowrap">{u.name}</td>
                    <td className="p-4 whitespace-nowrap text-slate-400">{u.email}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-400">
                      {u.height ? `${u.height}cm • ${u.currentWeight}kg` : 'Pending setup'}
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u.id, u.role)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Set as {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete User"
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
      )}

      {/* TAB 3: VIDEO MANAGEMENT (CRUD) */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Manage Exercise Video Catalog
            </h3>
            <button
              onClick={openAddVideoModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Exercise Video
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map(v => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {v.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {v.youtubeId}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm mb-1">{v.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{v.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{v.duration} • {v.difficulty}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditVideoModal(v)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      title="Edit Video"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(v.id, v.title)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                      title="Delete Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT VIDEO MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingVideo ? 'Edit Exercise Video' : 'Add New Exercise Video Tutorial'}
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Exercise Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbell Incline Bench Press"
                  value={vTitle}
                  onChange={e => setVTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={vCategory}
                    onChange={e => setVCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  >
                    {['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Muscle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upper Chest, Triceps"
                    value={vMuscle}
                    onChange={e => setVMuscle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">YouTube ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rT7DgCr-3pg"
                    value={vYoutubeId}
                    onChange={e => setVYoutubeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 5:12"
                    value={vDuration}
                    onChange={e => setVDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={vDifficulty}
                    onChange={e => setVDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={vDescription}
                  onChange={e => setVDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Step-by-Step Instructions (one per line)
                </label>
                <textarea
                  rows={3}
                  value={vInstructions}
                  onChange={e => setVInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVideo}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  {submittingVideo ? 'Saving...' : editingVideo ? 'Update Video' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
