import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Ticket,
  Clock,
  Users,
  Bell,
  BellRing,
  Send,
  Bot,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Monitor,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const QUICK_PROMPTS = [
  'How long is my wait?',
  'What is my position?',
  'How does priority work?',
];

const MobileTicketView = () => {
  const { ticketNumber } = useParams();
  const navigate = useNavigate();
  const [ticketStatus, setTicketStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const [chatMsg, setChatMsg] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      role: 'ai',
      text: `Hi! I'm tracking ticket ${ticketNumber} in real time. Tap a quick question below or ask me anything about your wait.`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const prevStatusRef = useRef(null);
  const chatEndRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const response = await apiFetch(`/api/tickets/status/${ticketNumber}`);
      if (response.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await response.json();

      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        if (data.status === 'serving') {
          toast.success(`It's your turn! Proceed to ${data.counter || 'Counter 1'}.`);
          if (notificationsEnabled && 'Notification' in window) {
            new Notification("QueueFlow: It's Your Turn!", {
              body: `Ticket ${ticketNumber} is now being served at ${data.counter || 'the counter'}.`,
            });
          }
        } else if (data.status === 'missed') {
          toast.error(`Ticket ${ticketNumber} was marked missed.`);
        } else if (data.status === 'completed') {
          toast.success(`Ticket ${ticketNumber} completed. Thank you!`);
        }
      }

      prevStatusRef.current = data.status;
      setTicketStatus(data);
      setNotFound(false);
    } catch (error) {
      console.error('Error fetching ticket status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [ticketNumber, notificationsEnabled]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  const sendChatMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setChatLog((prev) => [...prev, { role: 'user', text: trimmed }]);
    setChatMsg('');
    setIsTyping(true);

    try {
      const res = await apiFetch('/api/user/ai-chat', {
        method: 'POST',
        body: JSON.stringify({ ticket_number: ticketNumber, message: trimmed }),
      });
      const data = await res.json();
      setChatLog((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        { role: 'ai', text: 'Connection hiccup — your live queue stats above will keep refreshing.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendChatMessage(chatMsg);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported on this device.');
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success('Turn alerts are active.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      toast.success('Turn alerts enabled!');
    } else {
      toast.info('Notifications declined. Keep this tab open for live updates.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Syncing ticket {ticketNumber}...</p>
      </div>
    );
  }

  if (notFound || !ticketStatus) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Ticket Not Found</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          We couldn&apos;t find ticket <span className="font-bold text-slate-800">{ticketNumber}</span>. It may have expired or been cleared.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
        >
          Back to Kiosk
        </button>
      </div>
    );
  }

  const isServing = ticketStatus.status === 'serving';
  const isCompleted = ticketStatus.status === 'completed';
  const isMissed = ticketStatus.status === 'missed';
  const isPriority = ticketStatus.priority_level > 0;

  const progressPercent = isServing || isCompleted
    ? 100
    : Math.max(15, Math.min(92, 100 - ticketStatus.people_ahead * 18));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center px-4 py-6 pb-28">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-5">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kiosk
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600">Live Tracker</span>
        </div>
        <button
          onClick={() => navigate('/display')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          <Monitor className="w-3.5 h-3.5" /> TV
        </button>
      </div>

      {/* Hero Ticket Card */}
      <motion.div
        layout
        className={`w-full max-w-md rounded-3xl overflow-hidden shadow-xl border mb-5 ${
          isServing
            ? 'bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-400/40 text-white shadow-emerald-600/20'
            : isCompleted
              ? 'bg-[#0B1120] border-slate-800 text-white'
              : isMissed
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-[#0B1120] border-slate-800 text-white shadow-slate-900/15'
        }`}
      >
        <div className="p-7 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold">
              <Ticket className="w-3.5 h-3.5" />
              {ticketStatus.service}
            </span>
            {isPriority && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3 h-3" /> Priority
              </span>
            )}
          </div>

          <h1 className="text-7xl font-extrabold tracking-tight tabular-nums my-2">
            {ticketStatus.ticket_number}
          </h1>

          <div className="mt-3">
            {isServing && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Proceed to {ticketStatus.counter || 'Counter 1'}
              </span>
            )}
            {ticketStatus.status === 'waiting' && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-200 text-xs font-bold uppercase tracking-wider">
                {ticketStatus.people_ahead === 0 ? "You're Next!" : 'Waiting in Queue'}
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Service Completed
              </span>
            )}
            {isMissed && (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> Ticket Missed
              </span>
            )}
          </div>

          {/* Animated Progress Track */}
          {!isMissed && (
            <div className="mt-6 text-left">
              <div className="flex justify-between text-[11px] font-semibold text-white/70 mb-1.5">
                <span>Checked In</span>
                <span>{isServing ? 'At Counter' : isCompleted ? 'Done' : 'Approaching Counter'}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${isServing || isCompleted ? 'bg-white' : 'bg-sky-400'}`}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Live Metrics Grid */}
      <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
          <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {isServing || isCompleted ? 0 : ticketStatus.estimated_minutes}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">Est. Min</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
          <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {isServing || isCompleted ? 0 : ticketStatus.people_ahead}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">Ahead</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center">
          <Ticket className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {ticketStatus.currently_serving || '---'}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">Serving</p>
        </div>
      </div>

      {/* Turn Alert Bar */}
      <div
        className={`w-full max-w-md rounded-2xl p-4 border mb-5 flex items-center justify-between gap-3 ${
          notificationsEnabled
            ? 'bg-emerald-50 border-emerald-200/80'
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              notificationsEnabled ? 'bg-emerald-600 text-white' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {notificationsEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              {notificationsEnabled ? 'Turn Alerts Active' : 'Notify When Called'}
            </p>
            <p className="text-[11px] text-slate-500">
              {notificationsEnabled
                ? 'We will alert you as soon as your counter is ready.'
                : 'Get a browser ping when your number is called.'}
            </p>
          </div>
        </div>
        {!notificationsEnabled && (
          <button
            onClick={handleEnableNotifications}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors"
          >
            Enable
          </button>
        )}
      </div>

      {/* Smart Queue Assistant */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
        <div className="bg-[#0B1120] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-sky-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">QueueFlow Assistant</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Live queue-aware helper</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
            Online
          </span>
        </div>

        <div className="h-52 overflow-y-auto p-4 space-y-2.5 bg-slate-50/70">
          <AnimatePresence initial={false}>
            {chatLog.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  log.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto rounded-br-sm'
                    : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-sm shadow-2xs'
                }`}
              >
                {log.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="text-[11px] text-slate-400 font-medium animate-pulse px-1">
              Checking live queue...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 1-Tap Quick Prompts */}
        <div className="px-3 pt-2.5 pb-1.5 flex flex-wrap gap-1.5 bg-white border-t border-slate-100">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendChatMessage(prompt)}
              className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-full transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-3 bg-white flex gap-2">
          <input
            value={chatMsg}
            onChange={(e) => setChatMsg(e.target.value)}
            placeholder="Ask about your wait time..."
            className="flex-1 px-3.5 py-2.5 bg-slate-100 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white border border-transparent focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!chatMsg.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MobileTicketView;