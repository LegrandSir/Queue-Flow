import React, { useState } from 'react';
import ServiceCard from '../components/ServiceCard';

const KioskPage = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { id: 'inquiry', title: 'General Inquiry', desc: 'For basic questions and information.', icon: 'ⓘ' },
    { id: 'account', title: 'Account Opening', desc: 'New account setup and registration.', icon: '👤+' },
    { id: 'docs', title: 'Document Submission', desc: 'Submit required paperwork.', icon: '📄' },
    { id: 'pay', title: 'Payments', desc: 'Process all types of transactions.', icon: '💳' },
    { id: 'tech', title: 'Technical Support', desc: 'Assistance with technical issues.', icon: '⚙️' },
  ];

  const handleTakeTicket = () => {
    alert(`Generating ticket for: ${selectedService}`);
    // We will replace this with a fetch() to your Flask backend next
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="text-officeq-blue text-6xl mb-4">🎫</div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">Welcome to OfficeQ Kiosk</h1>
        <p className="text-gray-500 mt-3 text-xl font-medium">Select Your Service</p>
      </header>

      {/* Service Selection Grid */}
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

      {/* Main Action Button */}
      <button 
        onClick={handleTakeTicket}
        disabled={!selectedService}
        className={`mt-12 px-20 py-5 rounded-full text-2xl font-black transition-all duration-300
        ${selectedService 
          ? 'bg-officeq-blue text-white shadow-xl shadow-blue-200 hover:scale-105 active:scale-95' 
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
      >
        Take a Ticket
      </button>

      {/* Horizontal Divider */}
      <div className="w-full max-w-5xl h-px bg-gray-200 my-16"></div>

      {/* Queue Status Section */}
      <div className="w-full max-w-5xl">
        <h2 className="text-3xl font-black text-center text-gray-800 mb-10">Current Queue Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Currently Serving Card */}
          <div className="bg-officeq-blue rounded-officeq p-10 text-white text-center shadow-2xl">
            <p className="text-2xl font-bold opacity-90 mb-2">Currently Serving</p>
            <h3 className="text-8xl font-black mb-4">A101</h3>
            <p className="text-lg font-medium">Please proceed when called</p>
          </div>

          {/* Estimated Wait Time Card */}
          <div className="bg-white rounded-officeq p-10 border-2 border-gray-100 text-center shadow-lg">
            <p className="text-gray-500 text-2xl font-bold mb-2">Estimated Wait Time</p>
            <h3 className="text-8xl font-black text-gray-900 mb-2">5-10</h3>
            <p className="text-3xl font-black text-gray-800 mb-2">minutes</p>
            <p className="text-gray-400 text-base font-medium">for your selected service</p>
          </div>

        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-20 text-gray-400 font-medium">
        Made with OfficeQ © 2026
      </footer>
    </div>
  );
};

export default KioskPage;