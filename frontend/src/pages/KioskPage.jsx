import React, { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import TicketView from '../components/TicketView';

const KioskPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  
  // NEW: State for the dynamic cards
  const [kioskStatus, setKioskStatus] = useState({
    currently_serving: '---',
    estimated_wait: '5-10'
  });

  const services = [
    { id: 'inquiry', title: 'General Inquiry', desc: 'For basic questions and information.', icon: 'ⓘ' },
    { id: 'account', title: 'Account Opening', desc: 'New account setup and registration.', icon: '👤+' },
    { id: 'docs', title: 'Document Submission', desc: 'Submit required paperwork.', icon: '📄' },
    { id: 'pay', title: 'Payments', desc: 'Process all types of transactions.', icon: '💳' },
    { id: 'tech', title: 'Technical Support', desc: 'Assistance with technical issues.', icon: '⚙️' },
  ];

  // Fetch live status from backend
  const fetchKioskStatus = async () => {
    try {
      const response = await fetch('/api/kiosk/status');
      if (response.ok) {
        const data = await response.json();
        setKioskStatus(data);
      }
    } catch (error) {
      console.error("Error fetching kiosk status:", error);
    }
  };

  // Poll status every 5 seconds
  useEffect(() => {
    fetchKioskStatus();
    const interval = setInterval(fetchKioskStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTakeTicket = async () => {
    if (!selectedService) return;
    setIsLoading(true);
    const serviceObj = services.find(s => s.id === selectedService);

    try {
      const response = await fetch('/api/tickets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          service_type: serviceObj.title,
          priority: isPriority,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to generate ticket');

      const data = await response.json();
      setTicketData(data); 
      fetchKioskStatus(); // Update cards immediately after taking a ticket
    } catch (error) {
      console.error("Error generating ticket:", error);
      alert("Failed to connect to the server.");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TicketView ticketData={ticketData} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <header className="mb-12 text-center">
        <div className="text-officeq-blue text-6xl mb-4">🎫</div>
        <h1 className="text-5xl font-black text-officeq-blue tracking-tight">Welcome to OfficeQ Kiosk</h1>
        <p className="text-gray-500 mt-3 text-xl font-medium">Select Your Service</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {services.map((s) => (
          <ServiceCard 
            key={s.id}
            title={s.title}
            description={s.desc}
            icon={s.icon}
            active={selectedService === s.id}
            onSelect={() => setSelectedService(s.id)}
          />
        ))}
      </div>

      <div className="mt-10 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 w-full max-w-lg flex items-center justify-between">
        <div>
          <h4 className="font-bold text-gray-800 text-lg">Priority Attention</h4>
          <p className="text-sm text-blue-600">For PWD, elderly, or expectant mothers</p>
        </div>
        <button 
          onClick={() => setIsPriority(!isPriority)}
          className={`w-14 h-8 rounded-full transition-colors relative ${isPriority ? 'bg-officeq-blue' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPriority ? 'left-7' : 'left-1'}`}></div>
        </button>
      </div>

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

      {/* DYNAMIC STATUS CARDS */}
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
            <h3 className="text-8xl font-black text-gray-900 mb-2 tracking-tighter">{kioskStatus.estimated_wait}</h3>
            <p className="text-3xl font-black text-gray-800 mb-2">minutes</p>
            <p className="text-gray-400 text-base font-medium">for your selected service</p>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-gray-400 font-medium">
        Made with OfficeQ © 2026
      </footer>
    </div>
  );
};

export default KioskPage;