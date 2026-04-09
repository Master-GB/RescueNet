import React from 'react';
import { X, Calendar, MapPin, ExternalLink, Globe, Clock, Tag } from 'lucide-react';

const UpdateDetailModal = ({ update, isOpen, onClose }) => {
  if (!isOpen || !update) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getKindColor = (kind) => {
    return kind === 'report' 
      ? 'bg-blue-100 text-blue-700 border-blue-200' 
      : 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const getKindIcon = (kind) => {
    return kind === 'report' ? 'Report' : 'Disaster';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="absolute top-4 right-4">
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:bg-white/30"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Globe className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${getKindColor(update.kind).replace('text-', 'text-white/80 ').replace('bg-', 'bg-white/20 ')}`}>
                  {getKindIcon(update.kind)}
                </span>
                {update.date && (
                  <span className="flex items-center space-x-1 text-white/90">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDate(update.date)}</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">{update.title}</h2>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-5 h-5 text-blue-700" />
                <span className="text-lg font-bold text-blue-900">{update.kind}</span>
              </div>
              <p className="text-sm text-blue-600">Content Type</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-5 h-5 text-green-700" />
                <span className="text-lg font-bold text-green-900">{update.countries?.length || 0}</span>
              </div>
              <p className="text-sm text-green-600">Countries Affected</p>
            </div>
          </div>

          {/* Countries */}
          {update.countries && update.countries.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Affected Countries
              </h3>
              <div className="flex flex-wrap gap-2">
                {update.countries.map((country, index) => (
                  <span key={index} className="px-3 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disaster Types */}
          {update.disasterTypes && update.disasterTypes.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-orange-600" />
                Related Disaster Types
              </h3>
              <div className="flex flex-wrap gap-2">
                {update.disasterTypes.map((type, index) => (
                  <span key={index} className="px-3 py-2 rounded-xl text-sm font-semibold bg-orange-50 border border-orange-200 text-orange-700">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description placeholder */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
            <p className="text-gray-600 leading-relaxed">
              This {update.kind} provides important information about disaster response and relief efforts. 
              For detailed information, please visit the original source.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <a
              href={update.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              View Original
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDetailModal;
