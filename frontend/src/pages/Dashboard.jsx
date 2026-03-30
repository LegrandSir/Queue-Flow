import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [servingTickets, setServingTickets] = useState({});
  const [availableServices, setAvailableServices] = useState([]);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch services and initialize servingTickets
  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      const activeServices = data.filter(s => s.active);
      setAvailableServices(activeServices);
      
      // Update servingTickets: keep existing values, add new services with '---', remove inactive ones
      setServingTickets(prev => {
        const newServing = {};
        activeServices.forEach(s => {
          newServing[s.name] = prev[s.name] || '---';
        });
        return newServing;
      });
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets/active');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) { 
      console.error("Error fetching tickets:", error); 
    }
  };

  const fetchAIInsights = async () => {
    setLoadingInsight(true);
    try {
      const response = await fetch('/api/admin/ai-insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setInsight("⚠️ Unable to load insights at this time.");
    } finally {
      setLoadingInsight(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchServices();
    fetchTickets();
    fetchAIInsights();
  }, []);

  // Polling for tickets and insights (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets();
      fetchAIInsights();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCallNext = async (serviceName) => {
    try {
      const response = await fetch('/api/tickets/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: serviceName }),
      });
      const data = await response.json();
      if (response.ok) {
        setServingTickets(prev => ({ ...prev, [serviceName]: data.ticket_number }));
        fetchTickets();   // refresh waiting list
        fetchAIInsights(); // refresh insights
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error calling ticket:", error);
      alert("Failed to call next ticket. Check console.");
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
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
            {user?.role === 'Admin' && (
              <>
                <button onClick={() => navigate('/admin/services')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
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
        <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center gap-2">
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Queue Management</h1>
            <p className="text-gray-400 font-medium">Welcome back, {user?.role}!</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full border border-gray-100 shadow-sm">
            <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=007AFF&color=fff`} className="w-10 h-10 rounded-full" alt="avatar" />
            <span className="font-bold text-gray-700 text-sm">{user?.email}</span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-bold uppercase text-xs mb-2">Waiting Tickets</p>
            <div className="text-3xl font-black text-gray-900">{tickets.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-bold uppercase text-xs mb-2">Priority Line</p>
            <div className="text-3xl font-black text-red-600">{tickets.filter(t => t.priority_level > 0).length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2 text-right">
            <p className="text-gray-400 font-bold uppercase text-xs mb-2">System Status</p>
            <div className="text-3xl font-black text-green-500 flex items-center justify-end gap-2">Online <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span></div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gray-900 rounded-3xl p-8 mb-10 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-2xl">🧠</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
              </div>
              <h2 className="text-white font-black text-xl tracking-tight">Operations Insights</h2>
            </div>
            <button 
              onClick={fetchAIInsights}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-white/10"
            >
              {loadingInsight ? 'Analyzing...' : 'Refresh Analysis'}
            </button>
          </div>
          {insight ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <p className="text-blue-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {insight}
              </p>
            </div>
          ) : (
            <div className="text-gray-500 text-sm font-medium animate-pulse italic">
              Analyzing queue patterns...
            </div>
          )}
        </div>

        {/* Service Controls */}
        <h2 className="text-xl font-bold text-gray-800 mb-6">Service Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {availableServices.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4">{service.name}</h3>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-gray-400 uppercase font-black">Serving</span>
                <span className="text-3xl font-black text-officeq-blue">{servingTickets[service.name] || '---'}</span>
              </div>
              <button 
                onClick={() => handleCallNext(service.name)}
                className="w-full py-3 bg-officeq-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95"
              >
                Call Next
              </button>
            </div>
          ))}
        </div>

        {/* Waiting List Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-6">Waiting List</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-100">
                <th className="pb-4 font-medium">Ticket</th>
                <th className="pb-4 font-medium">Type</th>
                <th className="pb-4 font-medium">Priority</th>
                <th className="pb-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-4 font-bold text-officeq-blue">{t.ticket_number}</td>
                  <td className="py-4 text-sm font-medium text-gray-600">{t.service_type}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${t.priority_level > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      {t.priority_level > 0 ? 'HIGH' : 'NORMAL'}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-500">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400 font-medium italic">No active tickets in queue.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;