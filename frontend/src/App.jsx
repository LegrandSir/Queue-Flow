import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MobileTicketView from './pages/MobileTicketView';
import AdminSettings from './pages/AdminSettings';
import ServiceManagement from './pages/ServiceManagement';
import StaffManagement from './pages/StaffManagement';
import QueueReports from './pages/QueueReports';

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
        <Routes>
          <Route path="/" element={<KioskPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
          <Route path="/admin-settings" element={<AdminSettings user={user} onLogout={handleLogout} />} />
          <Route path="/admin/services" element={<ServiceManagement user={user} onLogout={handleLogout} />} />
          <Route path="/admin/staff" element={<StaffManagement user={user} onLogout={handleLogout} />} />
          <Route path="/ticket/:ticketNumber" element={<MobileTicketView />} />
          <Route path="/admin/reports" element={<QueueReports user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
