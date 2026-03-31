import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

const StaffProfile = ({ user }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    email: '',
    full_name: '',
    id_number: '',
    counter: ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/staff/profile?email=${user.email}`);
      const data = await res.json();
      setProfile({
        email: data.email,
        full_name: data.full_name || '',
        id_number: data.id_number || '',
        counter: data.counter || ''
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    if (newPassword && newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    const payload = {
      email: profile.email,
      full_name: profile.full_name,
      counter: profile.counter
    };
    if (currentPassword && newPassword) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }
    try {
      const res = await fetch('/api/staff/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully');
        toast.success('Profile updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (currentPassword && newPassword) {
          toast.success('Password changed. Please log in again.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      } else {
        setMessage(data.error || 'Update failed');
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      setMessage('Error updating profile');
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
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
          <div className="flex items-center gap-2 text-officeq-blue font-bold text-xl mb-8">
            <span className="bg-officeq-blue text-white p-1 rounded">📋</span> OfficeQ
          </div>
          <nav className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/queue-management')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>📋</span> Queue Management
            </button>
            <button onClick={() => navigate('/staff-reports')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>📊</span> Reports
            </button>
            <button onClick={() => navigate('/staff-profile')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
              <span>👤</span> Profile
            </button>
          </nav>
        </div>
        <button onClick={openLogoutConfirm} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2">
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <h1 className="text-3xl font-black text-gray-900 mb-6">My Profile</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-lg">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input type="email" value={profile.email} disabled className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">ID Number</label>
              <input type="text" value={profile.id_number} disabled className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100" />
              <p className="text-xs text-gray-400 mt-1">ID cannot be changed. Contact admin for corrections.</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Counter / Desk</label>
              <input type="text" value={profile.counter} onChange={(e) => setProfile({...profile, counter: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <hr className="my-4" />
            <div>
              <label className="block text-gray-700 font-medium mb-2">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            <button type="submit" disabled={loading} className="bg-officeq-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50">
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
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
  );
};

export default StaffProfile;