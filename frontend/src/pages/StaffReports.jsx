import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
=======
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
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

const StaffReports = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [period, setPeriod] = useState(30);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
=======
  const [loading, setLoading] = useState(true);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/staff/reports?days=${period}`);
      if (res.ok) setReports(await res.json());
    } catch (err) {
<<<<<<< HEAD
      console.error("Failed to fetch reports", err);
      toast.error("Failed to fetch reports");
=======
      console.error('Failed to fetch reports', err);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
<<<<<<< HEAD
  }, [period]);

  const openLogoutConfirm = () => setLogoutConfirm(true);
  const handleLogoutConfirmed = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out');
  };
  const handleCancelLogout = () => setLogoutConfirm(false);
=======
  }, [period, user]);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

  if (!user) return null;

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between fixed h-full">
        <div>
           <div className="flex items-center gap-2 mb-8">
      <img src="/logo.png" alt="OfficeQ Logo" className="h-8 w-auto" />
      <span className="text-officeq-blue font-bold text-xl">OfficeQ</span>
    </div>
          <nav className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/queue-management')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>📋</span> Queue Management
            </button>
            <button onClick={() => navigate('/staff-reports')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
              <span>📊</span> Reports
            </button>
            <button onClick={() => navigate('/staff-profile')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>👤</span> Profile
            </button>
          </nav>
        </div>
        <button onClick={openLogoutConfirm} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2">
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-gray-900">Performance Reports</h1>
          <button onClick={fetchReports} className="bg-officeq-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600">
            Refresh
          </button>
        </div>
        <div className="mb-6 flex gap-4">
          <label className="font-medium">Period:</label>
          <select value={period} onChange={(e) => setPeriod(parseInt(e.target.value))} className="border rounded p-2">
=======
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
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
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
<<<<<<< HEAD
          </>
        ) : <p>No data</p>}
      </main>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirm}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogoutConfirmed}
        onCancel={handleCancelLogout}
      />
    </div>
=======
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No report data available.</p>
      )}
    </AppShell>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  );
};

export default StaffReports;