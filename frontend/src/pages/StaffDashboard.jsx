import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
=======
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
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

const StaffDashboard = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [activeTickets, setActiveTickets] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
<<<<<<< HEAD
  const [nowServing, setNowServing] = useState('---');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, service: null });
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Fetch services
=======
  const [selectedService, setSelectedService] = useState('All Services');
  const [isCalling, setIsCalling] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const staffCounter = user?.counter || 'Counter 1';

>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
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
<<<<<<< HEAD
        console.error("Failed to fetch services", err);
        toast.error("Failed to fetch services");
=======
        console.error('Failed to fetch services', err);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
      }
    };
    loadServices();
  }, [user, navigate]);

<<<<<<< HEAD
  // Fetch all active tickets (waiting + serving)
=======
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  const fetchQueue = async () => {
    try {
      const res = await apiFetch('/api/tickets/active');
      if (res.ok) setActiveTickets(await res.json());
    } catch (error) {
<<<<<<< HEAD
      console.error("Error fetching queue:", error);
      toast.error("Failed to fetch queue");
    }
  };

  // Fetch currently serving ticket (for the card)
  const fetchNowServing = async () => {
    try {
      const response = await fetch('/api/kiosk/status');
      const data = await response.json();
      setNowServing(data.currently_serving || '---');
    } catch (error) {
      console.error("Error fetching serving ticket:", error);
    }
  };

  // Fetch AI insights
  const fetchAIInsights = async () => {
    setLoadingInsight(true);
    try {
      const response = await fetch('/api/admin/ai-insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setInsight("⚠️ Unable to load insights at this time.");
    } finally {
      setLoadingInsight(false);
    }
  };

  // Poll every 5 seconds
=======
      console.error('Error fetching queue:', error);
    }
  };

>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  useEffect(() => {
    if (!user) return;
    fetchQueue();
<<<<<<< HEAD
    fetchNowServing();
    fetchAIInsights();
    const interval = setInterval(() => {
      fetchQueue();
      fetchNowServing();
      fetchAIInsights();
    }, 5000);
=======
    const interval = setInterval(fetchQueue, 4000);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
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

<<<<<<< HEAD
  // Open confirmation dialog before calling next
  const openConfirmDialog = () => {
    if (!selectedService) return;
    setConfirmDialog({ open: true, service: selectedService });
  };

  // Actual call next after confirmation
  const handleCallNextConfirmed = async () => {
    setIsLoading(true);
=======
  const handleCallNext = async () => {
    setIsCalling(true);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    try {
      const res = await apiFetch('/api/tickets/call-next', {
        method: 'POST',
<<<<<<< HEAD
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: confirmDialog.service }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        fetchQueue();
        fetchNowServing();
        fetchAIInsights();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to call next ticket.");
    } finally {
      setIsLoading(false);
      setConfirmDialog({ open: false, service: null });
    }
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ open: false, service: null });
=======
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
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  };

  // Logout confirmation
  const openLogoutConfirm = () => setLogoutConfirm(true);
  const handleLogoutConfirmed = () => {
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/login');
  };
  const handleCancelLogout = () => setLogoutConfirm(false);

  if (!user) return null;

<<<<<<< HEAD
  // Filter tickets by status
  const waitingTickets = activeTickets.filter(t => t.status === 'waiting');
  const servingTickets = activeTickets.filter(t => t.status === 'serving');
  const priorityWaiting = waitingTickets.filter(t => t.priority_level > 0).length;
  const standardWaiting = waitingTickets.filter(t => t.priority_level === 0).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between fixed h-full">
        <div>
           <div className="flex items-center gap-2 mb-8">
      <img src="/logo.png" alt="OfficeQ Logo" className="h-8 w-auto" />
      <span className="text-officeq-blue font-bold text-xl">OfficeQ</span>
    </div>
          <nav className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/queue-management')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>📋</span> Queue Management
            </button>
            <button onClick={() => navigate('/staff-reports')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
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

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
=======
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
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
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
<<<<<<< HEAD
            <div className="flex items-center gap-4">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-officeq-blue"
              >
                {availableServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <button
                onClick={openConfirmDialog}
                disabled={isLoading}
                className="bg-officeq-blue text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Calling...' : 'Call Next'}
              </button>
            </div>
          </header>

          {/* AI Insights Panel */}
          <div className="bg-gray-900 rounded-3xl p-8 mb-10 shadow-xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-2xl">🧠</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
                </div>
                <h2 className="text-white font-black text-xl tracking-tight">Operations Insights</h2>
              </div>
              <button 
                onClick={fetchAIInsights}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-white/10"
              >
                {loadingInsight ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </div>
            {insight ? (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-blue-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {insight}
                </p>
              </div>
            ) : (
              <div className="text-gray-500 text-sm font-medium animate-pulse italic">
                Analyzing queue patterns...
              </div>
            )}
          </div>

          {/* Now Serving Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase font-bold tracking-wider">Now Serving</p>
                <p className="text-5xl font-black text-officeq-blue mt-2">{nowServing}</p>
                <p className="text-gray-400 text-sm mt-1">Ticket currently at counter</p>
=======

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
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
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

<<<<<<< HEAD
          {/* Waiting Tickets Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-800">Waiting Tickets</h2>
              <span className="bg-blue-100 text-officeq-blue px-4 py-1 rounded-full text-sm font-bold">
                {waitingTickets.length} in line
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-black">
                  <tr>
                    <th className="px-6 py-4">Ticket</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {waitingTickets.length > 0 ? waitingTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`font-black text-lg ${ticket.priority_level > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {ticket.ticket_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{ticket.service_type}</td>
                      <td className="px-6 py-4">
                        {ticket.priority_level > 0 ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">PRIORITY</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-black">STANDARD</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                        No waiting tickets.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Currently Serving Tickets Table */}
          {servingTickets.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-800">Currently Serving</h2>
                <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold">
                  {servingTickets.length} at counter
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-black">
                    <tr>
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Started At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {servingTickets.map((ticket) => (
                      <tr key={ticket.id} className="bg-green-50">
                        <td className="px-6 py-4 font-black text-officeq-blue">{ticket.ticket_number}</td>
                        <td className="px-6 py-4 text-gray-700">{ticket.service_type}</td>
                        <td className="px-6 py-4">
                          {ticket.priority_level > 0 ? (
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">PRIORITY</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-black">STANDARD</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Stats Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"></div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-400 font-black text-sm uppercase mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Priority Waiting</span>
                    <span className="text-red-600 font-black">{priorityWaiting}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Standard Waiting</span>
                    <span className="text-gray-900 font-black">{standardWaiting}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirm Dialog for Call Next */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title="Call Next Ticket"
        message={`Are you sure you want to call the next ticket for "${confirmDialog.service}"?`}
        onConfirm={handleCallNextConfirmed}
        onCancel={handleCancelConfirm}
      />

      {/* Confirm Dialog for Logout */}
      <ConfirmDialog
        isOpen={logoutConfirm}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogoutConfirmed}
        onCancel={handleCancelLogout}
      />
    </div>
=======
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
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  );
};

export default StaffDashboard;