import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';  // <-- added

const AdminSettings = ({ user }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    max_wait_time: '15',
    avg_service_duration: '5-10',
    office_name: 'OfficeQ Main Branch',
    priority_escalation: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({
            ...prev,
            max_wait_time: data.max_wait_time || prev.max_wait_time,
            avg_service_duration: data.avg_service_duration || prev.avg_service_duration,
            office_name: data.office_name || prev.office_name,
            priority_escalation: data.priority_escalation === 'true' || data.priority_escalation === true
          }));
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
        toast.error("Failed to load settings"); // <-- added
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaving(true);
    try {
      await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      toast.success("Setting saved"); // <-- added success notification
    } catch (err) {
      console.error("Failed to save setting", err);
      toast.error("Failed to save setting"); // <-- replaced alert
    } finally {
      setSaving(false);
    }
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
        toast.success("Data exported successfully"); // <-- added success
      } else {
        toast.error("Export failed"); // <-- replaced alert
      }
    } catch (err) {
      toast.error("Failed to export data"); // <-- replaced alert
    }
  };

  const handleClearCache = async () => {
    if (window.confirm("Warning: This will delete ALL active tickets. Continue?")) {
      const response = await fetch('/api/system/clear-cache', { method: 'POST' });
      if (response.ok) {
        toast.success("Queue cache cleared!"); // <-- replaced alert
      } else {
        toast.error("Clear cache failed"); // <-- replaced alert
      }
    }
  };

  const handleReboot = async () => {
    if (window.confirm("Reboot will reset SLA targets and reload the system. Continue?")) {
      const response = await fetch('/api/system/reboot', { method: 'POST' });
      if (response.ok) {
        toast.success("System rebooted. Page will reload."); // <-- replaced alert
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Reboot failed"); // <-- replaced alert
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast.success("Logged out"); // <-- added optional
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
                <button onClick={() => navigate('/admin/reports')} className="w-full text-left p-3 rounded-lg text-gray-500 hover:bg-gray-50 font-bold transition-colors flex items-center gap-2">
                  <span>📊</span> Reports
                </button>
                <button onClick={() => navigate('/admin-settings')} className="w-full text-left p-3 rounded-lg bg-blue-50 text-officeq-blue font-bold flex items-center gap-2">
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-gray-500 mb-8 tracking-tight">Configure system parameters, branch details, and operational tools.</p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-officeq-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {/* System Settings Column */}
            <div className="col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold mb-6">System Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Wait Time (minutes)</label>
                    <input
                      type="number"
                      value={settings.max_wait_time}
                      onChange={(e) => handleUpdate('max_wait_time', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-officeq-blue focus:border-officeq-blue"
                      min="1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Customers will be alerted when wait exceeds this limit.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Average Service Duration (minutes)</label>
                    <input
                      type="text"
                      value={settings.avg_service_duration}
                      onChange={(e) => handleUpdate('avg_service_duration', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                      placeholder="e.g., 5-10"
                    />
                    <p className="text-xs text-gray-400 mt-1">Used for wait time estimation.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Office/Branch Name</label>
                    <input
                      type="text"
                      value={settings.office_name}
                      onChange={(e) => handleUpdate('office_name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority Escalation</label>
                      <p className="text-xs text-gray-400">Allow priority tickets (PWD, elderly) to jump the queue.</p>
                    </div>
                    <button
                      onClick={() => handleUpdate('priority_escalation', !settings.priority_escalation)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.priority_escalation ? 'bg-officeq-blue' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.priority_escalation ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                {saving && <p className="text-sm text-green-600 mt-4">Saving...</p>}
              </section>
            </div>

            {/* System Tools Column */}
            <div className="space-y-8">
              <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Reports & Tools</h2>
                <div className="space-y-4">
                  <button onClick={handleExportData} className="w-full py-3 bg-officeq-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                    Export Ticket Data (CSV)
                  </button>
                  <button onClick={handleClearCache} className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors">
                    Clear System Cache
                  </button>
                  <button onClick={handleReboot} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-600">
                    Reboot Services
                  </button>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold mb-4">System Status</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">System Uptime</span>
                    <span className="font-bold text-green-500">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">API Version</span>
                    <span className="font-bold text-gray-700">v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Queue Mode</span>
                    <span className="font-bold text-gray-700">{settings.priority_escalation ? 'Priority Enabled' : 'Standard FIFO'}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSettings;