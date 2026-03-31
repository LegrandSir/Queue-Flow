import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const ServiceManagement = ({ user }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', duration: 10 });
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services");
      toast.error("Failed to fetch services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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

  const handleSave = async () => {
    setLoading(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/services/${editing.id}` : '/api/services';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        fetchServices();
        setModalOpen(false);
        toast.success(editing ? 'Service updated' : 'Service added');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save service');
      }
    } catch (err) {
      toast.error('Error saving service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    const id = confirmDialog.id;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
        toast.success('Service deleted');
      } else {
        toast.error('Failed to delete service');
      }
    } catch (err) {
      toast.error('Error deleting service');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ open: false, id: null });
  };

  const toggleActive = async (service) => {
    const newActive = !service.active;
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      });
      if (res.ok) {
        fetchServices();
        toast.success(`Service ${newActive ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
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
            <button onClick={() => navigate('/admin-dashboard')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            {user.role === 'Admin' && (
              <>
                <button onClick={() => navigate('/admin/services')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
                  <span>🛠️</span> Services
                </button>
                <button onClick={() => navigate('/admin/staff')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
                  <span>👥</span> Staff
                </button>
                <button onClick={() => navigate('/admin/reports')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
                  <span>📊</span> Reports
                </button>
                <button onClick={() => navigate('/admin-settings')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
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

      <main className="flex-1 ml-64 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">Service Management</h1>
          <button
            onClick={() => openModal()}
            className="bg-officeq-blue text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600"
          >
            + Add Service
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Duration (min)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{svc.name}</td>
                  <td className="px-6 py-4">{svc.duration} min</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(svc)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        svc.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {svc.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => openModal(svc)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(svc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">{editing ? 'Edit Service' : 'New Service'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    min="1"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-officeq-blue text-white rounded-lg font-bold disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.open}
          title="Delete Service"
          message="Delete this service? It will be removed from the system."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />

        {/* Logout Confirmation Dialog */}
        <ConfirmDialog
          isOpen={logoutConfirm}
          title="Logout"
          message="Are you sure you want to log out?"
          onConfirm={handleLogoutConfirmed}
          onCancel={handleCancelLogout}
        />
      </main>
    </div>
  );
};

export default ServiceManagement;