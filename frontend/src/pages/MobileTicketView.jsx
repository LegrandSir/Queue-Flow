import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MobileTicketView = () => {
  const { ticketNumber } = useParams();
  const navigate = useNavigate();
  const [ticketStatus, setTicketStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // AI Chat States
  const [chatMsg, setChatMsg] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/tickets/status/${ticketNumber}`);
      const data = await response.json();
      
      // Check for status change (from previous state)
      if (ticketStatus && ticketStatus.status !== data.status && notificationsEnabled) {
        if (data.status === 'serving') {
          new Notification("OfficeQ: It's Your Turn!", {
            body: `Please proceed to the counter. Your ticket ${ticketNumber} is being served.`,
            icon: "🎫"
          });
        } else if (data.status === 'missed') {
          new Notification("OfficeQ: Ticket Missed", {
            body: `Your ticket ${ticketNumber} was missed. Please take a new ticket if you still need service.`,
            icon: "⚠️"
          });
        }
      }
      
      setTicketStatus(data);
    } catch (error) {
      console.error("Error fetching ticket status:", error);
      toast.error("Failed to fetch ticket status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketNumber, notificationsEnabled]); // remove ticketStatus from deps

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const userEntry = { role: 'user', text: chatMsg };
    setChatLog([...chatLog, userEntry]);
    setChatMsg('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/user/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_number: ticketNumber, message: chatMsg })
      });
      const data = await res.json();
      setChatLog(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'ai', text: "Sorry, I'm offline right now." }]);
      toast.error("AI service unavailable");
    } finally {
      setIsTyping(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications.");
    } else if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      toast.success("Notifications are active!");
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notification permission denied");
      }
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-officeq-blue text-xl">Connecting to Queue...</div>;
  if (!ticketStatus) return <div className="p-10 text-center text-red-500 font-bold">Ticket not found.</div>;

  const isServing = ticketStatus.status === 'serving';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 font-sans text-gray-900">
      <div className="flex items-center gap-2 mb-8 mt-4">
        <span className="bg-officeq-blue text-white p-2 rounded-lg text-xl shadow-lg">🎫</span>
        <div className="text-officeq-blue font-bold text-xl">Live Tracker</div>
      </div>

      {/* Main Ticket Card */}
      <div className={`w-full max-w-md border-2 rounded-3xl shadow-xl p-8 text-center mb-6 transition-all duration-500 ${isServing ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
        <p className="text-gray-500 font-bold text-lg mb-2">Ticket Number</p>
        <h1 className={`text-7xl font-black mb-4 tracking-tighter ${isServing ? 'text-green-600' : 'text-officeq-blue'}`}>{ticketNumber}</h1>
        <div className={`inline-block px-6 py-2 rounded-full text-xs font-black uppercase mb-4 ${isServing ? 'bg-green-600 text-white' : 'bg-blue-100 text-blue-700'}`}>{isServing ? 'Your Turn Now!' : 'Waiting in Line'}</div>
        <p className="text-gray-400 font-medium">{isServing ? 'Please proceed to the counter immediately.' : `Service: ${ticketStatus.service}`}</p>
      </div>

      {/* Stats Card */}
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-lg p-8 mb-6">
        <h2 className="text-gray-700 font-bold text-xl mb-6 tracking-tight">Real-Time Stats</h2>
        <div className="flex items-center gap-4 mb-8">
          <span className="text-officeq-blue text-4xl">🕒</span>
          <div>
            <span className="text-5xl font-black text-gray-900">{isServing ? '0' : ticketStatus.people_ahead * 5}</span>
            <span className="text-xl font-bold text-gray-400 ml-2">min wait</span>
          </div>
        </div>
        <div className="space-y-4 border-t border-gray-50 pt-6">
          <div className="flex justify-between items-center text-lg"><span className="text-gray-400 font-medium">Counter Serving:</span><span className="text-gray-800 font-black">{ticketStatus.currently_serving || '---'}</span></div>
          <div className="flex justify-between items-center text-lg"><span className="text-gray-400 font-medium">Position:</span><span className="text-gray-800 font-black">{isServing ? '0' : ticketStatus.people_ahead} ahead</span></div>
        </div>
      </div>

      {/* AI Chat Section */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col mb-6 overflow-hidden">
        <div className="bg-gray-900 p-4 text-white font-bold flex items-center gap-2"><span>🤖</span> J.A.R.V.I.S</div>
        <div className="h-48 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {chatLog.map((log, i) => (
            <div key={i} className={`p-3 rounded-2xl text-sm ${log.role === 'user' ? 'bg-officeq-blue text-white ml-auto max-w-[80%]' : 'bg-white border border-gray-200 text-gray-800 max-w-[80%]'}`}>{log.text}</div>
          ))}
          {isTyping && <div className="text-xs text-gray-400 animate-pulse">Thinking...</div>}
        </div>
        <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
          <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} placeholder="Ask about your wait..." className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-officeq-blue" />
          <button type="submit" className="bg-officeq-blue text-white px-4 py-2 rounded-xl font-bold">➔</button>
        </form>
      </div>

      {/* Notification Toggle */}
      <div className={`w-full max-w-md rounded-3xl p-6 border text-center ${notificationsEnabled ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
        <h3 className={`font-bold text-lg mb-2 ${notificationsEnabled ? 'text-green-700' : 'text-officeq-blue'}`}>{notificationsEnabled ? '🔔 Alerts Active' : '🔔 Turn on Notifications'}</h3>
        {!notificationsEnabled && <button onClick={handleEnableNotifications} className="bg-officeq-blue text-white px-6 py-2 rounded-xl font-bold text-sm">Notify Me</button>}
      </div>
      
      <button onClick={() => navigate('/')} className="mt-8 text-gray-400 font-bold hover:text-officeq-blue transition-colors underline">Back to Kiosk</button>
    </div>
  );
};

export default MobileTicketView;