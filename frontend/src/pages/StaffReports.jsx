import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CheckCircle2, Clock, Ticket, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch } from '../lib/api';

const StaffReports = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/staff/reports?days=${period}`);
      if (res.ok) setReports(await res.json());
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, [period, user]);

  if (!user) return null;

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Performance Reports"
      subtitle="Track ticket throughput and customer wait velocity across recent shifts"
      actions={
        <div className="flex items-center gap-2.5">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-600"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      }
    >
      {loading && !reports ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tickets Served
              </p>
              <p className="text-4xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {reports.total_served}
              </p>
              <p className="text-xs text-slate-400 mt-1">Completed in last {period} days</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Ticket className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Volume
              </p>
              <p className="text-4xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {reports.total_tickets}
              </p>
              <p className="text-xs text-slate-400 mt-1">All tickets checked in</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Avg. Wait Time
              </p>
              <p className="text-4xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {reports.avg_wait_minutes}{' '}
                <span className="text-lg font-bold text-slate-400">min</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Check-in to counter call</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="mb-6">
              <h2 className="text-base font-extrabold text-slate-900">
                7-Day Queue Volume vs Completed
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily check-ins compared against completed counter sessions
              </p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reports.daily_counts} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="staffVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="staffDoneGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1120',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Total Tickets"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fill="url(#staffVolGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#staffDoneGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No report data available.</p>
      )}
    </AppShell>
  );
};

export default StaffReports;