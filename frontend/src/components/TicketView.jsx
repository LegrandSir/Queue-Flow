import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const TicketView = ({ ticketData, onReset }) => {
  const navigate = useNavigate();
  
  // Construct URL for mobile access. 
  // Note: For phone scanning, 'window.location.origin' must be your IP address.
  const mobileUrl = `${window.location.origin}/ticket/${ticketData.ticket_number}`;

  return (
    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="text-officeq-blue text-5xl mb-4">🎫</div>
      <h2 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Your Ticket Number</h2>
      <div className="text-7xl font-black text-officeq-blue mb-6 tracking-tighter">
        {ticketData.ticket_number}
      </div>
      
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 flex flex-col items-center">
        <p className="text-gray-400 font-bold text-xs uppercase mb-4">Scan to track on your phone</p>
        <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
          <QRCodeCanvas 
            value={mobileUrl} 
            size={140}
            level={"H"}
          />
        </div>
        <div className="text-4xl font-black text-gray-800 mb-1">🕒 {ticketData.wait_time}</div>
        <p className="text-gray-400 text-sm font-medium">People ahead of you: {ticketData.people_ahead}</p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => navigate(`/ticket/${ticketData.ticket_number}`)}
          className="w-full py-4 bg-officeq-blue text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          Track My Spot
        </button>
        
        <button 
          onClick={onReset}
          className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
        >
          Done / Get New Ticket
        </button>
      </div>
    </div>
  );
};

export default TicketView;