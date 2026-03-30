import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [totalTickets, setTotalTickets] = useState(0);
  const [activeTickets, setActiveTickets] = useState([]);
  const [staffCount, setStaffCount] = useState(0);
  const [staffList, setStaffList] = useState([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [serviceList, setServiceList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'tickets', 'staff', 'services'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    if (user.role !== 'Admin') navigate('/dashboard');
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [ticketsRes, staffRes, servicesRes] = await Promise.all([
        fetch('/api/tickets/active'),
        fetch('/api/staff'),
        fetch('/api/services')
      ]);
      const tickets = await ticketsRes.json();
      const staff = await staffRes.json();
      const services = await servicesRes.json();
      setActiveTickets(tickets);
      setTotalTickets(tickets.length);
      setStaffList(staff);
      setStaffCount(staff.length);
      const activeServices = services.filter(s => s.active);
      setServiceList(activeServices);
      setServiceCount(activeServices.length);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
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
            <button onClick={() => navigate('/admin-dashboard')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/admin/services')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>🛠️</span> Services
            </button>
            <button onClick={() => navigate('/admin/staff')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>👥</span> Staff
            </button>
            <button onClick={() => navigate('/admin/reports')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>📊</span> Analytics
            </button>
            <button onClick={() => navigate('/admin-settings')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>⚙️</span> Admin Settings
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2">
          <span>🚪</span> Logout
        </button>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back, {user.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Tickets Card */}
          <div 
            onClick={() => openModal('tickets')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-gray-400 text-sm uppercase font-bold">Active Tickets</p>
            <p className="text-4xl font-black text-gray-900">{totalTickets}</p>
            <p className="text-xs text-officeq-blue mt-2">Click to view list →</p>
          </div>

          {/* Staff Members Card */}
          <div 
            onClick={() => openModal('staff')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-gray-400 text-sm uppercase font-bold">Staff Members</p>
            <p className="text-4xl font-black text-gray-900">{staffCount}</p>
            <p className="text-xs text-officeq-blue mt-2">Click to view list →</p>
          </div>

          {/* Active Services Card */}
          <div 
            onClick={() => openModal('services')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-gray-400 text-sm uppercase font-bold">Active Services</p>
            <p className="text-4xl font-black text-gray-900">{serviceCount}</p>
            <p className="text-xs text-officeq-blue mt-2">Click to view list →</p>
          </div>
        </div>
      </main>

      {/* Modal for Details */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {modalType === 'tickets' && 'Active Tickets'}
                {modalType === 'staff' && 'Staff Members'}
                {modalType === 'services' && 'Active Services'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {modalType === 'tickets' && (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-sm">
                    <tr><th className="px-4 py-2">Ticket</th><th className="px-4 py-2">Service</th><th className="px-4 py-2">Priority</th><th className="px-4 py-2">Time</th></tr>
                  </thead>
                  <tbody>
                    {activeTickets.map(t => (
                      <tr key={t.id} className="border-b"><td className="px-4 py-2 font-bold text-officeq-blue">{t.ticket_number}</td><td className="px-4 py-2">{t.service_type}</td><td className="px-4 py-2">{t.priority_level > 0 ? 'HIGH' : 'NORMAL'}</td><td className="px-4 py-2">{new Date(t.created_at).toLocaleTimeString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              {modalType === 'staff' && (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-sm">
                    <tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">ID</th><th className="px-4 py-2">Email</th><th className="px-4 py-2">Counter</th></tr>
                  </thead>
                  <tbody>
                    {staffList.map(s => (
                      <tr key={s.id} className="border-b"><td className="px-4 py-2">{s.full_name || '—'}</td><td className="px-4 py-2">{s.id_number || '—'}</td><td className="px-4 py-2">{s.email}</td><td className="px-4 py-2">{s.counter || '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
              {modalType === 'services' && (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-sm">
                    <tr><th className="px-4 py-2">Service Name</th><th className="px-4 py-2">Duration (min)</th></tr>
                  </thead>
                  <tbody>
                    {serviceList.map(s => (
                      <tr key={s.id} className="border-b"><td className="px-4 py-2">{s.name}</td><td className="px-4 py-2">{s.duration}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;