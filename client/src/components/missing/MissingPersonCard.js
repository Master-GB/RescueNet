import React, { useState } from 'react';
import { 
  Heart, MapPin, Calendar, Phone, Mail, User, Clock, 
  Eye, AlertTriangle, CheckCircle, Search,
  Camera, Shield, Star
} from 'lucide-react';
import { MISSING_PERSON_STATUS, AGE_GROUPS, GENDER_OPTIONS, PRIORITY_LEVELS } from '../../constants/missingPersonConstants';
import { useMissingPersonContext } from '../../contexts/MissingPersonContext';

const MissingPersonCard = ({ person, viewMode = 'grid', onClick }) => {
  const { toggleSavePerson, isPersonSaved } = useMissingPersonContext();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isSaved = isPersonSaved(person._id);
  const statusConfig = MISSING_PERSON_STATUS.find(s => s.value === person.status);
  const priorityConfig = PRIORITY_LEVELS.find(p => p.value === person.priority);
  const ageGroup = AGE_GROUPS.find(ag => person.age >= ag.minAge && person.age <= ag.maxAge);
  const genderConfig = GENDER_OPTIONS.find(g => g.value === person.gender);

  // Helper function to format location
  const formatLocation = (location) => {
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location !== null) {
      const parts = [];
      if (location.address) parts.push(location.address);
      if (location.city) parts.push(location.city);
      if (location.district) parts.push(location.district);
      if (location.province) parts.push(location.province);
      return parts.join(', ') || 'Unknown Location';
    }
    return 'Unknown Location';
  };

  const formattedLocation = formatLocation(person.lastSeenLocation);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'red';
      case 'Found': return 'green';
      case 'Closed': return 'gray';
      default: return 'gray';
    }
  };

  const statusColor = getStatusColor(person.status);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Handle save/unsave
  const handleSave = (e) => {
    e.stopPropagation();
    toggleSavePerson(person._id);
  };

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div
        onClick={onClick}
        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
      >
        {/* Image Section */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {person.photoUrl ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400 animate-pulse" />
                </div>
              )}
              <img
                src={person.photoUrl}
                alt={person.fullName}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Status Badge */}
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white bg-${statusColor}-500 shadow-lg`}>
            {statusConfig?.label || person.status}
          </div>

          {/* Priority Badge */}
          {priorityConfig && person.priority !== 'Medium' && (
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white bg-${priorityConfig.color}-500 shadow-lg`}>
              {priorityConfig.label}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          {/* Case Number */}
          {person.caseNumber && (
            <div className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 text-white rounded text-xs">
              {person.caseNumber}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Name and Basic Info */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              {person.fullName}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{person.age} years</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                  {genderConfig?.icon}
                </span>
                <span>{genderConfig?.label}</span>
              </span>
              {ageGroup && (
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {ageGroup.label}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {person.circumstances}
          </p>

          {/* Location and Date */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">Last Seen: {formattedLocation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Last Seen: {formatDate(person.lastSeenDate)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          </div>
      </div>
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="group bg-white hover:bg-gray-50 border-b border-gray-200 p-6 cursor-pointer transition-all"
      >
        <div className="flex items-center space-x-6">
          {/* Image */}
          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
            {person.photoUrl ? (
              <img
                src={person.photoUrl}
                alt={person.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {person.fullName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-${statusColor}-500`}>
                    {statusConfig?.label || person.status}
                  </span>
                  {priorityConfig && person.priority !== 'Medium' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-${priorityConfig.color}-500`}>
                      {priorityConfig.label}
                    </span>
                  )}
                  {person.caseNumber && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {person.caseNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>{person.age} years, {genderConfig?.label}</span>
                  <span>Last Seen: {formatDate(person.lastSeenDate)}</span>
                </div>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {person.circumstances}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Last Seen: {formattedLocation}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{person.reporterContact?.phone}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(e);
                  }}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>
                <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map View (placeholder)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="text-center text-gray-600">
        <MapPin className="w-8 h-8 mx-auto mb-2" />
        <p>Map view for {person.fullName}</p>
        <p className="text-sm">{formattedLocation}</p>
      </div>
    </div>
  );
};

export default MissingPersonCard;
