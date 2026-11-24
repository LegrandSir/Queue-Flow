import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { Ticket, Clock, Users, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

const TicketView = ({ ticketData, onReset }) => {
  const navigate = useNavigate();
  const mobileUrl = `${window.location.origin}/ticket/${ticketData.ticket_number}`;
  const isPriority = ticketData.priority_level > 0 || ticketData.ticket_number?.startsWith('P');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden"
    >
      {/* Top Banner */}
      <div className="bg-[#0B1120] text-white px-8 pt-8 pb-7 text-center relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold mb-4">
          <Ticket className="w-3.5 h-3.5" />
          {ticketData.service_type}
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
          Your Queue Ticket
        </p>
        <div className="text-7xl font-extrabold tracking-tight tabular-nums mt-1 bg-gradient-to-b from-white to-sky-200 bg-clip-text text-transparent">
          {ticketData.ticket_number}
        </div>
        {isPriority && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Priority Fast-Track
          </div>
        )}
      </div>

      {/* Perforated divider */}
      <div className="relative h-6 bg-white flex items-center">
        <div className="w-6 h-6 rounded-full bg-slate-100 -ml-3 border-r border-slate-200" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
        <div className="w-6 h-6 rounded-full bg-slate-100 -mr-3 border-l border-slate-200" />
      </div>

      {/* Body */}
      <div className="px-8 pb-8 pt-2 text-center">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Est. Wait
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {ticketData.wait_time}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
              <Users className="w-3.5 h-3.5 text-blue-600" /> Ahead
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {ticketData.people_ahead}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Scan to track live on your phone
          </p>
          <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100">
            <QRCodeCanvas value={mobileUrl} size={132} level="H" />
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => navigate(`/ticket/${ticketData.ticket_number}`)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
          >
            Open Live Mobile Tracker <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="w-full py-3 text-slate-500 hover:text-slate-800 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Issue Another Ticket
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketView;