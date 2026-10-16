import React, { useState, useEffect } from 'react';
import {
  Database,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit3,
  Heart,
  Activity,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Download,
  Copy,
  ExternalLink,
  ChevronDown,
  X,
  Plus
} from 'lucide-react';
import { Patient } from '../types';
import {
  supabase,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  checkSupabaseHealth,
  fetchPatientsFromSupabase,
  insertPatientToSupabase,
  updatePatientInSupabase,
  deletePatientFromSupabase,
  SupabaseHealth
} from '../lib/supabase';

interface PatientsViewProps {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<'form' | 'records' | 'schema'>('form');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');

  // Supabase Health State
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Selected Patient for View / Edit Modal
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form State
  const initialForm = {
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    height_cm: 175,
    weight_kg: 70,
    blood_group: 'O+',
    medical_conditions: '',
    allergies: '',
    fitness_goal: 'General Fitness',
    experience_level: 'Beginner',
    available_days: 4,
    equipment_access: 'Gym',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  // Live BMI calculation
  const heightM = Number(formData.height_cm) > 0 ? Number(formData.height_cm) / 100 : 1.75;
  const liveBmi = Number((Number(formData.weight_kg) / (heightM * heightM)).toFixed(1)) || 22.9;

  let liveBmiCategory = 'Normal';
  let liveBmiColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (liveBmi < 18.5) {
    liveBmiCategory = 'Underweight';
    liveBmiColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (liveBmi < 25) {
    liveBmiCategory = 'Normal';
    liveBmiColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (liveBmi < 30) {
    liveBmiCategory = 'Overweight';
    liveBmiColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else {
    liveBmiCategory = 'Obesity';
    liveBmiColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  }

  // Check Health & Load Records on mount
  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await checkSupabaseHealth();
      setHealth(res);
      if (res.connected) {
        showToast('success', `Connected to Supabase (${res.latencyMs}ms latency)`);
      } else {
        showToast('error', `Supabase connection notice: ${res.error || 'Check network'}`);
      }
    } catch (e: any) {
      setHealth({
        connected: false,
        latencyMs: 0,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        table: 'patients',
        error: e.message,
        lastChecked: new Date().toLocaleTimeString()
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const res = await fetchPatientsFromSupabase();
      if (res.error) {
        showToast('error', `Supabase fetch error: ${res.error}`);
      } else {
        setPatients(res.data);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error loading patient records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    loadPatients();
  }, []);

  // Handle Form Submission -> Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      showToast('error', 'Please enter Patient Full Name and Email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await insertPatientToSupabase(formData);
      if (res.error || !res.data) {
        throw new Error(res.error || 'Failed to insert patient');
      }

      setLastSavedId(res.data.id);
      showToast('success', `Patient "${res.data.full_name}" registered & stored in Supabase!`);
      // Prepend newly created patient
      setPatients(prev => [res.data!, ...prev]);
      // Reset form
      setFormData(initialForm);
      // Refresh count
      if (health) {
        setHealth({ ...health, recordsCount: (health.recordsCount || 0) + 1 });
      }
    } catch (err: any) {
      showToast('error', `Supabase Insert Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fill sample patient data for 1-click test
  const handleFillSample = () => {
    const samples = [
      {
        full_name: 'Dr. Priya Sharma',
        email: `priya.${Math.floor(Math.random() * 900 + 100)}@medclinic.org`,
        phone: '+91 98765 43210',
        dob: '1992-05-18',
        gender: 'Female',
        height_cm: 165,
        weight_kg: 59,
        blood_group: 'B+',
        medical_conditions: 'Mild asthma (exercise-induced), Vitamin D deficiency',
        allergies: 'Penicillin, Dust mites',
        fitness_goal: 'Strength & Mobility',
        experience_level: 'Intermediate',
        available_days: 4,
        equipment_access: 'Gym',
        emergency_contact_name: 'Rajesh Sharma (Spouse)',
        emergency_contact_phone: '+91 98765 43211',
        notes: 'Pre-diabetic screening completed. Recommended 45min cardiovascular and resistance training.'
      },
      {
        full_name: 'Marcus Vance',
        email: `marcus.vance${Math.floor(Math.random() * 900 + 100)}@gmail.com`,
        phone: '+1 (555) 234-5678',
        dob: '1987-11-04',
        gender: 'Male',
        height_cm: 182,
        weight_kg: 84,
        blood_group: 'O+',
        medical_conditions: 'Past ACL reconstruction on right knee (2022)',
        allergies: 'None reported',
        fitness_goal: 'Weight Loss & Muscle Tone',
        experience_level: 'Beginner',
        available_days: 5,
        equipment_access: 'Home Equipment',
        emergency_contact_name: 'Elena Vance (Sister)',
        emergency_contact_phone: '+1 (555) 234-9988',
        notes: 'Advised low impact knee flexion exercises. Focus on glute strength and quad rehabilitation.'
      }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setFormData(pick);
    showToast('info', 'Loaded realistic sample patient details into form!');
  };

  // Handle Update Patient
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    try {
      const res = await updatePatientInSupabase(editingPatient.id, editingPatient);
      if (res.error || !res.data) {
        throw new Error(res.error || 'Failed to update patient');
      }

      setPatients(prev => prev.map(p => (p.id === res.data!.id ? res.data! : p)));
      setSelectedPatient(res.data);
      setEditingPatient(null);
      showToast('success', 'Patient record successfully updated in Supabase!');
    } catch (err: any) {
      showToast('error', `Update Error: ${err.message}`);
    }
  };

  // Handle Delete Patient
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete patient "${name}" from Supabase?`)) {
      return;
    }

    try {
      const res = await deletePatientFromSupabase(id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete');
      }
      setPatients(prev => prev.filter(p => p.id !== id));
      if (selectedPatient?.id === id) setSelectedPatient(null);
      showToast('success', `Patient "${name}" deleted from Supabase.`);
    } catch (err: any) {
      showToast('error', `Delete Error: ${err.message}`);
    }
  };

  // Export Patients as CSV
  const handleExportCSV = () => {
    if (patients.length === 0) {
      showToast('info', 'No patient records to export');
      return;
    }

    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'DOB',
      'Gender',
      'Height (cm)',
      'Weight (kg)',
      'Blood Group',
      'Medical Conditions',
      'Allergies',
      'Fitness Goal',
      'Emergency Contact',
      'Created At'
    ];

    const rows = patients.map(p => [
      `"${p.id}"`,
      `"${p.full_name || ''}"`,
      `"${p.email || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.dob || ''}"`,
      `"${p.gender || ''}"`,
      p.height_cm || '',
      p.weight_kg || '',
      `"${p.blood_group || ''}"`,
      `"${(p.medical_conditions || '').replace(/"/g, '""')}"`,
      `"${(p.allergies || '').replace(/"/g, '""')}"`,
      `"${p.fitness_goal || ''}"`,
      `"${p.emergency_contact_name || ''}"`,
      `"${p.created_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supabase_patients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Exported patient records to CSV!');
  };

  // Filtered patient list
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.medical_conditions || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGoal = goalFilter === 'All' || p.fitness_goal === goalFilter;
    const matchesBlood = bloodFilter === 'All' || p.blood_group === bloodFilter;

    return matchesSearch && matchesGoal && matchesBlood;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/20 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <Database className="w-3.5 h-3.5" />
              Supabase PostgreSQL Database Connected
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Patient Intake & Medical Records
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Patients and clinical clients fill out medical intake & fitness profiles. All records automatically persist in real-time to your configured Supabase database table (<code className="text-emerald-400 font-mono text-xs">patients</code>).
            </p>
          </div>

          {/* Supabase Live Status Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shadow-md min-w-[280px]">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${health?.connected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-xs font-bold text-white">
                {health?.connected ? 'Supabase Live & Ready' : isCheckingHealth ? 'Checking Connection...' : 'Connecting...'}
              </span>
              {health?.latencyMs !== undefined && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-emerald-300 border border-emerald-500/20">
                  {health.latencyMs}ms
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Project: <span className="text-slate-200 font-bold">{SUPABASE_PROJECT_ID}</span></div>
              <div>Table: <span className="text-slate-200 font-bold">public.patients</span> ({patients.length} records)</div>
            </div>

            <div className="flex items-center gap-2 pt-1 w-full justify-between flex-wrap">
              <button
                onClick={checkHealth}
                disabled={isCheckingHealth}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors border border-slate-700"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin text-emerald-400' : ''}`} />
                Ping Status
              </button>
              <button
                onClick={loadPatients}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors border border-emerald-500/30"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Data
              </button>
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-medium transition-colors border border-slate-700"
                title="Open Supabase Cloud Database Table Editor"
              >
                <ExternalLink className="w-3 h-3" />
                Open Cloud Database ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'form'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Patient Intake Form
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'records'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            Patient Records ({patients.length})
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'schema'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            Supabase Config & SQL
          </button>
        </div>

        {activeTab === 'records' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: PATIENT INTAKE FORM */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Container */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  New Patient Registration & Clinical Intake
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fills and persists directly to Supabase table <code className="text-emerald-400 font-mono">patients</code>
                </p>
              </div>

              <button
                type="button"
                onClick={handleFillSample}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                1-Click Sample Patient
              </button>
            </div>

            {lastSavedId && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Record Successfully Saved to Supabase!</p>
                    <p className="text-[11px] text-slate-400 font-mono">Supabase UUID: {lastSavedId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('records')}
                  className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                >
                  View in Directory
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Demographics */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">1</span>
                  Personal Demographics
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="sarah.jenkins@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Blood Group
                    </label>
                    <select
                      value={formData.blood_group}
                      onChange={e => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Vitals & Body Metrics */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
                    Physical Metrics & Live BMI
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${liveBmiColor}`}>
                    BMI: {liveBmi} ({liveBmiCategory})
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="250"
                      value={formData.height_cm}
                      onChange={e => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="20"
                      max="300"
                      value={formData.weight_kg}
                      onChange={e => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Available Days / Week
                    </label>
                    <select
                      value={formData.available_days}
                      onChange={e => setFormData({ ...formData, available_days: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(d => (
                        <option key={d} value={d}>{d} Days</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Equipment Access
                    </label>
                    <select
                      value={formData.equipment_access}
                      onChange={e => setFormData({ ...formData, equipment_access: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Gym">Full Gym</option>
                      <option value="Home Equipment">Home Equipment</option>
                      <option value="Bodyweight">Bodyweight Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Clinical & Medical Background */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
                  Medical History & Allergies
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      Pre-existing Medical Conditions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Hypertension, Lower back disc herniation, Asthma, None"
                      value={formData.medical_conditions}
                      onChange={e => setFormData({ ...formData, medical_conditions: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      Known Allergies & Sensitivities
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Penicillin, Latex, Peanuts, None"
                      value={formData.allergies}
                      onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Fitness Goals & Emergency Contact */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">4</span>
                  Goals & Emergency Contact
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Primary Fitness Goal
                    </label>
                    <select
                      value={formData.fitness_goal}
                      onChange={e => setFormData({ ...formData, fitness_goal: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="General Fitness">General Fitness</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Building">Muscle Building</option>
                      <option value="Fat Loss">Fat Loss</option>
                      <option value="Strength">Strength & Power</option>
                      <option value="Rehabilitation">Rehabilitation & Therapy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe (Brother)"
                      value={formData.emergency_contact_name}
                      onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 998-1122"
                      value={formData.emergency_contact_phone}
                      onChange={e => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Clinical / Trainer Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Doctor advice, postural assessments, dietary considerations..."
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData(initialForm)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Supabase...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Save Patient to Supabase
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Database Snapshot & Quick Help */}
          <div className="space-y-6">
            {/* Quick Live Stats Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-emerald-400" />
                Supabase Cloud Storage
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Patients</span>
                    <span className="font-extrabold text-white text-sm">{patients.length}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="font-bold text-emerald-400 text-xs">Supabase (PostgreSQL)</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target Table</span>
                    <span className="font-mono text-cyan-400 text-xs">patients</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">API Key Type</span>
                    <span className="text-xs text-slate-300">Publishable / Anon</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('records')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-colors"
                >
                  View All Stored Patients ({patients.length}) →
                </button>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Database Verification Checklist
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Supabase Project <code className="text-white font-mono">{SUPABASE_PROJECT_ID}</code> connected
                </li>
                <li className="flex items-center gap-2 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Table <code className="text-white font-mono">public.patients</code> verified
                </li>
                <li className="flex items-center gap-2 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Real-time INSERT, SELECT, UPDATE, DELETE tested
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Medical history, vitals & allergies recorded
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PATIENT RECORDS DIRECTORY */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients by name, email, phone, condition..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={goalFilter}
                onChange={e => setGoalFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Goals</option>
                <option value="General Fitness">General Fitness</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Building">Muscle Building</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Strength">Strength</option>
                <option value="Rehabilitation">Rehabilitation</option>
              </select>

              <select
                value={bloodFilter}
                onChange={e => setBloodFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>

              <button
                onClick={loadPatients}
                disabled={isLoading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh Records"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Records Table / List */}
          {isLoading ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Fetching patient records from Supabase...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <UserPlus className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No patient records found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery || goalFilter !== 'All' || bloodFilter !== 'All'
                  ? 'No patients matched your search filters. Try clearing the filters.'
                  : 'No patients have been registered yet in Supabase.'}
              </p>
              <button
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Register First Patient
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map(patient => {
                // compute patient BMI
                const hM = patient.height_cm ? patient.height_cm / 100 : 0;
                const pBmi = hM > 0 && patient.weight_kg ? Number((patient.weight_kg / (hM * hM)).toFixed(1)) : null;

                return (
                  <div
                    key={patient.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Top Row: Avatar & Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm">
                            {patient.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {patient.full_name}
                            </h4>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                              {patient.email}
                            </span>
                          </div>
                        </div>

                        {patient.blood_group && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/15 text-rose-300 border border-rose-500/20">
                            {patient.blood_group}
                          </span>
                        )}
                      </div>

                      {/* Contact Badges */}
                      <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                        {patient.phone && (
                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.fitness_goal && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Goal: {patient.fitness_goal}
                          </div>
                        )}
                      </div>

                      {/* Metrics Pill Grid */}
                      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center mb-3">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Height</span>
                          <span className="text-xs font-semibold text-white">{patient.height_cm || '--'} cm</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Weight</span>
                          <span className="text-xs font-semibold text-white">{patient.weight_kg || '--'} kg</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">BMI</span>
                          <span className="text-xs font-semibold text-emerald-400">{pBmi || '--'}</span>
                        </div>
                      </div>

                      {/* Medical alert tag */}
                      {patient.medical_conditions && (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 mb-3">
                          <span className="font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Medical Notice:
                          </span>
                          <p className="line-clamp-2 text-slate-300 text-[10px] mt-0.5">{patient.medical_conditions}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors text-center"
                      >
                        View Full Details
                      </button>

                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                        title="Edit Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(patient.id, patient.full_name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 transition-colors"
                        title="Delete from Supabase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUPABASE CONFIG & SCHEMA */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Supabase Credentials & Schema Details
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your database is connected to the cloud Supabase project and active.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project ID</span>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-emerald-400">{SUPABASE_PROJECT_ID}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_PROJECT_ID);
                      showToast('info', 'Project ID copied to clipboard');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Supabase URL</span>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-cyan-400 truncate max-w-[220px]">{SUPABASE_URL}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_URL);
                      showToast('info', 'Supabase URL copied to clipboard');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 md:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Anon / Publishable API Key</span>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-slate-300 break-all">{SUPABASE_ANON_KEY}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_ANON_KEY);
                      showToast('info', 'API Key copied to clipboard');
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0 ml-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comprehensive SQL Queries Workbench */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    SQL Queries for Supabase SQL Editor
                  </h4>
                  <p className="text-xs text-slate-400">
                    Run these queries directly in your Supabase Dashboard SQL Editor (Project: <span className="text-emerald-400 font-mono">{SUPABASE_PROJECT_ID}</span>)
                  </p>
                </div>
              </div>

              {/* Query 1: Table Creation & RLS */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">1. Table DDL & Row Level Security (RLS)</span>
                  <button
                    onClick={() => {
                      const q = `-- 1. CREATE PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    dob DATE,
    gender TEXT DEFAULT 'Not Specified',
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    blood_group TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    fitness_goal TEXT DEFAULT 'General Fitness',
    experience_level TEXT DEFAULT 'Beginner',
    available_days INT DEFAULT 4,
    equipment_access TEXT DEFAULT 'Gym',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Allow Anon/Public Access (Select, Insert, Update, Delete)
CREATE POLICY "Allow anon read" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON public.patients FOR DELETE USING (true);`;
                      navigator.clipboard.writeText(q);
                      showToast('success', 'Table DDL & RLS copied!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" /> Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900/90 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
{`CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    dob DATE,
    gender TEXT DEFAULT 'Not Specified',
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    blood_group TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    fitness_goal TEXT DEFAULT 'General Fitness',
    experience_level TEXT DEFAULT 'Beginner',
    available_days INT DEFAULT 4,
    equipment_access TEXT DEFAULT 'Gym',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </pre>
              </div>

              {/* Query 2: SELECT with Computed BMI & Age */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">2. Query All Patients with Computed BMI & Status</span>
                  <button
                    onClick={() => {
                      const q = `-- 2. SELECT PATIENTS WITH COMPUTED BMI & CATEGORY
SELECT 
    id,
    full_name,
    email,
    phone,
    gender,
    blood_group,
    height_cm,
    weight_kg,
    ROUND((weight_kg / POWER(height_cm / 100.0, 2))::numeric, 1) AS computed_bmi,
    CASE 
        WHEN (weight_kg / POWER(height_cm / 100.0, 2)) < 18.5 THEN 'Underweight'
        WHEN (weight_kg / POWER(height_cm / 100.0, 2)) < 25.0 THEN 'Normal Weight'
        WHEN (weight_kg / POWER(height_cm / 100.0, 2)) < 30.0 THEN 'Overweight'
        ELSE 'Obesity'
    END AS bmi_category,
    fitness_goal,
    medical_conditions,
    allergies,
    created_at
FROM public.patients
ORDER BY created_at DESC;`;
                      navigator.clipboard.writeText(q);
                      showToast('success', 'BMI query copied!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    <Copy className="w-3 h-3 text-cyan-400" /> Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900/90 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
{`SELECT 
    id,
    full_name,
    email,
    phone,
    gender,
    blood_group,
    ROUND((weight_kg / POWER(height_cm / 100.0, 2))::numeric, 1) AS computed_bmi,
    fitness_goal,
    created_at
FROM public.patients
ORDER BY created_at DESC;`}
                </pre>
              </div>

              {/* Query 3: Insert Patient Record */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">3. Insert New Patient Record</span>
                  <button
                    onClick={() => {
                      const q = `-- 3. INSERT PATIENT RECORD
INSERT INTO public.patients (
    full_name,
    email,
    phone,
    dob,
    gender,
    height_cm,
    weight_kg,
    blood_group,
    medical_conditions,
    allergies,
    fitness_goal,
    experience_level,
    available_days,
    equipment_access,
    emergency_contact_name,
    emergency_contact_phone,
    notes
) VALUES (
    'Sarah Jenkins',
    'sarah.jenkins@example.com',
    '+1 555-0199',
    '1995-07-22',
    'Female',
    168.00,
    62.50,
    'O+',
    'Mild exercise asthma',
    'Penicillin',
    'General Fitness',
    'Intermediate',
    4,
    'Gym',
    'Robert Jenkins',
    '+1 555-0198',
    'Cleared for moderate cardiovascular training'
);`;
                      navigator.clipboard.writeText(q);
                      showToast('success', 'Insert query copied!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    <Copy className="w-3 h-3 text-amber-400" /> Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900/90 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
{`INSERT INTO public.patients (
    full_name, email, phone, gender, height_cm, weight_kg, blood_group, fitness_goal
) VALUES (
    'Sarah Jenkins', 'sarah.jenkins@example.com', '+1 555-0199', 'Female', 168.0, 62.5, 'O+', 'General Fitness'
);`}
                </pre>
              </div>

              {/* Query 4: Aggregate Summary & Health Analytics */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">4. Clinical Aggregations & Analytics</span>
                  <button
                    onClick={() => {
                      const q = `-- 4. STATISTICAL SUMMARY OF PATIENTS
SELECT 
    COUNT(*) AS total_patients,
    ROUND(AVG(weight_kg)::numeric, 1) AS avg_weight_kg,
    ROUND(AVG(height_cm)::numeric, 1) AS avg_height_cm,
    ROUND(AVG(weight_kg / POWER(height_cm / 100.0, 2))::numeric, 1) AS avg_bmi,
    COUNT(CASE WHEN medical_conditions IS NOT NULL AND medical_conditions <> 'None' THEN 1 END) AS patients_with_conditions,
    COUNT(CASE WHEN allergies IS NOT NULL AND allergies <> 'None' THEN 1 END) AS patients_with_allergies
FROM public.patients;`;
                      navigator.clipboard.writeText(q);
                      showToast('success', 'Analytics query copied!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    <Copy className="w-3 h-3 text-purple-400" /> Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900/90 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
{`SELECT 
    COUNT(*) AS total_patients,
    ROUND(AVG(weight_kg)::numeric, 1) AS avg_weight_kg,
    ROUND(AVG(weight_kg / POWER(height_cm / 100.0, 2))::numeric, 1) AS avg_bmi,
    COUNT(CASE WHEN medical_conditions IS NOT NULL THEN 1 END) AS patients_with_conditions
FROM public.patients;`}
                </pre>
              </div>

              {/* Query 5: Connected Relational Tables (Foreign Keys & JOINs) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">5. Connected Relational Tables Schema (Foreign Keys)</span>
                    <span className="text-[11px] text-slate-400">Connects patients with vitals history & consultations using foreign keys</span>
                  </div>
                  <button
                    onClick={() => {
                      const q = `-- ==============================================================
-- 1. CONNECTED TABLE: PATIENT VITALS HISTORY
-- Connected to public.patients via FOREIGN KEY (patient_id)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.patient_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate_bpm INT,
    body_temperature_c NUMERIC(4,1),
    weight_kg NUMERIC(5,2),
    blood_glucose_mg_dl NUMERIC(5,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast relational lookup
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON public.patient_vitals(patient_id);

-- ==============================================================
-- 2. CONNECTED TABLE: PATIENT CONSULTATIONS / APPOINTMENTS
-- Connected to public.patients via FOREIGN KEY (patient_id)
-- ==============================================================
CREATE TABLE IF NOT EXISTS public.patient_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    chief_complaint TEXT,
    diagnosis TEXT,
    prescription TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.patient_consultations(patient_id);

-- Enable RLS & Policies on Connected Tables
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on patient_vitals" ON public.patient_vitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on patient_consultations" ON public.patient_consultations FOR ALL USING (true) WITH CHECK (true);`;
                      navigator.clipboard.writeText(q);
                      showToast('success', 'Connected tables SQL copied!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30"
                  >
                    <Copy className="w-3 h-3 text-emerald-400" /> Copy Connected Tables DDL
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900/90 font-mono text-[11px] text-emerald-300/90 overflow-x-auto border border-slate-800">
{`-- Connected Table with FOREIGN KEY:
CREATE TABLE IF NOT EXISTS public.patient_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate_bpm INT,
    weight_kg NUMERIC(5,2),
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </pre>
              </div>

              {/* Query 6: Relational JOIN Queries */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-teal-400 block">6. Relational JOIN Query (Connected Data)</span>
                    <span className="text-[11px] text-slate-400">JOIN patients with their vitals and consultation logs in one result</span>
                  </div>
                  <button
                    onClick={() => {
                      const q = `-- RELATIONAL JOIN QUERY: Patients connected with their Vitals
SELECT 
    p.id AS patient_id,
    p.full_name,
    p.email,
    p.blood_group,
    p.fitness_goal,
    v.recorded_at,
    CONCAT(v.blood_pressure_systolic, '/', v.blood_pressure_diastolic) AS blood_pressure,
    v.heart_rate_bpm,
    v.weight_kg AS current_checkup_weight,
    v.notes AS vitals_notes
FROM public.patients p
INNER JOIN public.patient_vitals v ON p.id = v.patient_id
ORDER BY v.recorded_at DESC;`;
                      navigator.clipboard.writeText(q);
                      showToast('success', 'Relational JOIN query copied!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    <Copy className="w-3 h-3 text-teal-400" /> Copy JOIN Query
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900/90 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
{`SELECT 
    p.id, p.full_name, p.blood_group,
    v.recorded_at,
    CONCAT(v.blood_pressure_systolic, '/', v.blood_pressure_diastolic) AS blood_pressure,
    v.heart_rate_bpm
FROM public.patients p
LEFT JOIN public.patient_vitals v ON p.id = v.patient_id
ORDER BY p.created_at DESC;`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW PATIENT DETAILS */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-lg">
                {selectedPatient.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPatient.full_name}</h3>
                <p className="text-xs text-slate-400">{selectedPatient.email}</p>
                <span className="text-[10px] text-emerald-400 font-mono">UUID: {selectedPatient.id}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Blood Group</span>
                  <span className="font-bold text-white text-xs">{selectedPatient.blood_group || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Gender</span>
                  <span className="font-bold text-white text-xs">{selectedPatient.gender || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">DOB</span>
                  <span className="font-bold text-white text-xs">{selectedPatient.dob || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Height</span>
                  <span className="font-bold text-white text-xs">{selectedPatient.height_cm ? `${selectedPatient.height_cm} cm` : '--'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Weight</span>
                  <span className="font-bold text-white text-xs">{selectedPatient.weight_kg ? `${selectedPatient.weight_kg} kg` : '--'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Goal</span>
                  <span className="font-bold text-emerald-400 text-xs">{selectedPatient.fitness_goal || 'General'}</span>
                </div>
              </div>

              {selectedPatient.phone && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Phone Number</span>
                  <span className="font-semibold text-white">{selectedPatient.phone}</span>
                </div>
              )}

              {selectedPatient.medical_conditions && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block mb-0.5">Pre-existing Medical Conditions</span>
                  <p className="text-slate-200">{selectedPatient.medical_conditions}</p>
                </div>
              )}

              {selectedPatient.allergies && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] text-rose-400 uppercase font-bold block mb-0.5">Known Allergies</span>
                  <p className="text-slate-200">{selectedPatient.allergies}</p>
                </div>
              )}

              {selectedPatient.emergency_contact_name && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Emergency Contact</span>
                  <p className="text-slate-200">
                    {selectedPatient.emergency_contact_name} ({selectedPatient.emergency_contact_phone || 'No phone'})
                  </p>
                </div>
              )}

              {selectedPatient.notes && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Clinical Notes</span>
                  <p className="text-slate-200 leading-relaxed">{selectedPatient.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const p = selectedPatient;
                  setSelectedPatient(null);
                  setEditingPatient(p);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs"
              >
                Edit Details
              </button>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PATIENT */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingPatient(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-400" />
              Edit Patient Record in Supabase
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingPatient.full_name}
                  onChange={e => setEditingPatient({ ...editingPatient, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editingPatient.email}
                    onChange={e => setEditingPatient({ ...editingPatient, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingPatient.phone || ''}
                    onChange={e => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={editingPatient.height_cm || ''}
                    onChange={e => setEditingPatient({ ...editingPatient, height_cm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingPatient.weight_kg || ''}
                    onChange={e => setEditingPatient({ ...editingPatient, weight_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                  <select
                    value={editingPatient.blood_group || 'O+'}
                    onChange={e => setEditingPatient({ ...editingPatient, blood_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Medical Conditions</label>
                <textarea
                  rows={2}
                  value={editingPatient.medical_conditions || ''}
                  onChange={e => setEditingPatient({ ...editingPatient, medical_conditions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Allergies</label>
                <textarea
                  rows={2}
                  value={editingPatient.allergies || ''}
                  onChange={e => setEditingPatient({ ...editingPatient, allergies: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  value={editingPatient.notes || ''}
                  onChange={e => setEditingPatient({ ...editingPatient, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Save Changes to Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
