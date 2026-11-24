import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock, Sparkles, Volume2, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../lib/api';

const DisplayBoard = () => {
  const [board, setBoard] = useState({
    office_name: 'QueueFlow Nairobi HQ',
    serving: [],
    up_next: [],
    total_waiting: 0,
  });
  const [clock, setClock] = useState(new Date());

  const fetchBoard = async () => {
    try {
      const res = await apiFetch('/api/display/board');
      if (res.ok) setBoard(await res.json());
    } catch (err) {
      console.error('Display board poll error:', err);
    }
  };

  useEffect(() => {
    fetchBoard();
    const poll = setInterval(fetchBoard, 4000);
    const tick = setInterval(() => setClock(new Date()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060B16] text-white flex flex-col p-6 lg:p-10 pb-24">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{board.office_name}</h1>
            <p className="text-xs text-sky-400 font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Lobby Display
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-2xl font-extrabold tabular-nums">
              {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs text-slate-400">
              {clock.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <Link
            to="/"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kiosk
          </Link>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-8">
        {/* Now Serving Column */}
        <section className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-sky-400" /> Now Serving
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Please proceed immediately when your ticket appears
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 content-start">
            <AnimatePresence mode="popLayout">
              {board.serving.length > 0 ? (
                board.serving.map((ticket, idx) => (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className={`rounded-3xl p-7 border flex flex-col justify-between min-h-[210px] ${
                      idx === 0
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-400/40 shadow-2xl shadow-blue-600/25'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
                        {ticket.counter || 'Counter 1'}
                      </span>
                      {ticket.priority_level > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
                          <Sparkles className="w-3 h-3" /> Priority
                        </span>
                      )}
                    </div>

                    <div className="my-4">
                      <p className="text-7xl font-extrabold tracking-tight tabular-nums">
                        {ticket.ticket_number}
                      </p>
                    </div>

                    <p className={`text-sm font-semibold ${idx === 0 ? 'text-blue-100' : 'text-slate-400'}`}>
                      {ticket.service_type}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="sm:col-span-2 rounded-3xl bg-slate-900/60 border border-slate-800 p-16 text-center text-slate-500">
                  No counters currently serving. Take a ticket at the kiosk to begin.
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Up Next Column */}
        <section className="lg:col-span-4 bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Up Next
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300 tabular-nums">
              {board.total_waiting} waiting
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {board.up_next.length > 0 ? (
              board.up_next.map((t, index) => (
                <motion.div
                  key={t.id}
                  layout
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-bold text-slate-500 w-5 tabular-nums">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-xl font-extrabold tracking-tight tabular-nums text-white">
                        {t.ticket_number}
                      </p>
                      <p className="text-xs text-slate-400">{t.service_type}</p>
                    </div>
                  </div>
                  {t.priority_level > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold">
                      PRIORITY
                    </span>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">Queue is clear</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DisplayBoard;