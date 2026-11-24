import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
=======
import { toast } from 'sonner';
import { Search, RefreshCw, Sparkles, CheckCircle2, Play, UserX } from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch } from '../lib/api';
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

const QueueManagement = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
=======
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchTickets = async () => {
    try {
      const res = await apiFetch('/api/tickets/active');
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await apiFetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, counter: user?.counter || 'Counter 1' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchTickets();
        toast.success(`Ticket status updated to ${status}`);
      } else {
<<<<<<< HEAD
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const openLogoutConfirm = () => setLogoutConfirm(true);
  const handleLogoutConfirmed = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out');
  };
  const handleCancelLogout = () => setLogoutConfirm(false);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
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
            <button onClick={() => navigate('/queue-management')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
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
=======
        toast.error(data.error || 'Failed to update ticket');
      }
    } catch {
      toast.error('Server error updating ticket');
    }
  };

  if (!user) return null;

  const filtered = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.ticket_number.toLowerCase().includes(q) ||
      t.service_type.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Queue Board"
      subtitle="Inspect, call, complete, or mark walk-in tickets across all active counters"
      actions={
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      }
    >
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80">
          {[
            { id: 'all', label: `All (${tickets.length})` },
            { id: 'serving', label: `Serving (${tickets.filter((t) => t.status === 'serving').length})` },
            { id: 'waiting', label: `Waiting (${tickets.filter((t) => t.status === 'waiting').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#0B1120] text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket or service..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Counter</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.length > 0 ? (
                  filtered.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className={`transition-colors ${
                        ticket.status === 'serving'
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-6 py-4 font-extrabold text-slate-900 tabular-nums">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {ticket.service_type}
                      </td>
                      <td className="px-6 py-4">
                        {ticket.priority_level > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                            <Sparkles className="w-3 h-3" /> High
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ticket.status === 'serving' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Serving
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase">
                            Waiting
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {ticket.counter || '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {ticket.status === 'waiting' && (
                          <>
                            <button
                              onClick={() => updateStatus(ticket.id, 'serving')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                            >
                              <Play className="w-3 h-3" /> Serve
                            </button>
                            <button
                              onClick={() => updateStatus(ticket.id, 'missed')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors"
                            >
                              <UserX className="w-3 h-3" /> Missed
                            </button>
                          </>
                        )}
                        {ticket.status === 'serving' && (
                          <button
                            onClick={() => updateStatus(ticket.id, 'completed')}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-14 text-center text-slate-400 text-sm">
                      No matching active tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
<<<<<<< HEAD
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
    </AppShell>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  );
};

export default QueueManagement;