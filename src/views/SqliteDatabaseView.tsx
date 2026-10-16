import React, { useState, useEffect } from 'react';
import {
  Database,
  Terminal,
  Play,
  Download,
  RefreshCw,
  Table,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
  Layers,
  Sparkles,
  Copy
} from 'lucide-react';
import { api } from '../api';

interface SqliteDatabaseViewProps {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SqliteDatabaseView: React.FC<SqliteDatabaseViewProps> = ({ showToast }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>('patients');
  const [queryInput, setQueryInput] = useState<string>('SELECT * FROM patients LIMIT 20;');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    columns?: string[];
    rows?: any[];
    rowsAffected?: number;
    executionTimeMs?: number;
    error?: string;
  } | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getSQLiteStatus();
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      showToast('error', 'Error fetching SQLite status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async (customSql?: string) => {
    const sqlToRun = (customSql || queryInput).trim();
    if (!sqlToRun) {
      showToast('error', 'Please enter a SQL query');
      return;
    }

    setQueryLoading(true);
    try {
      const res = await api.executeSQLiteQuery(sqlToRun);
      setQueryResult(res);
      if (res.error) {
        showToast('error', `SQLite error: ${res.error}`);
      } else {
        showToast('success', `Query executed in ${res.executionTimeMs}ms`);
      }
    } catch (err: any) {
      setQueryResult({ error: err.message, executionTimeMs: 0 });
      showToast('error', err.message || 'Error running SQL query');
    } finally {
      setQueryLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    handleRunQuery('SELECT * FROM patients LIMIT 20;');
  }, []);

  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    const sql = `SELECT * FROM "${tableName}" LIMIT 25;`;
    setQueryInput(sql);
    handleRunQuery(sql);
  };

  const sampleQueries = [
    { label: 'View Patients', sql: 'SELECT id, full_name, email, phone, blood_group, fitness_goal FROM patients;' },
    { label: 'Patient Vitals (JOIN)', sql: 'SELECT p.full_name, p.blood_group, v.blood_pressure_systolic, v.blood_pressure_diastolic, v.heart_rate_bpm FROM patients p LEFT JOIN patient_vitals v ON p.id = v.patient_id;' },
    { label: 'Registered Users', sql: 'SELECT id, name, email, role, fitness_goal, xp, level FROM users;' },
    { label: 'Indian Foods', sql: 'SELECT name, category, serving_size, calories, protein, carbs FROM food_database WHERE is_indian = 1;' },
    { label: 'Workout Logs', sql: 'SELECT exercise, muscle_group, sets, reps, weight, duration, workout_date FROM workouts;' },
    { label: 'List All Tables', sql: "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide uppercase">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              Automated SQLite Database Engine Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SQLite Database & Automated Storage
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              All patient forms, health vitals, workouts, and user accounts are automatically persisted to the local SQLite database file (<code className="text-cyan-400 font-mono text-xs">data/fitness_tracker.sqlite</code>). You can inspect tables, run standard SQL queries, and download the database file below.
            </p>
          </div>

          {/* SQLite Stats Quick Widget */}
          <div className="flex flex-col gap-2.5 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shadow-md min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                SQLite {stats?.sqliteVersion || 'v3.x'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-cyan-500/20">
                {stats?.fileSizeFormatted || '12.0 KB'}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <div>Tables: <span className="text-white font-bold">{stats?.totalTables ?? 16} tables</span></div>
              <div>Records: <span className="text-emerald-400 font-bold">{stats?.totalRecords ?? 0} rows</span></div>
              <div className="truncate text-slate-400 text-[10px]">Path: fitness_tracker.sqlite</div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={fetchStats}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                Refresh
              </button>
              <a
                href="/api/sqlite/download"
                download="fitness_tracker.sqlite"
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30"
              >
                <Download className="w-3 h-3" />
                Download .sqlite File
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Tables Navigator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Database Tables ({stats?.tables?.length || 0})
              </h3>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {(stats?.tables || []).map((t: any) => {
                const isSelected = selectedTable === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => handleSelectTable(t.name)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Table className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-mono shrink-0">
                      {t.rowCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: SQL Query Editor & Results */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Query Console Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Interactive SQLite Query Console</h3>
              </div>

              {/* Sample Queries Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500">Quick SQL:</span>
                {sampleQueries.slice(0, 3).map(sq => (
                  <button
                    key={sq.label}
                    onClick={() => {
                      setQueryInput(sq.sql);
                      handleRunQuery(sq.sql);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
                  >
                    {sq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Input Area */}
            <div className="relative">
              <textarea
                rows={4}
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                placeholder="Enter SQLite query (e.g. SELECT * FROM patients;)"
                className="w-full p-4 rounded-2xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] text-slate-500 font-mono">
                {queryResult?.executionTimeMs !== undefined && (
                  <span>Executed in <strong className="text-cyan-400">{queryResult.executionTimeMs}ms</strong></span>
                )}
                {queryResult?.rows && (
                  <span className="ml-2">({queryResult.rows.length} rows returned)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQueryInput('')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleRunQuery()}
                  disabled={queryLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${queryLoading ? 'animate-spin' : ''}`} />
                  {queryLoading ? 'Running...' : 'Execute Query'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Query Results</span>
              {queryResult?.rows && (
                <span className="text-[11px] text-cyan-400 font-mono">{queryResult.rows.length} records</span>
              )}
            </h4>

            {queryResult?.error ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-bold">SQLite Execution Error:</p>
                  <p className="font-mono text-[11px] text-slate-300 mt-0.5">{queryResult.error}</p>
                </div>
              </div>
            ) : queryResult?.rows && queryResult.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      {queryResult.columns?.map(col => (
                        <th key={col} className="p-3 text-[11px] font-bold text-cyan-300 uppercase tracking-wider whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        {queryResult.columns?.map(col => (
                          <td key={col} className="p-3 text-slate-200 whitespace-nowrap max-w-xs truncate">
                            {row[col] === null || row[col] === undefined ? (
                              <span className="text-slate-600 italic">null</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : queryResult?.rowsAffected ? (
              <div className="p-6 text-center text-xs text-emerald-300 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                Query executed successfully. ({queryResult.rowsAffected} row(s) affected)
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No results returned for this query.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
