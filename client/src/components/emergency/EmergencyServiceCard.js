import React from 'react';
import { PhoneCall, Clock, MapPin, Star } from 'lucide-react';

const EmergencyServiceCard = ({ 
  service, 
  onCall,
  isLoading = false 
}) => {
  const handleCall = () => {
    if (onCall) onCall(service);
  };

  const getServiceColor = (color) => {
    const colors = {
      red: 'red',
      blue: 'blue',
      orange: 'orange',
      green: 'green'
    };
    return colors[color] || 'gray';
  };

  const serviceColor = getServiceColor(service.color);

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 border-2 border-${serviceColor}-200 hover:border-${serviceColor}-400 transition-all duration-200 cursor-pointer transform hover:scale-105`}
      onClick={handleCall}
    >
      {/* Service Icon */}
      <div className={`w-12 h-12 bg-${serviceColor}-100 rounded-lg flex items-center justify-center mb-4`}>
        <service.icon className={`w-6 h-6 text-${serviceColor}-600`} />
      </div>

      {/* Service Name */}
      <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>

      {/* Phone Number */}
      <div className="flex items-center space-x-2 mb-2">
        <PhoneCall className={`w-4 h-4 text-${serviceColor}-600`} />
        <span className={`text-2xl font-bold text-${serviceColor}-600`}>{service.phone}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{service.description}</p>

      {/* Additional Info */}
      <div className="space-y-2">
        {service.responseTime && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Response time: {service.responseTime}</span>
          </div>
        )}

        {service.location && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{service.location}</span>
          </div>
        )}

        {service.rating && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>Rating: {service.rating}/5</span>
          </div>
        )}
      </div>

      {/* Call Status */}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center">
          <div className="animate-pulse flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">Calling...</span>
          </div>
        </div>
      )}

      {/* Quick Call Button */}
      <button
        className={`w-full mt-4 px-4 py-2 bg-${serviceColor}-600 text-white rounded-lg hover:bg-${serviceColor}-700 transition-colors duration-200 font-medium`}
        onClick={(e) => {
          e.stopPropagation();
          handleCall();
        }}
      >
        Call Now
      </button>
    </div>
  );
};

export default EmergencyServiceCard;
