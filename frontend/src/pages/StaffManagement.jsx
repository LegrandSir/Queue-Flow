import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';   // adjust path if needed

const StaffManagement = ({ user }) => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    full_name: '', 
    id_number: '', 
    counter: '' 
  });
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });  // <-- added

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error("Failed to fetch staff");
      toast.error("Failed to fetch staff");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openModal = (staffMember = null) => {
    if (staffMember) {
      setEditing(staffMember);
      setForm({
        email: staffMember.email,
        password: '',
        full_name: staffMember.full_name || '',
        id_number: staffMember.id_number || '',
        counter: staffMember.counter || ''
      });
    } else {
      setEditing(null);
      setForm({ email: '', password: '', full_name: '', id_number: '', counter: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/staff/${editing.id}` : '/api/staff';
    const body = { ...form };
    if (!editing && !body.password) {
      toast.error('Password is required for new staff');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchStaff();
        setModalOpen(false);
        toast.success(editing ? 'Staff updated' : 'Staff added');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save staff');
      }
    } catch (err) {
      toast.error('Error saving staff');
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
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff();
        toast.success('Staff removed');
      } else {
        toast.error('Failed to delete staff');
      }
    } catch (err) {
      toast.error('Error deleting staff');
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ open: false, id: null });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between fixed h-full">
        <div>
          <div className="flex items-center gap-2 text-officeq-blue font-bold text-xl mb-8">
            <span className="bg-officeq-blue text-white p-1 rounded">📋</span> OfficeQ
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
                <button onClick={() => navigate('/admin/staff')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
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
        <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2">
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">Staff Management</h1>
          <button
            onClick={() => openModal()}
            className="bg-officeq-blue text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600"
          >
            + Add Staff
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">ID Number</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Counter / Desk</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{member.full_name || '—'}</td>
                  <td className="px-6 py-4">{member.id_number || '—'}</td>
                  <td className="px-6 py-4">{member.email}</td>
                  <td className="px-6 py-4">{member.counter || '—'}</td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => openModal(member)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(member.id)}
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
              <h2 className="text-2xl font-bold mb-4">{editing ? 'Edit Staff' : 'Add Staff'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={form.id_number}
                    onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder={editing ? 'Leave blank to keep unchanged' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Counter / Desk</label>
                  <input
                    type="text"
                    value={form.counter}
                    onChange={(e) => setForm({ ...form, counter: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="e.g., Counter 1"
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

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.open}
          title="Remove Staff Member"
          message="Remove this staff member? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </main>
    </div>
  );
};

export default StaffManagement;