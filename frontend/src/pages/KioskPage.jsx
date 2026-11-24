import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Ticket,
  Monitor,
  LogIn,
  HelpCircle,
  Headphones,
  CreditCard,
  UserPlus,
  FileText,
  Layers,
  Sparkles,
  Clock,
  Users,
  ArrowRight,
  Building2,
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import TicketView from '../components/TicketView';
<<<<<<< HEAD
import toast from 'react-hot-toast';

=======
import { apiFetch } from '../lib/api';

const SERVICE_ICONS = {
  'General Inquiry': HelpCircle,
  'Technical Support': Headphones,
  Payments: CreditCard,
  'Account Opening': UserPlus,
  'Document Submission': FileText,
};

>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
const KioskPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [services, setServices] = useState([]);
  const [kioskStatus, setKioskStatus] = useState({
    currently_serving: '---',
    serving_counter: null,
    waiting_count: 0,
    estimated_wait: '0',
    office_name: 'QueueFlow Nairobi HQ',
    priority_enabled: true,
  });
  const [displayWait, setDisplayWait] = useState('5-10');

  const fetchServices = async () => {
    try {
      const res = await apiFetch('/api/services');
      const data = await res.json();
      setServices(data.filter((s) => s.active));
    } catch (error) {
<<<<<<< HEAD
      console.error("Failed to load services:", error);
      toast.error("Could not load services. Please refresh.");
=======
      console.error('Failed to load services:', error);
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    }
  };

  const fetchKioskStatus = async () => {
    try {
      const res = await apiFetch('/api/kiosk/status');
      if (res.ok) setKioskStatus(await res.json());
    } catch (error) {
      console.error('Error fetching kiosk status:', error);
    }
  };

  // NEW: Fetch priority‑adjusted wait time
  const fetchPriorityEstimate = async () => {
    if (!selectedService) return;
    try {
      const response = await fetch(`/api/kiosk/estimate?service=${encodeURIComponent(selectedService)}&priority=${isPriority}`);
      const data = await response.json();
      if (response.ok) {
        setDisplayWait(data.estimated_wait);
      } else {
        setDisplayWait(kioskStatus.estimated_wait || '5-10');
      }
    } catch (error) {
      console.error("Error fetching estimate:", error);
      setDisplayWait(kioskStatus.estimated_wait || '5-10');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchKioskStatus();
    const interval = setInterval(fetchKioskStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Re‑fetch estimate when service or priority changes
  useEffect(() => {
    fetchPriorityEstimate();
  }, [selectedService, isPriority]);

  const handleTakeTicket = async () => {
    if (!selectedService) return;
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/tickets/generate', {
        method: 'POST',
        body: JSON.stringify({
          service_type: selectedService,
          priority: isPriority,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate ticket');
      const data = await res.json();
      setTicketData(data);
      toast.success(`Ticket ${data.ticket_number} issued!`);
      fetchKioskStatus();
<<<<<<< HEAD
      toast.success(`Ticket ${data.ticket_number} created!`);
    } catch (error) {
      console.error("Error generating ticket:", error);
      toast.error("Failed to connect to the server.");
=======
    } catch {
      toast.error('Could not reach queue server.');
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTicketData(null);
    setSelectedService(null);
    setIsPriority(false);
  };

  if (ticketData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 pb-24">
        <TicketView ticketData={ticketData} onReset={handleReset} />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      {/* Blue welcome header with ticket icon */}
      <div className="w-full bg-gradient-to-r from-officeq-blue to-blue-600 text-white py-12 px-4 rounded-b-3xl mb-12 shadow-lg">
        <div className="max-w-5xl mx-auto text-center relative">
          <img src="/logo.png" alt="OfficeQ Logo" className="h-24 w-auto mx-auto " />
          <h1 className="text-5xl font-black tracking-tight">Welcome to OfficeQ</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-4xl">🎫</span>
            <p className="text-2xl font-semibold text-blue-100">Get a Ticket</p>
          </div>
          <p className="text-lg text-blue-100 mt-2">Select a service below to join the queue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {services.map((s) => (
          <ServiceCard 
            key={s.id}
            title={s.name}
            description={`Estimated ${s.duration} min`}
            icon={getIconForService(s.name)}
            active={selectedService === s.name}
            onSelect={() => {
              setSelectedService(s.name);
              setIsPriority(false);
            }}
          />
        ))}
      </div>

      {selectedService && (
        <div className="mt-10 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 w-full max-w-lg flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-800 text-lg">Priority Attention</h4>
            <p className="text-sm text-blue-600">For PWD, elderly, or expectant mothers</p>
=======
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-600/20">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-none">
                QueueFlow
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" /> {kioskStatus.office_name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/display"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Monitor className="w-3.5 h-3.5" /> TV Display
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0B1120] hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" /> Staff Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-10 pb-28">
        {/* Live Status Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="md:col-span-2 bg-[#0B1120] text-white rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-slate-900/10 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Currently Serving
              </span>
              <p className="text-slate-400 text-xs mt-1">
                {kioskStatus.serving_service
                  ? `${kioskStatus.serving_service} · ${kioskStatus.serving_counter || 'Counter 1'}`
                  : 'Counters ready for next guest'}
              </p>
            </div>
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight tabular-nums text-white">
              {kioskStatus.currently_serving}
            </div>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
          </div>

<<<<<<< HEAD
      <button 
        onClick={handleTakeTicket}
        disabled={!selectedService || isLoading}
        className={`mt-10 px-20 py-5 rounded-full text-2xl font-black transition-all duration-300
        ${selectedService 
          ? 'bg-officeq-blue text-white shadow-xl shadow-blue-200 hover:scale-105 active:scale-95' 
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
      >
        {isLoading ? 'Processing...' : 'Take a Ticket'}
      </button>

      <div className="w-full max-w-5xl h-px bg-gray-200 my-16"></div>

      <div className="w-full max-w-5xl">
        <h2 className="text-3xl font-black text-center text-gray-800 mb-10">Current Queue Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-officeq-blue rounded-officeq p-10 text-white text-center shadow-2xl">
            <p className="text-2xl font-bold opacity-90 mb-2">Currently Serving</p>
            <h3 className="text-8xl font-black mb-4 tracking-tighter">{kioskStatus.currently_serving}</h3>
            <p className="text-lg font-medium">Please proceed when called</p>
          </div>
          <div className="bg-white rounded-officeq p-10 border-2 border-gray-100 text-center shadow-lg">
            <p className="text-gray-500 text-2xl font-bold mb-2">Estimated Wait Time</p>
            <h3 className="text-8xl font-black text-gray-900 mb-2 tracking-tighter">{displayWait}</h3>
            <p className="text-3xl font-black text-gray-800 mb-2">minutes</p>
            <p className="text-gray-400 text-base font-medium">for your selected service</p>
            {isPriority && (
              <p className="text-sm text-green-600 mt-2 font-bold">Priority reduces wait time!</p>
            )}
=======
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Est. Wait
              </span>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {kioskStatus.waiting_count} waiting
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-extrabold text-slate-900 tabular-nums">
                {kioskStatus.estimated_wait}
              </span>
              <span className="text-xs font-bold text-slate-400 block -mt-1">min</span>
            </div>
>>>>>>> b360b0e (feat: full UI/UX revamp, live TV display, demo sandbox, and production deployment config)
          </div>
        </div>

        {/* Hero Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Check in for service
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Select a department below to generate your digital ticket and track your spot from your phone.
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc, idx) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <ServiceCard
                title={svc.name}
                duration={svc.duration}
                icon={SERVICE_ICONS[svc.name] || Layers}
                active={selectedService === svc.name}
                onSelect={() => setSelectedService(svc.name)}
              />
            </motion.div>
          ))}
        </div>

        {/* Priority & Issue Action */}
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-8 max-w-xl mx-auto space-y-4"
            >
              {kioskStatus.priority_enabled && (
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Priority Assistance</h4>
                      <p className="text-xs text-slate-500">
                        For persons with disabilities, senior citizens, or expectant mothers
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPriority(!isPriority)}
                    className={`w-12 h-7 rounded-full transition-colors relative shrink-0 ${
                      isPriority ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        isPriority ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              <button
                onClick={handleTakeTicket}
                disabled={isLoading}
                className="w-full py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? 'Generating Ticket...' : `Take Ticket for ${selectedService}`}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default KioskPage;