import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Clock, Layers, X, AlertTriangle } from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch } from '../lib/api';

const ServiceManagement = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', duration: 10 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      const res = await apiFetch('/api/services');
      if (res.ok) setServices(await res.json());
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditing(service);
      setForm({ name: service.name, duration: service.duration });
    } else {
      setEditing(null);
      setForm({ name: '', duration: 10 });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    setSaving(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/services/${editing.id}` : '/api/services';

    try {
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({
          name: form.name.trim(),
          duration: Number(form.duration) || 10,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editing ? 'Service updated' : 'New service added');
        fetchServices();
        setModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to save service');
      }
    } catch {
      toast.error('Server error saving service');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiFetch(`/api/services/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Removed "${deleteTarget.name}"`);
        fetchServices();
      } else {
        toast.error('Failed to delete service');
      }
    } catch {
      toast.error('Server error deleting service');
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggleActive = async (service) => {
    const newActive = !service.active;
    try {
      const res = await apiFetch(`/api/services/${service.id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: newActive }),
      });
      if (res.ok) {
        toast.success(`${service.name} ${newActive ? 'activated' : 'paused'}`);
        fetchServices();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (!user || user.role !== 'Admin') return null;

  const activeCount = services.filter((s) => s.active).length;

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Service Catalog"
      subtitle={`Configure kiosk departments and SLA durations · ${activeCount} of ${services.length} live on kiosk`}
      actions={
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      }
    >
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">SLA Duration</th>
                <th className="px-6 py-4">Kiosk Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900">{svc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {svc.duration} min
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(svc)}
                      className="inline-flex items-center gap-2.5 group"
                    >
                      <span
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          svc.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                            svc.active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          svc.active ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {svc.active ? 'Active' : 'Paused'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(svc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(svc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-slate-900">
                  {editing ? 'Edit Service' : 'Create Service'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Loan Advisory"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
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
              <h3 className="text-base font-extrabold text-slate-900">Delete Service?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                <span className="font-bold text-slate-800">{deleteTarget.name}</span> will be permanently removed from the kiosk menu.
              </p>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};

export default ServiceManagement;