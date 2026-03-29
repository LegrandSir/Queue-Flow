import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [settings, setSettings] = useState({
    max_wait_time: '15',
    avg_service_duration: '5-10',
    priority_escalation: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to fetch settings");
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await fetch('/api/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value })
    });
  };

  const handleConfigure = (serviceName) => {
    setEditingService({
      name: serviceName,
      prefix: serviceName.charAt(0),
      flow: 'Standard Queue'
    });
    setIsModalOpen(true);
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/system/export-csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `officeq_data_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      alert("Failed to export data");
    }
  };

  const handleClearCache = async () => {
    if (window.confirm("Warning: This will delete ALL active tickets. Continue?")) {
      const response = await fetch('/api/system/clear-cache', { method: 'POST' });
      if (response.ok) alert("Queue cache cleared!");
    }
  };

  const handleReboot = async () => {
    const response = await fetch('/api/system/reboot', { method: 'POST' });
    if (response.ok) {
      alert("System rebooted: SLA targets reset.");
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-officeq-blue font-bold text-xl mb-8">
            <span className="bg-officeq-blue text-white p-1 rounded">📋</span> OfficeQ
          </div>
          <nav className="space-y-2">
            <button onClick={() => navigate('/dashboard')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50">🏠 Dashboard</button>
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold">⚙️ Admin Settings</button>
          </nav>
        </div>
        <button onClick={() => navigate('/login')} className="w-full text-left p-3 text-red-500 font-bold hover:bg-red-50">🚪 Logout</button>
      </aside>

      <main className="flex-1 p-10 relative">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-gray-500 mb-8 tracking-tight">Configure service types, process flows, and SLA targets.</p>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {/* Service Definitions */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Service Definitions</h2>
                <button className="text-sm bg-gray-100 px-3 py-1 rounded-lg font-bold">+ Add New</button>
              </div>
              <div className="space-y-4">
                {['General Inquiry', 'Technical Support', 'Payments', 'Account Opening', 'Document Submission'].map((service) => (
                  <div key={service} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-gray-700">{service}</span>
                    <button onClick={() => handleConfigure(service)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">Configure</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Reports & Tools - Added based on design */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Reports & Tools</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="font-medium text-gray-700">Export All Ticket Data</span>
                  <button onClick={handleExportData} className="text-officeq-blue font-bold hover:underline">Download CSV</button>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="font-medium text-gray-700">Daily Volume Trends</span>
                  <button className="text-officeq-blue font-bold hover:underline">View Report</button>
                </div>
              </div>
            </section>
          </div>

          {/* System Actions Sidebar */}
          <div className="space-y-8">
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold mb-4">System Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">System Uptime</span>
                  <span className="font-bold text-green-500">99.9%</span>
                </div>
                <button onClick={handleClearCache} className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors">Clear System Cache</button>
                <button onClick={handleReboot} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-100">Reboot Services</button>
              </div>
            </section>
          </div>
        </div>

        {/* Configuration Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl scale-in-center">
              <h3 className="text-2xl font-black mb-2">Configure Service</h3>
              <p className="text-gray-500 mb-6 font-medium">Settings for <span className="text-officeq-blue">{editingService.name}</span></p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ticket Prefix</label>
                  <input type="text" maxLength="1" defaultValue={editingService.prefix} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-center text-2xl uppercase text-officeq-blue" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Queue logic</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700">
                    <option>Standard FIFO</option>
                    <option>Priority Escalation</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-400">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-officeq-blue text-white rounded-xl font-bold shadow-lg shadow-blue-100">Apply</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSettings;