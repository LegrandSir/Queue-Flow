import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Users,
  Layers,
  Sparkles,
  BrainCircuit,
  ArrowUpRight,
  RefreshCw,
  X,
  Clock,
  Activity,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch } from '../lib/api';

const STATUS_BADGE = {
  clear: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  optimal: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  moderate: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  high: 'bg-red-500/15 text-red-300 border-red-400/30',
};

const AdminDashboard = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [activeTickets, setActiveTickets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [insights, setInsights] = useState(null);
  const [modalType, setModalType] = useState(null); // 'tickets' | 'staff' | 'services' | null
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
    fetchAll();
    const interval = setInterval(fetchAll, 8000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchAll = async () => {
    try {
      const [ticketsRes, staffRes, servicesRes, insightsRes] = await Promise.all([
        apiFetch('/api/tickets/active'),
        apiFetch('/api/staff'),
        apiFetch('/api/services'),
        apiFetch('/api/admin/ai-insights'),
      ]);
      if (ticketsRes.ok) setActiveTickets(await ticketsRes.json());
      if (staffRes.ok) setStaffList(await staffRes.json());
      if (servicesRes.ok) setServiceList(await servicesRes.json());
      if (insightsRes.ok) setInsights(await insightsRes.json());
    } catch (err) {
      console.error('Admin overview fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'Admin') return null;

  const activeServices = serviceList.filter((s) => s.active);
  const priorityWaiting = activeTickets.filter(
    (t) => t.status === 'waiting' && t.priority_level > 0
  ).length;
  const servingCount = activeTickets.filter((t) => t.status === 'serving').length;

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Operations Overview"
      subtitle={`Welcome back, ${user.full_name || user.email} · Live branch telemetry`}
      actions={
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      }
    >
      {/* Operations Intelligence Hero */}
      <div className="bg-[#0B1120] text-white rounded-3xl p-6 sm:p-7 mb-6 shadow-xl shadow-slate-900/10 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-sky-300 text-[11px] font-bold uppercase tracking-wider">
                <BrainCircuit className="w-3.5 h-3.5" /> Live Operations Engine
              </span>
              {insights?.status && (
                <span
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
                    STATUS_BADGE[insights.status] || STATUS_BADGE.optimal
                  }`}
                >
                  Load: {insights.status}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {insights?.recommendation || 'Analyzing live lobby throughput...'}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {insights?.insight ||
                'Queue metrics are evaluated continuously from real-time database activity.'}
            </p>
          </div>

          <div className="flex sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 min-w-[170px]">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Busiest Department
              </p>
              <p className="text-sm font-extrabold text-white mt-0.5 truncate">
                {insights?.busiest_service || 'All Clear'}
              </p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 min-w-[170px]">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Est. Queue Wait
              </p>
              <p className="text-sm font-extrabold text-sky-400 mt-0.5 tabular-nums">
                {insights?.estimated_wait ?? 0} minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setModalType('tickets')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Tickets</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {activeTickets.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">{servingCount} currently at counter</p>
        </button>

        <button
          onClick={() => setModalType('tickets')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Priority Waiting
          </p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1 tabular-nums">
            {priorityWaiting}
          </p>
          <p className="text-xs text-slate-500 mt-1">Fast-tracked automatically</p>
        </button>

        <button
          onClick={() => setModalType('staff')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff Agents</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {staffList.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Assigned to branch counters</p>
        </button>

        <button
          onClick={() => setModalType('services')}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Services
          </p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {activeServices.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">of {serviceList.length} configured</p>
        </button>
      </div>

      {/* Live Queue Snapshot */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">Live Branch Activity</h3>
          </div>
          <button
            onClick={() => navigate('/admin/reports')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Open Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3.5">Ticket</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Counter</th>
                  <th className="px-6 py-3.5 text-right">Checked In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {activeTickets.length > 0 ? (
                  activeTickets.slice(0, 8).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-extrabold text-slate-900 tabular-nums">
                        {t.ticket_number}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-700">{t.service_type}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            t.status === 'serving'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {t.status === 'serving' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {t.priority_level > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                            HIGH
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                            NORMAL
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-slate-500">
                        {t.counter || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right text-xs text-slate-400 tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(t.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm">
                      No active tickets right now. Click &quot;Simulate +2 Walk-ins&quot; in the sidebar to populate live traffic.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick-Inspect Detail Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalType(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">
                  {modalType === 'tickets' && `Active Queue (${activeTickets.length})`}
                  {modalType === 'staff' && `Staff Directory (${staffList.length})`}
                  {modalType === 'services' && `Active Services (${activeServices.length})`}
                </h2>
                <button
                  onClick={() => setModalType(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {modalType === 'tickets' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Ticket</th>
                        <th className="px-4 py-2.5">Service</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeTickets.map((t) => (
                        <tr key={t.id}>
                          <td className="px-4 py-3 font-extrabold text-blue-600 tabular-nums">
                            {t.ticket_number}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{t.service_type}</td>
                          <td className="px-4 py-3 capitalize font-semibold">{t.status}</td>
                          <td className="px-4 py-3">
                            {t.priority_level > 0 ? 'HIGH' : 'NORMAL'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {modalType === 'staff' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Name</th>
                        <th className="px-4 py-2.5">ID</th>
                        <th className="px-4 py-2.5">Email</th>
                        <th className="px-4 py-2.5">Counter</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffList.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {s.full_name || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{s.id_number || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{s.email}</td>
                          <td className="px-4 py-3 font-semibold text-blue-600">
                            {s.counter || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {modalType === 'services' && (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Service Name</th>
                        <th className="px-4 py-2.5">Target SLA Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeServices.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">
                            {s.duration} min
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};

export default AdminDashboard;