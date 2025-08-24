import React from 'react';
import { Plus, UserPlus } from 'lucide-react';

const FloatingButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 group"
      style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
      }}
    >
      <div className="relative">
        <Plus 
          size={24} 
          className="transition-transform duration-200 group-hover:rotate-180" 
        />
        <UserPlus 
          size={16} 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
        />
      </div>
    </button>
  );
};

export default FloatingButton;