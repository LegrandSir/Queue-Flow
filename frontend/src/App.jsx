import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import KioskPage from './pages/KioskPage';
import DisplayBoard from './pages/DisplayBoard';
import LoginPage from './pages/LoginPage';
import StaffDashboard from './pages/StaffDashboard';
import MobileTicketView from './pages/MobileTicketView';
import AdminSettings from './pages/AdminSettings';
import ServiceManagement from './pages/ServiceManagement';
import StaffManagement from './pages/StaffManagement';
import QueueReports from './pages/QueueReports';
import QueueManagement from './pages/QueueManagement';
import StaffReports from './pages/StaffReports';
import StaffProfile from './pages/StaffProfile';
import AdminDashboard from './pages/AdminDashboard';
<<<<<<< HEAD
import { Toaster } from 'react-hot-toast';
=======
import DemoFloatingBar from './components/DemoFloatingBar';
import { apiFetch } from './lib/api';

function AppRoutes({ user, onLogin, onLogout }) {
  const navigate = useNavigate();

  const handleQuickSwitch = async (targetRole) => {
    const creds =
      targetRole === 'Admin'
        ? { email: 'admin@queueflow.io', password: 'Admin123!' }
        : { email: 'staff@queueflow.io', password: 'Staff123!' };

    try {
      const res = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
        toast.success(`Switched to Demo ${targetRole}`);
        navigate(targetRole === 'Admin' ? '/admin-dashboard' : '/dashboard');
      } else {
        toast.error('Demo account not seeded yet');
      }
    } catch {
      toast.error('Cannot reach backend server');
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<KioskPage />} />
        <Route path="/display" element={<DisplayBoard />} />
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/ticket/:ticketNumber" element={<MobileTicketView />} />

        {/* Staff Workspace */}
        <Route
          path="/dashboard"
          element={<StaffDashboard user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
        <Route
          path="/queue-management"
          element={<QueueManagement user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
        <Route
          path="/staff-reports"
          element={<StaffReports user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
        <Route
          path="/staff-profile"
          element={<StaffProfile user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />

        {/* Admin Workspace */}
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
        <Route
          path="/admin-settings"
          element={<AdminSettings user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
        <Route
          path="/admin/services"
          element={<ServiceManagement user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
        <Route
          path="/admin/staff"
          element={<StaffManagement user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
        <Route
          path="/admin/reports"
          element={<QueueReports user={user} onLogout={onLogout} onQuickSwitch={handleQuickSwitch} />}
        />
      </Routes>
      <DemoFloatingBar onQuickSwitch={handleQuickSwitch} />
    </>
  );
}
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
<<<<<<< HEAD
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<KioskPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          {/* Staff dashboard - for both staff and admin (admin will see extra links) */}
          <Route path="/dashboard" element={<StaffDashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin-settings" element={<AdminSettings user={user} onLogout={handleLogout} />} />
          <Route path="/admin/services" element={<ServiceManagement user={user} onLogout={handleLogout} />} />
          <Route path="/admin/staff" element={<StaffManagement user={user} onLogout={handleLogout} />} />
          <Route path="/ticket/:ticketNumber" element={<MobileTicketView />} />
          <Route path="/admin/reports" element={<QueueReports user={user} />} />
          <Route path="/queue-management" element={<QueueManagement user={user} />} />
          <Route path="/staff-reports" element={<StaffReports user={user} />} />
          <Route path="/staff-profile" element={<StaffProfile user={user} />} />
          <Route path="/admin-dashboard" element={<AdminDashboard user={user} />} />
        </Routes>
      </div>
=======
      <Toaster position="top-right" richColors closeButton />
      <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    </Router>
  );
}

export default App;