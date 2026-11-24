import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
=======
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Save,
  Download,
  Trash2,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch, apiUrl } from '../lib/api';
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

const AdminSettings = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    max_wait_time: '15',
    avg_service_duration: '8',
    office_name: 'QueueFlow Nairobi HQ',
    priority_escalation: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
<<<<<<< HEAD
  const [logoutConfirm, setLogoutConfirm] = useState(false);
=======
  const [confirmAction, setConfirmAction] = useState(null); // 'clear' | 'reboot' | null
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({
            ...prev,
            max_wait_time: data.max_wait_time || prev.max_wait_time,
            avg_service_duration: data.avg_service_duration || prev.avg_service_duration,
            office_name: data.office_name || prev.office_name,
            priority_escalation:
              data.priority_escalation === undefined
                ? prev.priority_escalation
                : data.priority_escalation === 'true' || data.priority_escalation === true,
          }));
        }
      } catch (err) {
<<<<<<< HEAD
        console.error("Failed to fetch settings", err);
        toast.error("Failed to load settings");
=======
        console.error('Failed to fetch settings', err);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user, navigate]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/settings/update', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
<<<<<<< HEAD
      toast.success("Setting saved");
    } catch (err) {
      console.error("Failed to save setting", err);
      toast.error("Failed to save setting");
=======
      if (res.ok) {
        toast.success('Branch settings saved');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Server error saving settings');
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
<<<<<<< HEAD
      const response = await fetch('/api/system/export-csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `officeq_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Data exported successfully");
      } else {
        toast.error("Export failed");
      }
    } catch (err) {
      toast.error("Failed to export data");
    }
  };

  const handleClearCache = async () => {
    if (window.confirm("Warning: This will delete ALL active tickets. Continue?")) {
      const response = await fetch('/api/system/clear-cache', { method: 'POST' });
      if (response.ok) {
        toast.success("Queue cache cleared!");
      } else {
        toast.error("Clear cache failed");
      }
    }
  };

  const handleReboot = async () => {
    if (window.confirm("Reboot will reset SLA targets and reload the system. Continue?")) {
      const response = await fetch('/api/system/reboot', { method: 'POST' });
      if (response.ok) {
        toast.success("System rebooted. Page will reload.");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Reboot failed");
      }
    }
  };

  const openLogoutConfirm = () => setLogoutConfirm(true);
  const handleLogoutConfirmed = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast.success("Logged out");
  };
  const handleCancelLogout = () => setLogoutConfirm(false);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between fixed h-full">
        <div>
          <div className="flex items-center gap-2 mb-8">
      <img src="/logo.png" alt="OfficeQ Logo" className="h-8 w-auto" />
      <span className="text-officeq-blue font-bold text-xl">OfficeQ</span>
    </div>
          <nav className="space-y-2">
            <button onClick={() => navigate('/admin-dashboard')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            {user.role === 'Admin' && (
              <>
                <button onClick={() => navigate('/admin/services')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
                  <span>🛠️</span> Services
                </button>
                <button onClick={() => navigate('/admin/staff')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
                  <span>👥</span> Staff
                </button>
                <button onClick={() => navigate('/admin/reports')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
                  <span>📊</span> Reports
                </button>
                <button onClick={() => navigate('/admin-settings')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
                  <span>⚙️</span> Admin Settings
                </button>
              </>
            )}
          </nav>
        </div>
        <button onClick={openLogoutConfirm} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2">
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-gray-500 mb-8 tracking-tight">Configure system parameters, branch details, and operational tools.</p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-officeq-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {/* System Settings Column */}
            <div className="col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold mb-6">System Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Wait Time (minutes)</label>
                    <input
                      type="number"
                      value={settings.max_wait_time}
                      onChange={(e) => handleUpdate('max_wait_time', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-officeq-blue focus:border-officeq-blue"
                      min="1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Customers will be alerted when wait exceeds this limit.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Average Service Duration (minutes)</label>
                    <input
                      type="text"
                      value={settings.avg_service_duration}
                      onChange={(e) => handleUpdate('avg_service_duration', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      placeholder="e.g., 5-10"
                    />
                    <p className="text-xs text-gray-400 mt-1">Used for wait time estimation.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Office/Branch Name</label>
                    <input
                      type="text"
                      value={settings.office_name}
                      onChange={(e) => handleUpdate('office_name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority Escalation</label>
                      <p className="text-xs text-gray-400">Allow priority tickets (PWD, elderly) to jump the queue.</p>
                    </div>
                    <button
                      onClick={() => handleUpdate('priority_escalation', !settings.priority_escalation)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.priority_escalation ? 'bg-officeq-blue' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.priority_escalation ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                {saving && <p className="text-sm text-green-600 mt-4">Saving...</p>}
              </section>
=======
      const res = await fetch(apiUrl('/api/system/export-csv'));
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `queueflow_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Ticket dataset exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const executeDangerAction = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    try {
      const endpoint = action === 'clear' ? '/api/system/clear-cache' : '/api/system/reboot';
      const res = await apiFetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Operation completed');
        if (action === 'reboot') {
          setTimeout(() => window.location.reload(), 600);
        }
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch {
      toast.error('Server error');
    }
  };

  if (!user || user.role !== 'Admin') return null;

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Branch Settings"
      subtitle="Configure SLA thresholds, lobby branding, and sandbox maintenance controls"
    >
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Configuration Form */}
          <form
            onSubmit={handleSaveSettings}
            className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">SLA & Branch Parameters</h2>
                <p className="text-xs text-slate-500">
                  Changes sync directly to the Kiosk header and Waiting Room TV display
                </p>
              </div>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Branch / Office Display Name
              </label>
              <input
                type="text"
                value={settings.office_name}
                onChange={(e) => setSettings({ ...settings, office_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Max Wait SLA Alert (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.max_wait_time}
                  onChange={(e) => setSettings({ ...settings, max_wait_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Triggers operations alert when queue wait exceeds threshold.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Baseline Service Duration (min)
                </label>
                <input
                  type="text"
                  value={settings.avg_service_duration}
                  onChange={(e) =>
                    setSettings({ ...settings, avg_service_duration: e.target.value })
                  }
                  placeholder="e.g., 8"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Fallback duration used for wait estimation.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Priority Fast-Track Routing</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allows elderly, PWD, and expectant mothers to select priority on the kiosk.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    priority_escalation: !settings.priority_escalation,
                  })
                }
                className={`relative inline-flex h-7 w-12 items-center rounded-full shrink-0 transition-colors ${
                  settings.priority_escalation ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition-transform ${
                    settings.priority_escalation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>

          {/* Right: Operations Tools & Telemetry */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Operations & Maintenance</h3>

              <button
                onClick={handleExportData}
                className="w-full py-3 px-4 rounded-xl bg-[#0B1120] hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> Export Full Ticket CSV
              </button>

              <button
                onClick={() => setConfirmAction('clear')}
                className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear Active Queue
              </button>

              <button
                onClick={() => setConfirmAction('reboot')}
                className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/70 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Reset Sandbox & SLA Defaults
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">System Telemetry</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">API Status</span>
                  <span className="font-bold text-emerald-600">Operational (99.9%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Engine Version</span>
                  <span className="font-bold text-slate-700">QueueFlow v2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Dispatch Policy</span>
                  <span className="font-bold text-slate-700">
                    {settings.priority_escalation ? 'Priority-First' : 'Strict FIFO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Timezone</span>
                  <span className="font-bold text-slate-700">Africa/Nairobi (EAT)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmAction(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200"
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {confirmAction === 'clear' ? 'Clear Active Queue?' : 'Reset Sandbox Data?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {confirmAction === 'clear'
                  ? 'All waiting and currently serving tickets will be cleared while preserving historical analytics.'
                  : 'This resets SLA targets and repopulates a fresh 7-day sample dataset for demo testing.'}
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDangerAction}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
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
      </AnimatePresence>
    </AppShell>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  );
};

export default AdminSettings;