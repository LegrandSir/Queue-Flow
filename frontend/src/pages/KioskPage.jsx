import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import TicketView from '../components/TicketView';
import toast from 'react-hot-toast';

const KioskPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [services, setServices] = useState([]);
  const [kioskStatus, setKioskStatus] = useState({
    currently_serving: '---',
    estimated_wait: '5-10'
  });
  const [displayWait, setDisplayWait] = useState('5-10');

  const getIconForService = (serviceName) => {
    const iconMap = {
      'General Inquiry': '💬',
      'Technical Support': '⚙️',
      'Payments': '💳',
      'Account Opening': '👤+',
      'Document Submission': '📄',
      'Lost & Found': '🔍',
      'ID Card Replacement': '🪪',
      'Complaints & Feedback': '💬',
      'Bill Payment': '🧾',
      'Document Notarization': '✍️',
      'Passport Application': '🛂',
      "Driver's License Renewal": '🚗',
      'Visa Inquiry': '🌍',
      'Product Return/Exchange': '🔄'
    };
    return iconMap[serviceName] || '📋';
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data.filter(s => s.active));
    } catch (error) {
      console.error("Failed to load services:", error);
      toast.error("Could not load services. Please refresh.");
    }
  };

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
    const selectedServiceObj = services.find(s => s.name === selectedService);

    try {
      const response = await fetch('/api/tickets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          service_type: selectedServiceObj.name,
          priority: isPriority,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to generate ticket');

      const data = await response.json();
      setTicketData(data); 
      fetchKioskStatus();
      toast.success(`Ticket ${data.ticket_number} created!`);
    } catch (error) {
      console.error("Error generating ticket:", error);
      toast.error("Failed to connect to the server.");
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
          </div>
          <button 
            onClick={() => setIsPriority(!isPriority)}
            className={`w-14 h-8 rounded-full transition-colors relative ${isPriority ? 'bg-officeq-blue' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPriority ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      )}

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