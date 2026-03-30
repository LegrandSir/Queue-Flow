import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StaffReports = ({ user }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/reports?days=${period}`);
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on period change and also set up polling every 10 seconds
  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [period]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar (same as before) */}
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
            <button onClick={() => navigate('/staff-reports')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
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

      <main className="flex-1 ml-64 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-gray-900">Performance Reports</h1>
          <button onClick={fetchReports} className="bg-officeq-blue text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600">
            Refresh
          </button>
        </div>
        <div className="mb-6 flex gap-4">
          <label className="font-medium">Period:</label>
          <select value={period} onChange={(e) => setPeriod(parseInt(e.target.value))} className="border rounded p-2">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-officeq-blue"></div></div>
        ) : reports ? (
          <>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <p className="text-gray-400 text-sm uppercase font-bold">Tickets Served</p>
                <p className="text-4xl font-black">{reports.total_served}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <p className="text-gray-400 text-sm uppercase font-bold">Avg. Wait Time</p>
                <p className="text-4xl font-black">{reports.avg_wait_minutes} min</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-4">Daily Ticket Volume</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reports.daily_counts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#1F9EF9" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : <p>No data</p>}
      </main>
    </div>
  );
};

export default StaffReports;