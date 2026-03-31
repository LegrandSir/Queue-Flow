import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
// Rename the old Dashboard to AdminDashboard if you still need it
// For now, we'll use StaffDashboard for /dashboard
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
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
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
    </Router>
  );
}

export default App;
