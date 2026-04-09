import React, { useState, useEffect, useRef } from 'react';
import { 
  X, MapPin, Calendar, Phone, Mail, Eye, AlertTriangle, Plus, 
  User, Clock, MessageCircle, CheckCircle, Star, Filter, Edit2, Trash2, ChevronDown, Info
} from 'lucide-react';
import { useMissingPersonContext } from '../../contexts/MissingPersonContext';
import { useMissingPerson } from '../../hooks/useMissingPerson';
import useAuth from '../../hooks/useAuth';
import { missingPersonService } from '../../services/missingPersonService';

const MyMissingPersonModal = ({ person, onClose }) => {
  const { addNotification } = useMissingPersonContext();
  const { user } = useAuth();
  
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    fullName: '',
    age: '',
    gender: '',
    circumstances: '',
    physicalDescription: {
      height: '',
      weight: '',
      hairColor: '',
      eyeColor: ''
    }
  });
  const dropdownRef = useRef(null);

  // Mock sighting data - in real implementation, this would come from API
  useEffect(() => {
    // For now, we'll use existing sightings data or create mock data
    // In real implementation, you would fetch from backend API
    const mockSightings = person.sightings || [
      {
        _id: '1',
        reportedBy: 'John Doe',
        location: 'Main Street, Colombo',
        dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        description: 'Seen walking near the bus stop, wearing blue shirt and jeans',
        verified: true,
        status: 'verified'
      },
      {
        _id: '2', 
        reportedBy: 'Jane Smith',
        location: 'Park Avenue, Kandy',
        dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        description: 'Spotted sitting on a bench, seemed tired',
        verified: false,
        status: 'pending'
      }
    ];
    
    setSightings(mockSightings);
  }, [person]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Format: "January 15, 2024 at 2:30 PM"
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Initialize update form with person data
  const initializeUpdateForm = () => {
    setUpdateForm({
      fullName: person.fullName || '',
      age: person.age || '',
      gender: person.gender || '',
      circumstances: person.circumstances || '',
      physicalDescription: {
        height: person.physicalDescription?.height || '',
        weight: person.physicalDescription?.weight || '',
        hairColor: person.physicalDescription?.hairColor || '',
        eyeColor: person.physicalDescription?.eyeColor || ''
      }
    });
    setShowUpdateModal(true);
  };

  // Handle update report
  const handleUpdateReport = () => {
    initializeUpdateForm();
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested form input changes
  const handleNestedFormChange = (section, field, value) => {
    setUpdateForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle update form submission
  const handleUpdateSubmit = async () => {
    setActionLoading(true);
    try {
      await missingPersonService.updateReport(person._id, updateForm);
      addNotification({
        type: 'success',
        title: 'Report Updated',
        message: 'Missing person report has been updated successfully.',
      });
      setShowUpdateModal(false);
      // Optionally refresh the person data
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update report.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete report
  const handleDeleteReport = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setActionLoading(true);
    
    try {
      await missingPersonService.deleteReport(person._id);
      addNotification({
        type: 'success',
        title: 'Report Deleted',
        message: 'Missing person report has been deleted successfully.',
      });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete report.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Get available status options based on current status
  const getAvailableStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'Active':
        return [
          { value: 'Found', label: 'Found', color: 'bg-green-600 hover:bg-green-700' },
          { value: 'Closed', label: 'Closed', color: 'bg-gray-600 hover:bg-gray-700' }
        ];
      case 'Found':
        return [
          { value: 'Closed', label: 'Closed', color: 'bg-gray-600 hover:bg-gray-700' }
        ];
      case 'Closed':
        return []; // No status changes allowed
      default:
        return [];
    }
  };

  // Handle change status
  const handleChangeStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await missingPersonService.updateStatus(person._id, newStatus);
      addNotification({
        type: 'success',
        title: 'Status Changed',
        message: `Report status changed to ${newStatus}.`,
      });
      setShowStatusDropdown(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Status Change Failed',
        message: error.message || 'Failed to change report status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 relative">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-green-400/20 to-purple-400/20"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/20 bg-white/50 backdrop-blur-md">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">{person.fullName}</h2>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Action Buttons */}
              {/* Status Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={actionLoading || getAvailableStatusOptions(person.status || 'Active').length === 0}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium flex items-center space-x-2"
                  title="Change report status"
                >
                  Change Status
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Dropdown Menu */}
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                    {getAvailableStatusOptions(person.status || 'Active').length > 0 ? (
                      getAvailableStatusOptions(person.status || 'Active').map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleChangeStatus(option.value)}
                          disabled={actionLoading}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${option.color}`}
                        >
                          {option.label}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No status changes available
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleUpdateReport}
                disabled={actionLoading}
                className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-400 transition-colors text-sm font-medium flex items-center space-x-2"
                title="Update report details"
              >
                <Edit2 className="w-4 h-4" />
                <span>Update</span>
              </button>
              <button
                onClick={handleDeleteReport}
                disabled={actionLoading}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors text-sm font-medium flex items-center space-x-2"
                title="Delete this report"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={onClose}
                className="group relative p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white hover:shadow-xl transform hover:scale-110 transition-all duration-300 border border-white/30"
              >
                <X className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Last Seen Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <span>Last Seen Information</span>
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Date & Time</p>
                        <p className="text-lg font-bold text-gray-900">
                          {person.lastSeenDate ? formatDateTime(person.lastSeenDate) : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Location</p>
                        <p className="text-lg font-bold text-gray-900 break-words">
                          {typeof person.lastSeenLocation === 'string' 
                            ? person.lastSeenLocation 
                            : person.lastSeenLocation?.fullAddress || 
                              person.lastSeenLocation?.address || 
                              person.lastSeenLocation?.city || 
                              'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {person.circumstances && (
                    <div className="mt-6 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100">
                      <p className="text-sm font-semibold text-gray-800 mb-2">Circumstances</p>
                      <p className="text-gray-700 leading-relaxed">{person.circumstances}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sighting Reports */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Eye className="w-6 h-6 text-green-600" />
                  <span>Sighting Reports</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {sightings.length} {sightings.length === 1 ? 'Report' : 'Reports'}
                  </span>
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : sightings.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No sighting reports yet</p>
                    <p className="text-gray-500 text-sm mt-2">Be the first to report a sighting</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sightings.map((sighting) => (
                      <div key={sighting._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                sighting.verified || sighting.status === 'verified' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : sighting.status === 'false'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              }`}>
                                {sighting.verified || sighting.status === 'verified' ? (
                                  <span className="flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Verified</span>
                                  </span>
                                ) : sighting.status === 'false' ? (
                                  <span className="flex items-center space-x-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>False Report</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Pending</span>
                                  </span>
                                )}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(sighting.dateTime)}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4 leading-relaxed">{sighting.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{sighting.location}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <span>Reported by: {sighting.reportedBy}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[10000] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 transform transition-all duration-300 ease-out scale-100 animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Update Missing Person Report</h2>
                  <p className="text-xs text-gray-600">Edit details of this missing person report</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="group p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-3 h-3 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Full Name</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={updateForm.fullName}
                        onChange={(e) => handleFormChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Age</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={updateForm.age}
                        onChange={(e) => handleFormChange('age', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter age"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Gender</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={updateForm.gender}
                        onChange={(e) => handleFormChange('gender', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Circumstances</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={updateForm.circumstances}
                        onChange={(e) => handleFormChange('circumstances', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium resize-none"
                        placeholder="Describe the circumstances of disappearance"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Description */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-3 h-3 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Physical Description</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Height</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={updateForm.physicalDescription.height}
                        onChange={(e) => handleNestedFormChange('physicalDescription', 'height', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-green-500 focus:border-green-500 focus:bg-green-50 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="e.g., 5'10&quot; or 178cm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Weight</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={updateForm.physicalDescription.weight}
                        onChange={(e) => handleNestedFormChange('physicalDescription', 'weight', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-green-500 focus:border-green-500 focus:bg-green-50 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="e.g., 150lbs or 68kg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Hair Color</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={updateForm.physicalDescription.hairColor}
                        onChange={(e) => handleNestedFormChange('physicalDescription', 'hairColor', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-green-500 focus:border-green-500 focus:bg-green-50 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="e.g., Brown, Black, Blonde"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center space-x-2">
                        <span>Eye Color</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={updateForm.physicalDescription.eyeColor}
                        onChange={(e) => handleNestedFormChange('physicalDescription', 'eyeColor', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-green-500 focus:border-green-500 focus:bg-green-50 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="e.g., Blue, Brown, Green"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-600">
                  <span className="flex items-center space-x-2">
                    <Info className="w-3 h-3" />
                    <span>Required fields are marked with *</span>
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold hover:shadow-md text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSubmit}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Update Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[10001] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all duration-300 ease-out scale-100 animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Report</h3>
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to delete this missing person report?
              </p>
              <p className="text-red-600 font-semibold mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Person Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{person?.fullName || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">
                    {person?.age ? `Age: ${person.age}` : ''} 
                    {person?.age && person?.gender ? ' • ' : ''}
                    {person?.gender || ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyMissingPersonModal;
