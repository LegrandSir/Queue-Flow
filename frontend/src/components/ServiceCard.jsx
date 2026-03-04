// frontend/src/components/ServiceCard.jsx

const ServiceCard = ({ title, description, icon, onSelect, active }) => {
  return (
    <div 
      onClick={onSelect}
      className={`p-6 rounded-officeq border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center
      ${active 
        ? 'border-officeq-blue bg-blue-50 shadow-inner' 
        : 'border-gray-100 bg-white hover:border-officeq-blue/50 hover:shadow-lg'
      }`}
    >
      {/* Icon Container */}
      <div className="text-officeq-blue text-4xl mb-4">
        {icon}
      </div>
      
      {/* Text Content */}
      <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-tight">{description}</p>
    </div>
  );
};

export default ServiceCard; // Export statement