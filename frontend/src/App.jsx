import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; // This serves as your Staff Dashboard
import MobileTicketView from './pages/MobileTicketView';
import AdminSettings from './pages/AdminSettings';

function App() {
  return (
    <Router>
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Entrance: Where customers select their service */}
          <Route path="/" element={<KioskPage />} />

          {/* Secure Entrance: For Staff and Admin to authenticate */}
          <Route path="/login" element={<LoginPage />} />

          {/* Management Dashboard: 
            This is the "Staff Page" where employees call the next ticket 
            and see the live queue sorted by priority.
          */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin Management: 
            Advanced settings for clearing the queue, 
            exporting CSVs, and adjusting system defaults.
          */}
          <Route path="/admin-settings" element={<AdminSettings />} />
          
          {/* Mobile Live Ticket Tracker: 
            Customers scan a QR code on their ticket and see 
            their live position in line via this route.
          */}
          <Route path="/ticket/:ticketNumber" element={<MobileTicketView />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;