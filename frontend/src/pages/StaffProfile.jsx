import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
=======
import { toast } from 'sonner';
import { User, Lock, Save, BadgeCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import { apiFetch } from '../lib/api';
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

const StaffProfile = ({ user, onLogout, onQuickSwitch }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    email: '',
    full_name: '',
    id_number: '',
    counter: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
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
=======
    if (!user) {
      navigate('/login');
      return;
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    }
    const fetchProfile = async () => {
      try {
        const res = await apiFetch(`/api/staff/profile?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            email: data.email || '',
            full_name: data.full_name || '',
            id_number: data.id_number || '',
            counter: data.counter || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
<<<<<<< HEAD
      setMessage('New passwords do not match');
      toast.error('New passwords do not match');
=======
      toast.error('New passwords do not match.');
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
      return;
    }

    setLoading(true);
    const payload = {
      email: profile.email,
      full_name: profile.full_name,
      counter: profile.counter,
    };
    if (currentPassword && newPassword) {
      payload.current_password = currentPassword;
      payload.new_password = newPassword;
    }

    try {
      const res = await apiFetch('/api/staff/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
<<<<<<< HEAD
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
=======
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        toast.success('Profile updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (payload.new_password) {
          toast.info('Password updated. Please sign in again.');
          if (onLogout) onLogout();
          navigate('/login');
        }
      } else {
        toast.error(data.error || 'Update failed.');
      }
    } catch {
      toast.error('Error updating profile.');
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  if (!user) return null;

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onQuickSwitch={onQuickSwitch}
      title="Staff Profile"
      subtitle="Manage your assigned service desk counter and account security"
    >
      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Identity & Counter */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Desk & Identity</h2>
              <p className="text-xs text-slate-500">Shown on lobby displays when you call tickets</p>
            </div>
          </div>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Staff ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.id_number}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500"
                />
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Counter</label>
              <input
                type="text"
                value={profile.counter}
                onChange={(e) => setProfile({ ...profile, counter: e.target.value })}
                placeholder="Counter 1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>
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

        {/* Password Security */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Leave blank if you only want to update desk info</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </AppShell>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
  );
};

export default StaffProfile;