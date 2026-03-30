import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';   // <-- added
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const QueueReports = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [efficiency, setEfficiency] = useState([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/stats?days=${period}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
      toast.error("Failed to fetch statistics");   // <-- added
    } finally {
      setLoading(false);
    }
  };

  const fetchEfficiency = async () => {
    try {
      const response = await fetch('/api/reports/efficiency');
      if (!response.ok) throw new Error('Failed to fetch efficiency');
      const data = await response.json();
      setEfficiency(data);
    } catch (err) {
      console.error("Failed to fetch efficiency", err);
      toast.error("Failed to fetch efficiency data");   // <-- added
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEfficiency();
  }, [period]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out');   // <-- added (optional)
  };

  if (!user) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
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
                <button onClick={() => navigate('/admin/staff')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
                  <span>👥</span> Staff
                </button>
                <button onClick={() => navigate('/admin/reports')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">Queue Reports & Analytics</h1>
        <p className="text-gray-500 mb-8 tracking-tight">Performance metrics and ticket statistics.</p>

        {/* Period selector */}
        <div className="mb-6 flex gap-4 items-center">
          <label className="font-medium">Period:</label>
          <select value={period} onChange={(e) => setPeriod(parseInt(e.target.value))} className="border border-gray-300 rounded-lg p-2">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-officeq-blue"></div></div>
        ) : stats ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm uppercase font-bold">Total Tickets</p>
                <p className="text-4xl font-black text-gray-900">{stats.total_tickets}</p>
                <p className="text-xs text-gray-400 mt-2">Last {stats.period_days} days</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm uppercase font-bold">Avg. Wait Time</p>
                <p className="text-4xl font-black text-gray-900">{stats.avg_wait_minutes} min</p>
                <p className="text-xs text-gray-400 mt-2">Estimated (real data requires tracking)</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm uppercase font-bold">Priority / Normal</p>
                <p className="text-2xl font-black text-gray-900">
                  <span className="text-red-600">{stats.priority_count}</span> / <span className="text-green-600">{stats.normal_count}</span>
                </p>
              </div>
            </div>

            {/* Daily Ticket Volume Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
              <h2 className="text-xl font-bold mb-4">Daily Ticket Volume</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.daily_counts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#1F9EF9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Service Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
              <h2 className="text-xl font-bold mb-4">Tickets by Service Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.service_stats} dataKey="count" nameKey="service" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                    {stats.service_stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Service Efficiency Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Service Efficiency (Avg Handling Time)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={efficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg_handling_minutes" fill="#1F9EF9" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-4">* Based on configured service durations. For actual times, track start/end timestamps.</p>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </main>
    </div>
  );
};

export default QueueReports;