import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Download, Ticket, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch, apiUrl } from '../lib/api';

const PIE_COLORS = ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

const QueueReports = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [efficiency, setEfficiency] = useState([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    loadAnalytics();
  }, [user, period, navigate]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, effRes] = await Promise.all([
        apiFetch(`/api/reports/stats?days=${period}`),
        apiFetch('/api/reports/efficiency'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (effRes.ok) setEfficiency(await effRes.json());
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch(apiUrl('/api/system/export-csv'));
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `queueflow_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV report downloaded');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  if (!user || user.role !== 'Admin') return null;

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Analytics & SLA Reports"
      subtitle="Historical queue throughput, wait times, and counter handling efficiency"
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
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B1120] hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      }
    >
      {loading && !stats ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Executive KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Ticket className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Volume
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {stats.total_tickets}
              </p>
              <p className="text-xs text-slate-400 mt-1">Last {stats.period_days} days</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Completion Rate
              </p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1 tabular-nums">
                {stats.completion_rate}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.completed_tickets} served · {stats.missed_tickets} missed
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Avg. Wait Time
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                {stats.avg_wait_minutes}{' '}
                <span className="text-base font-bold text-slate-400">min</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Calculated from ticket timestamps</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Priority / Standard
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
                <span className="text-amber-600">{stats.priority_count}</span>
                <span className="text-slate-300 mx-1.5">/</span>
                <span>{stats.normal_count}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.total_tickets
                  ? Math.round((stats.priority_count / stats.total_tickets) * 100)
                  : 0}
                % priority traffic
              </p>
            </div>
          </div>

          {/* Row 1: Daily Volume + Donut Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900">Daily Ticket Throughput</h2>
              <p className="text-xs text-slate-500 mt-0.5 mb-5">
                Last 7 days total check-ins vs completed sessions
              </p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.daily_counts}
                    margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="adminTotalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="adminCompGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B1120',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Checked In"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#adminTotalGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fill="url(#adminCompGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900">Demand by Department</h2>
              <p className="text-xs text-slate-500 mt-0.5 mb-5">
                Share of tickets across active service desks
              </p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.service_stats}
                      dataKey="count"
                      nameKey="service"
                      cx="50%"
                      cy="46%"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {stats.service_stats.map((entry, idx) => (
                        <Cell key={entry.service} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0B1120',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Service Handling Efficiency vs Target SLA */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900">
              Handling Efficiency vs SLA Target
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">
              Actual average handling duration compared to configured department SLA (minutes)
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiency} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="service"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1120',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="avg_handling_minutes"
                    name="Actual Avg (min)"
                    fill="#2563EB"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={42}
                  />
                  <Bar
                    dataKey="target_minutes"
                    name="SLA Target (min)"
                    fill="#CBD5E1"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No analytics data available.</p>
      )}
    </AppShell>
  );
};

export default QueueReports;