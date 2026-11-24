import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';

const ServiceCard = ({ title, duration, icon: Icon, onSelect, active }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between min-h-[156px] ${
        active
          ? 'border-blue-600 bg-blue-50/60 shadow-lg shadow-blue-600/10'
          : 'border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between w-full mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            active
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        {active && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center"
          >
            <Check className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </div>

      <div>
        <h3 className="font-bold text-slate-900 text-lg leading-snug">{title}</h3>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>~{duration} min avg service</span>
        </div>
      </div>
    </motion.button>
  );
};

export default ServiceCard;