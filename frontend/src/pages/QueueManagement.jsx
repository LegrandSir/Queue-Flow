import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';  // <-- added

const QueueManagement = ({ user }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets/active');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch tickets');  // <-- added
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchTickets();
        toast.success(`Ticket status updated to ${status}`);  // <-- added
      } else {
        toast.error('Failed to update status');  // <-- replaced alert
      }
    } catch (err) {
      toast.error('Error updating status');  // <-- replaced alert
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out');  // <-- added (optional)
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
            <button onClick={() => navigate('/dashboard')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
              <span>🏠</span> Dashboard
            </button>
            <button onClick={() => navigate('/queue-management')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
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

      <main className="flex-1 ml-64 p-10">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Queue Management</h1>
        {loading ? (
          <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-officeq-blue"></div></div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className={`hover:bg-gray-50 ${ticket.status === 'serving' ? 'bg-green-50' : ''}`}>
                    <td className="px-6 py-4 font-bold text-officeq-blue">{ticket.ticket_number}</td>
                    <td className="px-6 py-4">{ticket.service_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.priority_level > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        {ticket.priority_level > 0 ? 'HIGH' : 'NORMAL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {ticket.status === 'serving' ? (
                        <span className="text-green-600 font-bold">SERVING</span>
                      ) : ticket.status === 'waiting' ? (
                        <span className="text-yellow-600 font-bold">WAITING</span>
                      ) : ticket.status}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {ticket.status === 'waiting' && (
                        <>
                          <button onClick={() => updateStatus(ticket.id, 'serving')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Serve</button>
                          <button onClick={() => updateStatus(ticket.id, 'missed')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Missed</button>
                        </>
                      )}
                      {ticket.status === 'serving' && (
                        <button onClick={() => updateStatus(ticket.id, 'completed')} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Complete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default QueueManagement;
