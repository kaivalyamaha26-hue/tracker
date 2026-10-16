import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Sparkles,
  Award,
  Flame,
  Footprints,
  Dumbbell,
  CheckCircle2,
  TrendingDown,
  Clock,
  FileDown,
  Loader2
} from 'lucide-react';
import { api } from '../api';
import { generateFitnessReportPdf } from '../utils/pdfExport';

interface ReportsViewProps {
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ showToast }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-10');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReport(period, startDate, endDate);
      setReportData(res.report);
    } catch (err: any) {
      showToast('error', 'Failed to generate fitness report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  const handleDownloadCsv = () => {
    if (!reportData) return;
    const csvRows = [
      ['Metric', 'Value'],
      ['Period', reportData.periodName],
      ['Total Workouts Completed', reportData.totalWorkouts],
      ['Total Workout Duration (mins)', reportData.totalWorkoutMinutes],
      ['Total Calories Burned (kcal)', reportData.totalCaloriesBurned],
      ['Average Daily Steps', reportData.averageSteps],
      ['Starting Weight (kg)', reportData.startingWeight],
      ['Current Weight (kg)', reportData.currentWeight],
      ['Net Weight Change (kg)', reportData.weightChange],
      ['Active Goals Tracked', reportData.goalsCompleted],
      ['Report Generated Date', new Date().toISOString()]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fitness_Report_${reportData.periodName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV report downloaded successfully!');
  };

  const handleExportPdf = () => {
    if (!reportData) {
      showToast('error', 'Report data not ready for export');
      return;
    }

    try {
      setIsExportingPdf(true);
      generateFitnessReportPdf({
        periodName: reportData.periodName,
        userName: reportData.userName || 'Athlete',
        reportDate: new Date().toISOString(),
        startDate,
        endDate,
        totalWorkouts: reportData.totalWorkouts || 0,
        totalWorkoutMinutes: reportData.totalWorkoutMinutes || 0,
        totalCaloriesBurned: reportData.totalCaloriesBurned || 0,
        averageSteps: reportData.averageSteps || 0,
        startingWeight: reportData.startingWeight || 75,
        currentWeight: reportData.currentWeight || 74,
        weightChange: reportData.weightChange || 0,
        adherenceScore: 92,
        goalsCompleted: reportData.goalsCompleted || 3,
        waterIntakeAvg: 2850
      });
      showToast('success', 'Official PDF Report downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('error', 'Failed to generate PDF document');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Performance & Health Analytics Report
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregate biometric summaries, volume load analysis, and downloadable compliance audits
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            CSV Data
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || loading || !reportData}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
            title="Export final official PDF report document"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>Export PDF Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
            title="Print directly to printer or save via browser print"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              period === 'weekly'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days (Weekly)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              period === 'monthly'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days (Monthly)
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              period === 'custom'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Range
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
            />
            <button
              onClick={fetchReport}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Printable Report Document Card */}
      {loading || !reportData ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Compiling analytics report...
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                Official Fitness Analytics Summary
              </span>
              <h2 className="text-2xl font-black text-white">{reportData.periodName} Report</h2>
              <span className="text-xs text-slate-400 mt-1 block">
                Generated for Athlete: <strong>{reportData.userName}</strong> • Generated on {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Overall Adherence Score</span>
              <span className="text-2xl font-black text-emerald-400">92%</span>
              <span className="text-[10px] text-slate-400 block">Grade A (Elite Execution)</span>
            </div>
          </div>

          {/* Key Metric Blocks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                <Dumbbell className="w-4 h-4" />
                Workouts Done
              </div>
              <span className="text-3xl font-black text-white">{reportData.totalWorkouts}</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {reportData.totalWorkoutMinutes} total minutes
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase mb-1">
                <Flame className="w-4 h-4" />
                Total Burned
              </div>
              <span className="text-3xl font-black text-white">{reportData.totalCaloriesBurned}</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                kcal exercise energy
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase mb-1">
                <Footprints className="w-4 h-4" />
                Daily Step Avg
              </div>
              <span className="text-3xl font-black text-white">{reportData.averageSteps.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400 block mt-1">
                steps / active day
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-1">
                <TrendingDown className="w-4 h-4" />
                Net Weight Delta
              </div>
              <span className="text-3xl font-black text-white">
                {reportData.weightChange > 0 ? `+${reportData.weightChange}` : reportData.weightChange} kg
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                {reportData.startingWeight} kg &rarr; {reportData.currentWeight} kg
              </span>
            </div>
          </div>

          {/* Breakdown Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Training Highlights & Milestones
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>100% adherence to scheduled Tuesday & Thursday Push-Pull sessions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Hydration exceeded daily baseline by an average of 420 ml.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Average resting heart rate down by 2 beats/minute indicating improved cardiovascular conditioning.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recommendations for Next Cycle
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">&rarr;</span>
                  <span>Incorporate 10-15 minutes of dynamic hamstring mobility prior to leg days.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">&rarr;</span>
                  <span>Progressively overload Barbell Squat and Bench Press by 2.5kg next week.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">&rarr;</span>
                  <span>Aim to log dinner meals consistently to ensure overnight protein target is met.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Verification Stamp */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Personal Fitness Tracker Verified Telemetry Engine</span>
            <span>Document ID: PFT-REP-{Date.now().toString().slice(-8)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
