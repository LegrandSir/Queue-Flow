import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  BellRing,
  CheckCircle2,
  UserX,
  Users,
  Sparkles,
  Clock,
  Ticket,
  RefreshCw,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch } from '../lib/api';

const StaffDashboard = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [activeTickets, setActiveTickets] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedService, setSelectedService] = useState('All Services');
  const [isCalling, setIsCalling] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const staffCounter = user?.counter || 'Counter 1';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const loadServices = async () => {
      try {
        const res = await apiFetch('/api/services');
        const data = await res.json();
        setAvailableServices(data.filter((s) => s.active));
      } catch (err) {
        console.error('Failed to fetch services', err);
      }
    };
    loadServices();
  }, [user, navigate]);

  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/tickets/active');
      if (res.ok) setActiveTickets(await res.json());
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const servingTickets = activeTickets.filter((t) => t.status === 'serving');
  const waitingTickets = activeTickets.filter((t) => t.status === 'waiting');
  const filteredWaiting =
    selectedService === 'All Services'
      ? waitingTickets
      : waitingTickets.filter((t) => t.service_type === selectedService);

  const myServing =
    servingTickets.find((t) => t.counter === staffCounter) || servingTickets[0] || null;

  const handleCallNext = async () => {
    setIsCalling(true);
    try {
      const res = await apiFetch('/api/tickets/call-next', {
        method: 'POST',
        body: JSON.stringify({
          service: selectedService,
          counter: staffCounter,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchQueue();
      } else {
        toast.info(data.message || 'No tickets waiting for this service.');
      }
    } catch {
      toast.error('Failed to call next ticket.');
    } finally {
      setIsCalling(false);
    }
  };

  const handleTicketStatus = async (ticketId, status) => {
    setUpdatingId(ticketId);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, counter: staffCounter }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchQueue();
      } else {
        toast.error(data.error || 'Could not update ticket');
      }
    } catch {
      toast.error('Server error updating ticket');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) return null;

  const priorityWaiting = waitingTickets.filter((t) => t.priority_level > 0).length;
  const standardWaiting = waitingTickets.length - priorityWaiting;

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Staff Live Desk"
      subtitle={`Operating ${staffCounter} · Priority-first automatic queue dispatch`}
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="All Services">All Services</option>
            {availableServices.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCallNext}
            disabled={isCalling}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <BellRing className="w-4 h-4" />
            {isCalling ? 'Calling...' : 'Call Next Guest'}
          </button>
        </div>
      }
    >
      {/* Top Row: Now Serving Hero + KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Now Serving Card */}
        <div className="lg:col-span-7 bg-[#0B1120] text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-12 -top-12 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Currently Serving · {myServing?.counter || staffCounter}
            </span>
            {myServing?.priority_level > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" /> Priority Guest
              </span>
            )}
          </div>

          <div className="my-5 flex flex-wrap items-end justify-between gap-4 relative z-10">
            <div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={myServing?.ticket_number || 'none'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-6xl font-extrabold tracking-tight tabular-nums leading-none"
                >
                  {myServing ? myServing.ticket_number : '---'}
                </motion.p>
              </AnimatePresence>
              <p className="text-sm text-slate-400 mt-2 font-medium">
                {myServing
                  ? `${myServing.service_type} · Called at ${
                      myServing.called_at
                        ? new Date(myServing.called_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'now'
                    }`
                  : 'Counter is idle — click "Call Next Guest" to pull from queue'}
              </p>
            </div>

            {myServing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTicketStatus(myServing.id, 'completed')}
                  disabled={updatingId === myServing.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete
                </button>
                <button
                  onClick={() => handleTicketStatus(myServing.id, 'missed')}
                  disabled={updatingId === myServing.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-300 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" /> No-Show
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Side KPIs */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {waitingTickets.length}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Total Waiting</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-amber-600 tabular-nums">
                {priorityWaiting}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Priority Waiting</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-emerald-600 tabular-nums">
                {servingTickets.length}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Active Counters</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {standardWaiting}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Standard Waiting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Waiting Line{' '}
              {selectedService !== 'All Services' && (
                <span className="text-blue-600">· {selectedService}</span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ordered automatically by priority tier, then check-in time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tabular-nums">
              {filteredWaiting.length} waiting
            </span>
            <button
              onClick={fetchQueue}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-3.5">Pos</th>
                <th className="px-6 py-3.5">Ticket</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Tier</th>
                <th className="px-6 py-3.5">Checked In</th>
                <th className="px-6 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredWaiting.length > 0 ? (
                filteredWaiting.map((ticket, index) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400 tabular-nums">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-extrabold text-base tabular-nums ${
                          ticket.priority_level > 0 ? 'text-amber-600' : 'text-slate-900'
                        }`}
                      >
                        {ticket.ticket_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {ticket.service_type}
                    </td>
                    <td className="px-6 py-4">
                      {ticket.priority_level > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/70 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          <Sparkles className="w-3 h-3" /> Priority
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 tabular-nums">
                      {new Date(ticket.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleTicketStatus(ticket.id, 'serving')}
                        disabled={updatingId === ticket.id}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Serve Now
                      </button>
                      <button
                        onClick={() => handleTicketStatus(ticket.id, 'missed')}
                        disabled={updatingId === ticket.id}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Missed
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center text-slate-400 text-sm">
                    No guests currently waiting. Use <span className="font-bold text-slate-600">Simulate +2 Walk-ins</span> in the sidebar to test live flow.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};

export default StaffDashboard;