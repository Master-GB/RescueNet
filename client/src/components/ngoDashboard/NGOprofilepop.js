import React from 'react';
import { User, CheckCircle, Clock, Power } from 'lucide-react';

const NGOprofilepop = ({ isOpen, onClose, ngoData, onToggleStatus }) => {
  if (!isOpen || !ngoData) return null;

  return (
    <div className="absolute right-0 top-12 mt-2 w-64 bg-white rounded-xl shadow-ambient border border-gray-100 z-50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/20 p-2 rounded-full text-primary">
            <User size={20} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">NGO Profile</p>
            <p className="text-xs text-gray-500">ID: {ngoData.registrationNumber}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Approval Status</span>
          {ngoData.approvalStatus === 'approved' ? (
            <span className="flex items-center text-tertiary font-medium">
              <CheckCircle size={14} className="mr-1" /> Approved
            </span>
          ) : (
            <span className="flex items-center text-yellow-500 font-medium">
              <Clock size={14} className="mr-1" /> Pending
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
          <span className="text-gray-600">Availability</span>
          <button 
            onClick={onToggleStatus}
            className={`flex items-center px-3 py-1.5 rounded-md transition-colors text-xs font-bold ${
              ngoData.availabilityStatus === 'AVAILABLE' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            <Power size={14} className="mr-1" />
            {ngoData.availabilityStatus === 'AVAILABLE' ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 text-center">
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NGOprofilepop;
