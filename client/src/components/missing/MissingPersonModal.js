import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Phone, MapPin, Calendar, User, 
  Camera, AlertTriangle, CheckCircle, Clock, Shield, Star,
  Download, Eye, MessageCircle, Flag, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react';
import { MISSING_PERSON_STATUS, AGE_GROUPS, GENDER_OPTIONS, PHYSICAL_ATTRIBUTES } from '../../constants/missingPersonConstants';
import { useMissingPersonContext } from '../../contexts/MissingPersonContext';
import { useMissingPerson } from '../../hooks/useMissingPerson';
import useAuth from '../../hooks/useAuth';

const MissingPersonModal = ({ onClose }) => {
  const { selectedPerson, toggleSavePerson, isPersonSaved, addNotification } = useMissingPersonContext();
  const { updatePersonStatus, updateLastSeen, addTip } = useMissingPerson();
  const { user, profile } = useAuth();
  
  // Debug logging to check data structure
  console.log('Selected Person:', selectedPerson);
  console.log('Person ID:', selectedPerson?._id || selectedPerson?.id);
  
  const [showTipForm, setShowTipForm] = useState(false);
  const [sightingData, setSightingData] = useState({
    reportedBy: '',
    address: '',
    city: '',
    dateTime: '',
    description: ''
  });
  const [submittingTip, setSubmittingTip] = useState(false);

  // Populate user name when component mounts or user changes
  useEffect(() => {
    if (user) {
      const userName = user.name || profile?.name || user.fullName || user.email || '';
      setSightingData(prev => ({
        ...prev,
        reportedBy: userName
      }));
    }
  }, [user, profile]);

  if (!selectedPerson) return null;

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

  const formattedLocation = formatLocation(selectedPerson.lastSeenLocation);

  const isSaved = isPersonSaved(selectedPerson.id);
  const statusConfig = MISSING_PERSON_STATUS.find(s => s.value === selectedPerson.status);
  const ageGroup = AGE_GROUPS.find(ag => selectedPerson.age >= ag.minAge && selectedPerson.age <= ag.maxAge);
  const genderConfig = GENDER_OPTIONS.find(g => g.value === selectedPerson.gender);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'MISSING': return 'red';
      case 'FOUND': return 'green';
      case 'SEARCHING': return 'amber';
      case 'IDENTIFIED': return 'blue';
      default: return 'gray';
    }
  };

  const statusColor = getStatusColor(selectedPerson.status);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle save person
  const handleSave = () => {
    toggleSavePerson(selectedPerson.id);
  };

  // Handle tip submission
  const handleTipSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check for person ID
    const personId = selectedPerson?._id || selectedPerson?.id;
    if (!personId) {
      console.log('Adding error notification for missing person ID');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No person selected. Please try again.',
      });
      return;
    }
    
    if (!sightingData.reportedBy.trim() || !sightingData.address.trim() || !sightingData.city.trim() || !sightingData.description.trim()) {
      console.log('Adding warning notification for validation error');
      addNotification({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    try {
      setSubmittingTip(true);
      
      // First submit the sighting
      await addTip(personId, {
        reportedBy: sightingData.reportedBy,
        location: `${sightingData.address}, ${sightingData.city}`.trim(),
        dateTime: sightingData.dateTime || new Date().toISOString(),
        description: sightingData.description
      });

      // Then update the person's last seen information
      await updateLastSeen(personId, {
        address: sightingData.address,
        city: sightingData.city,
        dateTime: sightingData.dateTime || new Date().toISOString()
      });
      
      // Reset form
      setSightingData({
        reportedBy: '',
        address: '',
        city: '',
        dateTime: '',
        description: ''
      });
      setShowTipForm(false);
      
      // Show success notification
      console.log('Adding success notification for sighting submission');
      addNotification({
        type: 'success',
        title: 'Sighting Submitted Successfully',
        message: 'Thank you for your sighting information. The person\'s last seen location and time have been updated.',
      });
    } catch (error) {
      console.log('Adding error notification for submission failure');
      addNotification({
        type: 'error',
        title: 'Sighting Submission Failed',
        message: 'Failed to submit sighting. Please try again.',
      });
    } finally {
      setSubmittingTip(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 relative">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-400/20 to-purple-400/20"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/20 bg-white/50 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">{selectedPerson.name}</h2>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-${statusColor}-500 to-${statusColor}-600 shadow-lg transform hover:scale-105 transition-all duration-300`}>
              {statusConfig?.label || selectedPerson.status}
            </span>
            {selectedPerson.isUrgent && (
              <span className="px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg animate-pulse transform hover:scale-105 transition-all duration-300">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Urgent
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="group relative p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white hover:shadow-xl transform hover:scale-110 transition-all duration-300 border border-white/30"
          >
            <X className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative h-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
            
            {selectedPerson.photoUrl ? (
              <>
                <img
                  src={selectedPerson.photoUrl}
                  alt={selectedPerson.name}
                  className="w-full h-full object-cover transform transition-all duration-500 hover:scale-105"
                />
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="group relative p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl hover:bg-white hover:scale-110 transition-all duration-300 border border-white/30"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all duration-300 ${
                        isPersonSaved(selectedPerson._id) ? 'text-red-500 fill-red-500' : 'text-gray-600 group-hover:text-red-500'
                      }`}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No photo available</p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="relative z-10 p-4 bg-white/90 backdrop-blur-sm">
            <div className="space-y-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-200/50">
                      <User className="w-5 h-5 text-gray-700" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Age</p>
                        <p className="font-bold text-gray-900">{selectedPerson.age} years</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-200/50">
                      <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                        {genderConfig?.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Gender</p>
                        <p className="font-bold text-gray-900">{genderConfig?.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-200/50">
                      <Calendar className="w-5 h-5 text-gray-700" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Date Missing</p>
                        <p className="font-bold text-gray-900">{formatDate(selectedPerson.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl border border-gray-200/50">
                      <MapPin className="w-5 h-5 text-gray-700" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Last Seen</p>
                        <p className="font-bold text-gray-900">{formattedLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physical Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Physical Description</h3>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                    {selectedPerson.physicalDescription && (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPerson.physicalDescription.height && (
                          <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
                            <span className="text-sm font-semibold text-gray-800">Height:</span>
                            <span className="font-bold text-gray-900">{selectedPerson.physicalDescription.height}</span>
                          </div>
                        )}
                        {selectedPerson.physicalDescription.weight && (
                          <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
                            <span className="text-sm font-semibold text-gray-800">Weight:</span>
                            <span className="font-bold text-gray-900">{selectedPerson.physicalDescription.weight}</span>
                          </div>
                        )}
                        {selectedPerson.physicalDescription.hairColor && (
                          <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
                            <span className="text-sm font-semibold text-gray-800">Hair Color:</span>
                            <span className="font-bold text-gray-900">{selectedPerson.physicalDescription.hairColor}</span>
                          </div>
                        )}
                        {selectedPerson.physicalDescription.eyeColor && (
                          <div className="flex items-center space-x-2 p-2 bg-white/60 rounded-lg">
                            <span className="text-sm font-semibold text-gray-800">Eye Color:</span>
                            <span className="font-bold text-gray-900">{selectedPerson.physicalDescription.eyeColor}</span>
                          </div>
                        )}
                        {selectedPerson.physicalDescription.distinctiveMarks && (
                          <div className="col-span-2 flex items-start space-x-2 p-2 bg-white/60 rounded-lg">
                            <span className="text-sm font-semibold text-gray-800">Distinctive Marks:</span>
                            <span className="font-bold text-gray-900">{selectedPerson.physicalDescription.distinctiveMarks}</span>
                          </div>
                        )}
                        {selectedPerson.physicalDescription.clothing && (
                          <div className="col-span-2 flex items-start space-x-2 p-2 bg-white/60 rounded-lg">
                            <span className="text-sm font-semibold text-gray-800">Clothing:</span>
                            <span className="font-bold text-gray-900">{selectedPerson.physicalDescription.clothing}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Marks */}
                {selectedPerson.specialMarks && selectedPerson.specialMarks.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Special Marks</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedPerson.specialMarks.map((mark, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold border border-green-200"
                        >
                          {mark}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clothing */}
                {selectedPerson.clothing && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Clothing</h3>
                    <p className="text-gray-800 font-medium bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                      {selectedPerson.clothing}
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <User className="w-5 h-5 text-gray-700" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Contact Person</p>
                        <p className="font-bold text-gray-900">{selectedPerson.reporterName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <Phone className="w-5 h-5 text-gray-700" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Phone</p>
                        <p className="font-bold text-gray-900">{selectedPerson.reporterContact?.phone}</p>
                      </div>
                    </div>
                    {selectedPerson.reporterContact?.email && (
                      <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 col-span-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700">@</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Email</p>
                          <p className="font-bold text-gray-900">{selectedPerson.reporterContact?.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sighting Form */}
          {showTipForm && (
            <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Report Sighting</h3>
                <form onSubmit={handleTipSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={sightingData.reportedBy}
                        onChange={(e) => setSightingData({...sightingData, reportedBy: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Date & Time of Sighting *
                      </label>
                      <input
                        type="datetime-local"
                        value={sightingData.dateTime}
                        onChange={(e) => setSightingData({...sightingData, dateTime: e.target.value})}
                        max={new Date().toISOString().slice(0, 16)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Location of Sighting *
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={sightingData.address}
                        onChange={(e) => setSightingData({...sightingData, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Street address or specific location"
                        required
                      />
                      <input
                        type="text"
                        value={sightingData.city}
                        onChange={(e) => setSightingData({...sightingData, city: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Description of Sighting *
                    </label>
                    <textarea
                      value={sightingData.description}
                      onChange={(e) => setSightingData({...sightingData, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900 resize-none"
                      rows={4}
                      placeholder="Please describe what you saw, what the person was wearing, their condition, and any other relevant details..."
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submittingTip}
                      className="flex-1 p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg"
                    >
                      {submittingTip ? 'Submitting...' : 'Submit Sighting'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTipForm(false)}
                      className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        {/* Footer Actions - Only show for Active missing persons */}
        {selectedPerson.status === 'Active' && (
          <div className="relative z-10 border-t border-white/20 bg-white/30 backdrop-blur-md p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.open(`tel:${selectedPerson.reporterContact?.phone}`)}
                className="group relative flex-1 flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Call Contact</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => setShowTipForm(true)}
                className="group relative flex-1 flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Provide Tip</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingPersonModal;
