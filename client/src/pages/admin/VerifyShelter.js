import React, { useState, useEffect } from 'react';
import { ShieldCheck, X,LayoutDashboard, Check, AlertCircle, MapPin, Phone, Mail, Users, Home, Wifi, Accessibility, Heart, Baby, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from "../../layouts/DashboardLayout";
import useAuth from '../../hooks/useAuth';
import { MissingPersonProvider, useMissingPersonContext } from '../../contexts/MissingPersonContext';
import NotificationContainer from '../../components/common/NotificationContainer';

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
  }
  
  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

const VerifyShelterContent = () => {
  const { user } = useAuth();
  const { addNotification } = useMissingPersonContext();
  const [unverifiedShelters, setUnverifiedShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectingShelterId, setRejectingShelterId] = useState(null);

  // Fetch unverified shelters
  const fetchUnverifiedShelters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/shelters/get-list-verified?verified=false', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shelters');
      }
      
      const result = await response.json();
      
      // Use correct response structure - backend now returns only unverified shelters
      const unverified = result.shelters || [];
      
      console.log('Unverified shelters fetched:', unverified);
      setUnverifiedShelters(unverified);
    } catch (error) {
      console.error('Error fetching unverified shelters:', error);
      setError('Failed to load unverified shelters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedShelters();
  }, []);

  // Verify shelter
  const handleVerifyShelter = async (shelterId) => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/shelters/update/${shelterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ verified: true })
      });

      if (!response.ok) {
        throw new Error('Failed to verify shelter');
      }

      // Remove verified shelter from list
      setUnverifiedShelters(prev => prev.filter(shelter => shelter._id !== shelterId));
      setShowDetailsModal(false);
      setSelectedShelter(null);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Shelter Verified',
        message: 'Shelter has been verified successfully.'
      });
    } catch (error) {
      console.error('Error verifying shelter:', error);
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: 'Failed to verify shelter. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Reject shelter
  const handleRejectShelter = async (shelterId) => {
    setRejectingShelterId(shelterId);
    setShowRejectConfirm(true);
  };

  // Confirm reject shelter
  const confirmRejectShelter = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/shelters/delete/${rejectingShelterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject shelter');
      }

      // Remove rejected shelter from list
      setUnverifiedShelters(prev => prev.filter(shelter => shelter._id !== rejectingShelterId));
      setShowDetailsModal(false);
      setSelectedShelter(null);
      setShowRejectConfirm(false);
      setRejectingShelterId(null);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Shelter Rejected',
        message: 'Shelter has been rejected and deleted successfully.'
      });
    } catch (error) {
      console.error('Error rejecting shelter:', error);
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Failed to reject shelter. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Cancel reject
  const cancelReject = () => {
    setShowRejectConfirm(false);
    setRejectingShelterId(null);
  };

  // Open shelter details
  const handleViewDetails = (shelter) => {
    setSelectedShelter(shelter);
    setShowDetailsModal(true);
  };
  // Get disaster type label
  const getDisasterTypeLabel = (value) => {
    const types = {
      'flood': 'Flood',
      'earthquake': 'Earthquake',
      'landslide': 'Landslide',
      'tsunami': 'Tsunami',
      'cyclone': 'Cyclone',
      'wildfire': 'Wildfire'
    };
    return types[value] || value;
  };

  if (error) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Shelters</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={fetchUnverifiedShelters}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-600 rounded-2xl shadow-lg">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Shelters</h1>
                  <p className="text-gray-600">Review and verify unverified shelter submissions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-yellow-100 rounded-full border border-yellow-300 shadow-sm">
                  <span className="text-sm font-semibold text-yellow-800">
                    {unverifiedShelters.length} Pending Verification
                  </span>
                </div>
                <button
                  onClick={fetchUnverifiedShelters}
                  className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  title="Refresh shelters"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shelters List */}
        {unverifiedShelters.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ShieldCheck className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">All Shelters Verified!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">There are no shelters pending verification at the moment. All shelters have been reviewed and approved.</p>
            <button
              onClick={fetchUnverifiedShelters}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShieldCheck className="w-5 h-5 inline mr-2" />
              Refresh Status
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unverifiedShelters.map((shelter, index) => (
              <div 
                key={shelter._id} 
                className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{shelter.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {shelter.address.city}, {shelter.address.province}
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-100 rounded-full">
                      <span className="text-xs font-semibold text-yellow-800">PENDING</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold text-gray-900">{shelter.capacity.total} people</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Occupancy:</span>
                      <span className="font-semibold text-gray-900">{shelter.occupancy.current || 0} people</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-semibold text-gray-900">{shelter.contact.phone}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <span className="text-gray-600 mr-2">Disasters:</span>
                      <div className="flex flex-wrap gap-1">
                        {shelter.supports.disasterTypes.slice(0, 2).map((type, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 rounded text-xs font-medium text-green-800">
                            {getDisasterTypeLabel(type)}
                          </span>
                        ))}
                        {shelter.supports.disasterTypes.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                            +{shelter.supports.disasterTypes.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleViewDetails(shelter)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shelter Details Modal */}
        {showDetailsModal && selectedShelter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedShelter.name}</h2>
                    <p className="text-blue-100">Shelter Verification Details</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Home className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Shelter Type</p>
                          <p className="text-sm text-gray-600">{selectedShelter.shelterType || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-gray-600">{selectedShelter.address.street}, {selectedShelter.address.city}, {selectedShelter.address.province}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-gray-600">{selectedShelter.contact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-600">{selectedShelter.contact.email || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Capacity Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="font-medium">Total Capacity:</span>
                        <span className="font-bold text-lg">{selectedShelter.capacity.total} people</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="font-medium">Current Occupancy:</span>
                        <span className="font-bold text-lg">{selectedShelter.occupancy.current || 0} people</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="font-medium">Available Space:</span>
                        <span className="font-bold text-lg text-green-600">
                          {selectedShelter.capacity.total - (selectedShelter.occupancy.current || 0)} people
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Map */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Shelter Location</h3>
                  <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    {selectedShelter.location && selectedShelter.location.coordinates && (
                      <MapContainer
                        center={[selectedShelter.location.coordinates[1], selectedShelter.location.coordinates[0]]}
                        zoom={13}
                        style={{ height: '300px', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[selectedShelter.location.coordinates[1], selectedShelter.location.coordinates[0]]}>
                          <Popup>
                            <div className="text-sm">
                              <strong>{selectedShelter.name}</strong><br />
                              {selectedShelter.address.street}, {selectedShelter.address.city}<br />
                              {selectedShelter.contact.phone}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    )}
                  </div>
                </div>

                {/* Disaster Types */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Supported Disaster Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedShelter.supports.disasterTypes.map((type, index) => (
                      <span key={index} className="px-3 py-2 bg-green-100 rounded-lg text-sm font-medium text-green-800">
                        {getDisasterTypeLabel(type)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Support Features */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Support Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedShelter.supports.wheelchairAccess && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Accessibility className="w-4 h-4 text-green-600" />
                        Wheelchair Access
                      </div>
                    )}
                    {selectedShelter.supports.medical && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        Medical Support
                      </div>
                    )}
                    {selectedShelter.supports.food && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Heart className="w-4 h-4 text-green-600" />
                        Food Available
                      </div>
                    )}
                    {selectedShelter.supports.water && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <AlertCircle className="w-4 h-4 text-green-600" />
                        Water Supply
                      </div>
                    )}
                    {selectedShelter.supports.power && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Wifi className="w-4 h-4 text-green-600" />
                        Power Supply
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Support */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Special Support</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedShelter.specialSupport.petFriendly && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Heart className="w-4 h-4 text-blue-600" />
                        Pet Friendly
                      </div>
                    )}
                    {selectedShelter.specialSupport.childFriendly && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Baby className="w-4 h-4 text-blue-600" />
                        Child Friendly
                      </div>
                    )}
                    {selectedShelter.specialSupport.elderlySupport && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-blue-600" />
                        Elderly Support
                      </div>
                    )}
                    {selectedShelter.specialSupport.disabilitySupport && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Accessibility className="w-4 h-4 text-blue-600" />
                        Disability Support
                      </div>
                    )}
                    {selectedShelter.specialSupport.pregnancySupport && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Heart className="w-4 h-4 text-blue-600" />
                        Pregnancy Support
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleVerifyShelter(selectedShelter._id)}
                    disabled={isVerifying}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    {isVerifying ? 'Verifying...' : 'Verify Shelter'}
                  </button>
                  <button
                    onClick={() => handleRejectShelter(selectedShelter._id)}
                    disabled={isVerifying}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                    {isVerifying ? 'Processing...' : 'Reject Shelter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {showRejectConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000]">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Rejection</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to reject this shelter? This action cannot be undone and the shelter will be permanently deleted.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelReject}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejectShelter}
                    disabled={isVerifying}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? 'Rejecting...' : 'Reject Shelter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <NotificationContainer />
      </div>
    );
};

// Wrapper component to provide MissingPersonContext
const VerifyShelter = () => {
  return (
    <MissingPersonProvider>
      <VerifyShelterContent />
    </MissingPersonProvider>
  );
};

export default VerifyShelter;