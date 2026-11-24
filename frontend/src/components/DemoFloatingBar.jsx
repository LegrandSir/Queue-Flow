import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Ticket, Monitor, Shield, Headphones, ChevronUp, ChevronDown } from 'lucide-react';

const PUBLIC_PATHS = ['/', '/login', '/display'];

const DemoFloatingBar = ({ onQuickSwitch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const isPublic =
    PUBLIC_PATHS.includes(location.pathname) || location.pathname.startsWith('/ticket/');
  if (!isPublic) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="bg-[#0B1120]/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-2 flex flex-wrap items-center gap-1.5 max-w-[92vw]"
          >
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Jump
            </span>
            <button
              onClick={() => navigate('/')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                location.pathname === '/' ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" /> Kiosk
            </button>
            <button
              onClick={() => navigate('/display')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                location.pathname === '/display' ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> TV Board
            </button>
            <button
              onClick={() => onQuickSwitch('Staff')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" /> Staff Demo
            </button>
            <button
              onClick={() => onQuickSwitch('Admin')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-200 hover:bg-blue-600 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="px-3.5 py-2 rounded-full bg-[#0B1120] text-slate-200 border border-slate-700 shadow-lg text-xs font-semibold flex items-center gap-1.5 hover:border-blue-500 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        Demo Tour
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default DemoFloatingBar;