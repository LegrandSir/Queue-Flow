import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  User,
  Layers,
  Users,
  Settings,
  LogOut,
  Monitor,
  Ticket,
  Menu,
  X,
  Sparkles,
  RotateCcw,
  Plus,
  ArrowLeftRight,
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const STAFF_NAV = [
  { label: 'Live Desk', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Queue Board', path: '/queue-management', icon: ClipboardList },
  { label: 'My Reports', path: '/staff-reports', icon: BarChart3 },
  { label: 'Profile', path: '/staff-profile', icon: User },
];

const ADMIN_NAV = [
  { label: 'Overview', path: '/admin-dashboard', icon: LayoutDashboard },
  { label: 'Services', path: '/admin/services', icon: Layers },
  { label: 'Staff Directory', path: '/admin/staff', icon: Users },
  { label: 'Analytics', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin-settings', icon: Settings },
];

const AppShell = ({ user, onLogout, onQuickSwitch, title, subtitle, actions, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const isAdmin = user?.role === 'Admin';
  const navItems = isAdmin ? ADMIN_NAV : STAFF_NAV;

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('user');
    }
    toast.success('Signed out');
    navigate('/login');
  };

  const handleSimulateTraffic = async () => {
    setSimulating(true);
    try {
      const res = await apiFetch('/api/demo/simulate', {
        method: 'POST',
        body: JSON.stringify({ count: 2 }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Simulated walk-ins: ${data.tickets.join(', ')}`);
      } else {
        toast.error(data.error || 'Simulation failed');
      }
    } catch {
      toast.error('Server unavailable');
    } finally {
      setSimulating(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await apiFetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        toast.success('Demo dataset reset cleanly');
        window.location.reload();
      }
    } catch {
      toast.error('Reset failed');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B1120] text-slate-300 select-none">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <button
          onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight block leading-none">
              QueueFlow
            </span>
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              {isAdmin ? 'Admin Console' : 'Staff Desk'}
            </span>
          </div>
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-blue-600/90 shadow-md shadow-blue-600/20"
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-5">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Public Displays
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Customer Kiosk
          </button>
          <button
            onClick={() => navigate('/display')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Monitor className="w-4 h-4" />
            Waiting Room TV
          </button>
        </div>

        {/* Live Demo Sandbox Controls */}
        <div className="pt-5">
          <div className="mx-1 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Demo
            </div>
            <button
              onClick={handleSimulateTraffic}
              disabled={simulating}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              {simulating ? 'Adding...' : 'Simulate +2 Walk-ins'}
            </button>
            {onQuickSwitch && (
              <button
                onClick={() => onQuickSwitch(isAdmin ? 'Staff' : 'Admin')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                Switch to {isAdmin ? 'Staff Desk' : 'Admin View'}
              </button>
            )}
            <button
              onClick={handleResetDemo}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Data
            </button>
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-white">
            {(user?.full_name || user?.email || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.counter ? `${user.role} · ${user.counter}` : user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-5 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>
                {subtitle && <p className="text-xs lg:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2.5">{actions}</div>}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-5 lg:px-8 py-7">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;