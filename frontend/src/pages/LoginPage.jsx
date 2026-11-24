import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
<<<<<<< HEAD
import toast from 'react-hot-toast';          // <-- added
=======
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Ticket,
  Shield,
  Headphones,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submitCredentials = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        if (onLogin) onLogin(data.user);
<<<<<<< HEAD
        toast.success('Login successful! Redirecting...');   // <-- added
        // Navigate based on role
        if (data.user.role === 'Admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Invalid credentials');
        toast.error(data.message || 'Invalid credentials');   // <-- added
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Server connection failed.");
      toast.error("Server connection failed.");               // <-- added
=======
        toast.success(`Welcome back, ${data.user.full_name || data.user.role}`);
        navigate(data.user.role === 'Admin' ? '/admin-dashboard' : '/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
        toast.error(data.message || 'Login failed');
      }
    } catch {
      setError('Unable to reach server. Make sure the backend is running.');
      toast.error('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitCredentials(email, password);
  };

  const handleDemoLogin = (role) => {
    if (role === 'Admin') {
      setEmail('admin@queueflow.io');
      setPassword('Admin123!');
      submitCredentials('admin@queueflow.io', 'Admin123!');
    } else {
      setEmail('staff@queueflow.io');
      setPassword('Staff123!');
      submitCredentials('staff@queueflow.io', 'Staff123!');
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left Brand Panel (Obsidian) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0B1120] text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">QueueFlow</span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-sky-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Real-Time Branch Orchestration
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Eliminate lobby friction with intelligent queue routing.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Self-service kiosks, mobile QR tracking, priority fast-tracking, and live SLA analytics—unified in one platform.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Priority-first scheduling for VIP, elderly & PWD guests',
              'Live Waiting Room TV display synchronized across counters',
              'Deterministic Operations Insights & downloadable CSV reports',
            ].map((point) => (
              <div key={point} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-400">
          <Link to="/" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <Ticket className="w-3.5 h-3.5" /> Open Kiosk
          </Link>
          <Link to="/display" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <Monitor className="w-3.5 h-3.5" /> Open TV Board
          </Link>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">QueueFlow</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Portal Sign In</h2>
          <p className="text-slate-500 text-sm mt-1.5">
            Access your counter console or jump straight in with a one-click demo account.
          </p>

          {/* 1-Click Recruiter Demo Cards */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Instant Portfolio Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('Admin')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-blue-200 hover:border-blue-500 hover:shadow-sm transition-all text-left group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Demo Admin</p>
                  <p className="text-[10px] text-slate-500">Full analytics</p>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('Staff')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Demo Staff</p>
                  <p className="text-[10px] text-slate-500">Counter 1 desk</p>
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-50 px-3 text-slate-400 font-medium">or sign in manually</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@queueflow.io"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <Link to="/" className="hover:text-blue-600 font-semibold transition-colors">
              ← Back to Customer Kiosk
            </Link>
            <Link to="/display" className="hover:text-blue-600 font-semibold transition-colors">
              Waiting Room TV →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;