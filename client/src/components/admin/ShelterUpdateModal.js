import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Shield, 
  Home,
  AlertCircle,
  Check,
  Heart
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.4s ease-out;
  }
`;
if (!document.head.querySelector('style[data-shelter-update-modal]')) {
  style.setAttribute('data-shelter-update-modal', 'true');
  document.head.appendChild(style);
}

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
  tooltipAnchor: [1, -34],
});

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect([lng, lat]); // GeoJSON format [longitude, latitude]
    },
  });
  return null;
};

// Import constants from existing modal
const SHELTER_TYPES = [
  { value: 'SCHOOL', label: 'School', icon: '🏫' },
  { value: 'TEMPLE', label: 'Temple', icon: '🛕' },
  { value: 'COMMUNITY_CENTER', label: 'Community Center', icon: '🏛️' },
  { value: 'SPORTS_COMPLEX', label: 'Sports Complex', icon: '🏟️' },
  { value: 'HOSPITAL', label: 'Hospital', icon: '🏥' },
  { value: 'GOVERNMENT_BUILDING', label: 'Government Building', icon: '🏢' },
  { value: 'OTHER', label: 'Other', icon: '🏠' }
];

const DISASTER_TYPES = [
  { value: 'FLOOD', label: 'Flood', icon: '🌊' },
  { value: 'CYCLONE', label: 'Cyclone', icon: '🌀' },
  { value: 'TSUNAMI', label: 'Tsunami', icon: '🌊' },
  { value: 'EARTHQUAKE', label: 'Earthquake', icon: '🏚️' },
  { value: 'LANDSLIDE', label: 'Landslide', icon: '⛰️' },
  { value: 'FIRE', label: 'Fire', icon: '🔥' },
  { value: 'DROUGHT', label: 'Drought', icon: '☀️' },
  { value: 'EPIDEMIC', label: 'Epidemic', icon: '🦠' },
  { value: 'OTHER', label: 'Other', icon: '⚠️' }
];

const ShelterUpdateModal = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  shelter,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shelterType: 'SCHOOL',
    images: [],
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: ''
    },
    contact: {
      phone: '',
      email: ''
    },
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    capacity: {
      total: 0
    },
    occupancy: {
      current: 0
    },
    supports: {
      disasterTypes: [],
      wheelchairAccess: false,
      medical: false,
      food: false,
      water: false,
      power: false
    },
    specialSupport: {
      elderlySupport: false,
      disabilitySupport: false,
      pregnancySupport: false,
      childFriendly: false,
      petFriendly: false
    },
    status: 'OPEN'
  });

  const [errors, setErrors] = useState({});

  // Initialize form with shelter data
  useEffect(() => {
    if (shelter && isOpen) {
      setFormData({
        name: shelter.name || '',
        description: shelter.description || '',
        shelterType: shelter.shelterType || 'SCHOOL',
        images: shelter.images || [],
        address: {
          street: shelter.address?.street || '',
          city: shelter.address?.city || '',
          province: shelter.address?.province || '',
          postalCode: shelter.address?.postalCode || ''
        },
        contact: {
          phone: shelter.contact?.phone || '',
          email: shelter.contact?.email || ''
        },
        location: {
          type: shelter.location?.type || 'Point',
          coordinates: shelter.location?.coordinates || [0, 0]
        },
        capacity: {
          total: shelter.capacity?.total || 0
        },
        occupancy: {
          current: shelter.occupancy?.current || 0
        },
        supports: {
          disasterTypes: shelter.supports?.disasterTypes || [],
          wheelchairAccess: shelter.supports?.wheelchairAccess || false,
          medical: shelter.supports?.medical || false,
          food: shelter.supports?.food || false,
          water: shelter.supports?.water || false,
          power: shelter.supports?.power || false
        },
        specialSupport: {
          elderlySupport: shelter.specialSupport?.elderlySupport || false,
          disabilitySupport: shelter.specialSupport?.disabilitySupport || false,
          pregnancySupport: shelter.specialSupport?.pregnancySupport || false,
          childFriendly: shelter.specialSupport?.childFriendly || false,
          petFriendly: shelter.specialSupport?.petFriendly || false
        },
        status: shelter.status || 'OPEN'
      });
      setErrors({});
    }
  }, [shelter, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    
    // Clear error for this nested field
    if (errors[`${parent}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${parent}.${field}`]: null
      }));
    }
    
    // Real-time occupancy validation
    if (parent === 'occupancy' && field === 'current') {
      const totalCapacity = formData.capacity.total;
      if (value <= totalCapacity) {
        setErrors(prev => ({
          ...prev,
          ['occupancy.current']: null
        }));
      }
    }
    
    // Validate occupancy when capacity changes
    if (parent === 'capacity' && field === 'total') {
      const currentOccupancy = formData.occupancy.current;
      if (currentOccupancy > value) {
        setErrors(prev => ({
          ...prev,
          ['occupancy.current']: 'Current occupancy cannot exceed total capacity'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          ['occupancy.current']: null
        }));
      }
    }
  };

  const handleDisasterTypeToggle = (disasterType) => {
    setFormData(prev => ({
      ...prev,
      supports: {
        ...prev.supports,
        disasterTypes: prev.supports.disasterTypes.includes(disasterType)
          ? prev.supports.disasterTypes.filter(type => type !== disasterType)
          : [...prev.supports.disasterTypes, disasterType]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors['name'] = 'Shelter name is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.province.trim()) newErrors['address.province'] = 'Province is required';
    if (!formData.contact.phone.trim()) newErrors['contact.phone'] = 'Phone number is required';
    if (!formData.capacity.total || formData.capacity.total < 1) newErrors['capacity.total'] = 'Capacity must be at least 1';
    
    // Occupancy validation - current occupancy cannot exceed total capacity
    if (formData.occupancy.current > formData.capacity.total) {
      newErrors['occupancy.current'] = 'Current occupancy cannot exceed total capacity';
    }
    
    if (!formData.supports.disasterTypes.length) newErrors['supports.disasterTypes'] = 'At least one disaster type is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[10000] animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Update Shelter</h2>
                <p className="text-green-100 text-sm font-medium flex items-center gap-2">
                  <span>Edit shelter information</span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs">LOCATION</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                <div className="px-3 py-1 bg-green-100 rounded-full">
                  <span className="text-xs font-semibold text-green-700">REQUIRED</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Shelter Name</span>
                    <span className="text-red-500">*</span>
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${errors['name'] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg`}
                      placeholder="Enter shelter name"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Home className="w-5 h-5" />
                    </div>
                  </div>
                  {errors['name'] && (
                    <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                      <span>⚠️</span> {errors['name']}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Shelter Type</span>
                    <span className="text-red-500">*</span>
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.shelterType}
                      onChange={(e) => handleInputChange('shelterType', e.target.value)}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${errors['shelterType'] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg appearance-none cursor-pointer`}
                    >
                      {SHELTER_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors['shelterType'] && (
                    <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                      <span>⚠️</span> {errors['shelterType']}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>Description</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">OPTIONAL</span>
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg resize-none"
                    placeholder="Enter shelter description..."
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Address Information</h3>
                <div className="px-3 py-1 bg-green-100 rounded-full">
                  <span className="text-xs font-semibold text-green-700">LOCATION</span>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Street Address</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">OPTIONAL</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="Enter street address..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>City</span>
                      <span className="text-red-500">*</span>
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                        className={`w-full px-4 py-4 rounded-xl border-2 ${errors['address.city'] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg`}
                        placeholder="Enter city"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    {errors['address.city'] && (
                      <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                        <span>⚠️</span> {errors['address.city']}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>Province</span>
                      <span className="text-red-500">*</span>
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address.province}
                        onChange={(e) => handleNestedInputChange('address', 'province', e.target.value)}
                        className={`w-full px-4 py-4 rounded-xl border-2 ${errors['address.province'] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg`}
                        placeholder="Enter province"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    {errors['address.province'] && (
                      <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                        <span>⚠️</span> {errors['address.province']}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span>Postal Code</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">OPTIONAL</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                        placeholder="Enter postal code"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl p-6 border border-lime-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-lime-500 to-green-500 rounded-xl">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                <div className="px-3 py-1 bg-lime-100 rounded-full">
                  <span className="text-xs font-semibold text-lime-700">CONTACT</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Phone Number</span>
                    <span className="text-red-500">*</span>
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${errors['contact.phone'] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg`}
                      placeholder="Enter phone number"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                  </div>
                  {errors['contact.phone'] && (
                    <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                      <span>â ï¸</span> {errors['contact.phone']}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Email Address</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">OPTIONAL</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleNestedInputChange('contact', 'email', e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="Enter email address"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinate Selection */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Shelter Location</h3>
                <div className="px-3 py-1 bg-teal-100 rounded-full">
                  <span className="text-xs font-semibold text-teal-700">MAP</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      value={formData.location.coordinates[0]}
                      onChange={(e) => handleNestedInputChange('location', 'coordinates', [parseFloat(e.target.value), formData.location.coordinates[1]])}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="80.7718"
                      step="0.000001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      value={formData.location.coordinates[1]}
                      onChange={(e) => handleNestedInputChange('location', 'coordinates', [formData.location.coordinates[0], parseFloat(e.target.value)])}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="7.7971"
                      step="0.000001"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Click on map to set location</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">INTERACTIVE</span>
                  </label>
                  <div className="h-64 rounded-xl overflow-hidden border-2 border-teal-200 shadow-lg">
                    <MapContainer
                      center={[formData.location.coordinates[1], formData.location.coordinates[0]]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <MapClickHandler onLocationSelect={(coords) => handleNestedInputChange('location', 'coordinates', coords)} />
                      <Marker position={[formData.location.coordinates[1], formData.location.coordinates[0]]}>
                        <Popup>
                          <div className="text-center">
                            <strong>Shelter Location</strong><br />
                            Lat: {formData.location.coordinates[1].toFixed(6)}<br />
                            Lng: {formData.location.coordinates[0].toFixed(6)}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    Click anywhere on the map to update the shelter coordinates
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity Information */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Capacity Information</h3>
                <div className="px-3 py-1 bg-emerald-100 rounded-full">
                  <span className="text-xs font-semibold text-emerald-700">CAPACITY</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Total Capacity</span>
                    <span className="text-red-500">*</span>
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.capacity.total}
                      onChange={(e) => handleNestedInputChange('capacity', 'total', parseInt(e.target.value))}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${errors['capacity.total'] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg`}
                      placeholder="100"
                      min="1"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  {errors['capacity.total'] && (
                    <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                      <span>â ï¸</span> {errors['capacity.total']}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>Current Occupancy</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">OPTIONAL</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.occupancy.current}
                      onChange={(e) => handleNestedInputChange('occupancy', 'current', parseInt(e.target.value))}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${errors['occupancy.current'] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg`}
                      placeholder="0"
                      min="0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  {errors['occupancy.current'] && (
                    <p className="mt-2 text-sm text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors['occupancy.current']}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Disaster Types */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Supported Disaster Types</h3>
                <div className="px-3 py-1 bg-green-100 rounded-full">
                  <span className="text-xs font-semibold text-green-700">REQUIRED</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DISASTER_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleDisasterTypeToggle(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all font-medium shadow-sm hover:shadow-md ${
                      formData.supports.disasterTypes.includes(type.value)
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 transform scale-105 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-green-300 text-gray-900 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div className="text-lg">{type.icon}</div>
                      <div className="text-sm font-semibold">{type.label}</div>
                    </div>
                  </button>
                ))}
              </div>
              {errors['supports.disasterTypes'] && (
                <p className="mt-3 text-sm text-red-500 font-medium flex items-center gap-1">
                  <span>â ï¸</span> {errors['supports.disasterTypes']}
                </p>
              )}
            </div>

            {/* Support Features */}
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl p-6 border border-lime-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-lime-500 to-green-500 rounded-xl">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Support Features</h3>
                <div className="px-3 py-1 bg-lime-100 rounded-full">
                  <span className="text-xs font-semibold text-lime-700">FACILITIES</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'wheelchairAccess', label: 'Wheelchair Access', icon: ' wheelchair' },
                  { key: 'medical', label: 'Medical Support', icon: ' medical' },
                  { key: 'food', label: 'Food Available', icon: ' food' },
                  { key: 'water', label: 'Water Supply', icon: ' water' },
                  { key: 'power', label: 'Power Supply', icon: ' power' }
                ].map(feature => (
                  <label key={feature.key} className="flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all shadow-sm hover:shadow-md bg-white">
                    <input
                      type="checkbox"
                      checked={formData.supports[feature.key]}
                      onChange={(e) => handleNestedInputChange('supports', feature.key, e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{feature.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Support */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Special Support</h3>
                <div className="px-3 py-1 bg-emerald-100 rounded-full">
                  <span className="text-xs font-semibold text-emerald-700">SPECIAL</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'elderlySupport', label: 'Elderly Support' },
                  { key: 'disabilitySupport', label: 'Disability Support' },
                  { key: 'pregnancySupport', label: 'Pregnancy Support' },
                  { key: 'childFriendly', label: 'Child Friendly' },
                  { key: 'petFriendly', label: 'Pet Friendly' }
                ].map(support => (
                  <label key={support.key} className="flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md bg-white">
                    <input
                      type="checkbox"
                      checked={formData.specialSupport[support.key]}
                      onChange={(e) => handleNestedInputChange('specialSupport', support.key, e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{support.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl p-6 border border-teal-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Shelter Status</h3>
                <div className="px-3 py-1 bg-teal-100 rounded-full">
                  <span className="text-xs font-semibold text-teal-700">STATUS</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span>Current Status</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 font-medium shadow-sm hover:shadow-md focus:shadow-lg appearance-none cursor-pointer"
                  >
                    <option value="OPEN">Open - Accepting evacuees</option>
                    <option value="FULL">Full - At maximum capacity</option>
                    <option value="CLOSED">Closed - Not accepting evacuees</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      formData.status === 'OPEN' ? 'bg-green-500' :
                      formData.status === 'FULL' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    {formData.status === 'OPEN' ? 'Shelter is currently open and accepting evacuees' :
                      formData.status === 'FULL' ? 'Shelter has reached maximum capacity' :
                      'Shelter is temporarily closed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-green-50 -mx-6 px-6 py-6 rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Shelter</span>
                      <span className="px-2 py-1 bg-white/20 rounded-full text-xs">SAVE</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShelterUpdateModal;
