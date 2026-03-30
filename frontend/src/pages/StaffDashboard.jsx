import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTickets, setActiveTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [nowServing, setNowServing] = useState('---');

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        const active = data.filter(s => s.active);
        setAvailableServices(active);
        if (active.length > 0) setSelectedService(active[0].name);
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    };
    fetchServices();
  }, []);

  // Fetch queue (waiting tickets)
  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/tickets/active');
      const data = await response.json();
      setActiveTickets(data);
    } catch (error) {
      console.error("Error fetching queue:", error);
    }
  };

  // Fetch currently serving ticket
  const fetchNowServing = async () => {
    try {
      const response = await fetch('/api/kiosk/status');
      const data = await response.json();
      setNowServing(data.currently_serving || '---');
    } catch (error) {
      console.error("Error fetching serving ticket:", error);
    }
  };

  // Poll both every 5 seconds
  useEffect(() => {
    fetchQueue();
    fetchNowServing();
    const interval = setInterval(() => {
      fetchQueue();
      fetchNowServing();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    if (!selectedService) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/tickets/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchQueue();
        fetchNowServing();  // immediately update serving ticket
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Failed to call next ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between fixed h-full">
        <div>
          <div className="flex items-center gap-2 text-officeq-blue font-bold text-xl mb-8">
            <span className="bg-officeq-blue text-white p-1 rounded">📋</span> OfficeQ
          </div>
          <nav className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/queue-management')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>📋</span> Queue Management
            </button>
            <button onClick={() => navigate('/staff-reports')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>📊</span> Reports
            </button>
            <button onClick={() => navigate('/staff-profile')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>👤</span> Profile
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2">
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-500 font-medium">Manage the live service queue</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="p-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-officeq-blue"
              >
                {availableServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <button
                onClick={handleCallNext}
                disabled={isLoading}
                className="bg-officeq-blue text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Calling...' : 'Call Next'}
              </button>
            </div>
          </header>

          {/* Now Serving Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase font-bold tracking-wider">Now Serving</p>
                <p className="text-5xl font-black text-officeq-blue mt-2">{nowServing}</p>
                <p className="text-gray-400 text-sm mt-1">Ticket currently at counter</p>
              </div>
              <div className="text-6xl">🎫</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QUEUE LIST */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-800">Waiting Tickets</h2>
                <span className="bg-blue-100 text-officeq-blue px-4 py-1 rounded-full text-sm font-bold">
                  {activeTickets.length} in line
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-black">
                    <tr>
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeTickets.length > 0 ? activeTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`font-black text-lg ${ticket.priority_level > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {ticket.ticket_number}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">{ticket.service_type}</td>
                        <td className="px-6 py-4">
                          {ticket.priority_level > 0 ? (
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">PRIORITY</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-black">STANDARD</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                          The queue is currently empty.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* STATS SIDEBAR */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-400 font-black text-sm uppercase mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Priority Waiting</span>
                    <span className="text-red-600 font-black">{activeTickets.filter(t => t.priority_level > 0).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Standard Waiting</span>
                    <span className="text-gray-900 font-black">{activeTickets.filter(t => t.priority_level === 0).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;