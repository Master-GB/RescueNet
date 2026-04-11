import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  Users, 
  Shield, 
  Wifi, 
  Baby, 
  Accessibility,
  Heart,
  AlertTriangle,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Info,
  Zap,
  Building,
  Car,
  TreePine,
  Cloud,
  Star,
  TrendingUp,
  Activity,
  Award,
  Compass,
  ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ShelterCreationModal = ({ isOpen, onClose, onSuccess, onError, setVerified = true }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shelterType: 'OTHER',
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
      coordinates: [0, 0]
    },
    capacity: {
      total: ''
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
    status: 'OPEN',
    verified: false,
    images: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [estimatedCapacity, setEstimatedCapacity] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default to Colombo
  const [mapZoom, setMapZoom] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const SHELTER_TYPES = [
    { value: 'SCHOOL', label: 'School', icon: 'school' },
    { value: 'TEMPLE', label: 'Temple', icon: 'temple' },
    { value: 'COMMUNITY_HALL', label: 'Community Hall', icon: 'hall' },
    { value: 'STADIUM', label: 'Stadium', icon: 'stadium' },
    { value: 'GOVERNMENT_BUILDING', label: 'Government Building', icon: 'building' },
    { value: 'OTHER', label: 'Other', icon: 'other' }
  ];

  const DISASTER_TYPES = [
    { value: 'FLOOD', label: 'Flood', icon: 'H2O' },
    { value: 'LANDSLIDE', label: 'Landslide', icon: 'MUD' },
    { value: 'TSUNAMI', label: 'Tsunami', icon: 'WAV' },
    { value: 'FIRE', label: 'Fire', icon: 'FIR' },
    { value: 'CYCLONE', label: 'Cyclone', icon: 'WND' },
    { value: 'OTHER', label: 'Other', icon: 'OTH' }
  ];

  const PROVINCES = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern', 
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ];

  const SUPPORT_FEATURES = [
    { key: 'wheelchairAccess', label: 'Wheelchair Access', icon: Accessibility },
    { key: 'medical', label: 'Medical Support', icon: Shield },
    { key: 'food', label: 'Food Available', icon: Heart },
    { key: 'water', label: 'Water Available', icon: AlertTriangle },
    { key: 'power', label: 'Power Available', icon: Wifi }
  ];

  const SPECIAL_SUPPORTS = [
    { key: 'elderlySupport', label: 'Elderly Support', icon: Users },
    { key: 'disabilitySupport', label: 'Disability Support', icon: Accessibility },
    { key: 'pregnancySupport', label: 'Pregnancy Support', icon: Heart },
    { key: 'childFriendly', label: 'Child Friendly', icon: Baby },
    { key: 'petFriendly', label: 'Pet Friendly', icon: Heart }
  ];

  const AMENITIES = [
    { key: 'parking', label: 'Parking Available', icon: Car },
    { key: 'restrooms', label: 'Restrooms', icon: Home },
    { key: 'kitchen', label: 'Kitchen Facilities', icon: Heart },
    { key: 'sleepingArea', label: 'Sleeping Area', icon: Home },
    { key: 'storage', label: 'Storage Space', icon: Building },
    { key: 'communication', label: 'Communication', icon: Wifi },
    { key: 'transportation', label: 'Transportation', icon: Car }
  ];

  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const DAY_LABELS = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    setErrors(prev => ({ ...prev, [`${parent}.${field}`]: '' }));
  };

  const handleDisasterTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      supports: {
        ...prev.supports,
        disasterTypes: prev.supports.disasterTypes.includes(type)
          ? prev.supports.disasterTypes.filter(t => t !== type)
          : [...prev.supports.disasterTypes, type]
      }
    }));
  };

  const handleSupportToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      supports: {
        ...prev.supports,
        [key]: !prev.supports[key]
      }
    }));
  };

  const handleSpecialSupportToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      specialSupport: {
        ...prev.specialSupport,
        [key]: !prev.specialSupport[key]
      }
    }));
  };

  


  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name || formData.address.city) {
        localStorage.setItem('shelterDraft', JSON.stringify(formData));
        setLastSaved(new Date());
        setAutoSaveStatus('Draft saved');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('shelterDraft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsedDraft }));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Calculate estimated capacity based on features
  useEffect(() => {
    const baseCapacity = parseInt(formData.capacity.total) || 0;
    const features = formData.supports ? Object.values(formData.supports).filter(Boolean).length : 0;
    const specialFeatures = formData.specialSupport ? Object.values(formData.specialSupport).filter(Boolean).length : 0;
    const amenities = formData.amenities ? Object.values(formData.amenities).filter(Boolean).length : 0;
    
    const multiplier = 1 + (features * 0.1) + (specialFeatures * 0.05) + (amenities * 0.03);
    setEstimatedCapacity(Math.floor(baseCapacity * multiplier));
  }, [formData.capacity.total, formData.supports, formData.specialSupport, formData.amenities]);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Name validation
      if (!formData.name.trim()) {
        newErrors.name = 'Shelter name is required';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Shelter name must be at least 3 characters long';
      } else if (formData.name.trim().length > 100) {
        newErrors.name = 'Shelter name must not exceed 100 characters';
      } else if (!/^[a-zA-Z0-9\s\-_,.'()]+$/.test(formData.name.trim())) {
        newErrors.name = 'Shelter name contains invalid characters';
      }

      // Description validation
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters long';
      } else if (formData.description.trim().length > 1000) {
        newErrors.description = 'Description must not exceed 1000 characters';
      }

      // Shelter type validation
      if (!formData.shelterType) {
        newErrors.shelterType = 'Shelter type is required';
      }
    }

    if (step === 2) {
      // Street validation (optional but if provided, must be valid)
      if (formData.address.street && formData.address.street.trim().length > 200) {
        newErrors['address.street'] = 'Street address must not exceed 200 characters';
      }

      // City validation
      if (!formData.address.city.trim()) {
        newErrors['address.city'] = 'City is required';
      } else if (formData.address.city.trim().length < 2) {
        newErrors['address.city'] = 'City must be at least 2 characters long';
      } else if (formData.address.city.trim().length > 50) {
        newErrors['address.city'] = 'City must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s\-]+$/.test(formData.address.city.trim())) {
        newErrors['address.city'] = 'City can only contain letters, spaces, and hyphens';
      }

      // Province validation
      if (!formData.address.province) {
        newErrors['address.province'] = 'Province is required';
      }

      // Postal code validation
      if (!formData.address.postalCode.trim()) {
        newErrors['address.postalCode'] = 'Postal code is required';
      } else if (!/^\d{5}$/.test(formData.address.postalCode.trim())) {
        newErrors['address.postalCode'] = 'Postal code must be exactly 5 digits';
      }

      // Phone validation
      if (!formData.contact.phone.trim()) {
        newErrors['contact.phone'] = 'Phone number is required';
      } else {
        // Remove all non-digit characters for validation
        const cleanPhone = formData.contact.phone.replace(/\D/g, '');
        if (!/^\+94\d{9}$/.test(formData.contact.phone.trim()) && !/^0\d{9}$/.test(formData.contact.phone.trim())) {
          newErrors['contact.phone'] = 'Phone number must be in format +94 XX XXX XXXX or 0XX XXX XXXX';
        } else if (cleanPhone.length < 9 || cleanPhone.length > 11) {
          newErrors['contact.phone'] = 'Phone number must have 9-11 digits';
        }
      }

      // Email validation (optional but if provided, must be valid)
      if (formData.contact.email && formData.contact.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contact.email.trim())) {
          newErrors['contact.email'] = 'Please enter a valid email address';
        } else if (formData.contact.email.trim().length > 100) {
          newErrors['contact.email'] = 'Email must not exceed 100 characters';
        }
      }
    }

    if (step === 3) {
      if (!formData.location.coordinates[0] || !formData.location.coordinates[1]) {
        newErrors.location = 'Please select a location on the map';
      } else {
        // Validate coordinates are within Sri Lanka bounds (approximately)
        const [lng, lat] = formData.location.coordinates;
        if (lng < 79.6 || lng > 81.9) {
          newErrors.location = 'Location must be within Sri Lanka';
        } else if (lat < 5.9 || lat > 9.8) {
          newErrors.location = 'Location must be within Sri Lanka';
        }
      }
    }

    if (step === 4) {
      // Capacity validation
      if (!formData.capacity.total || formData.capacity.total < 1) {
        newErrors['capacity.total'] = 'Capacity must be at least 1 person';
      } else if (formData.capacity.total > 10000) {
        newErrors['capacity.total'] = 'Capacity must not exceed 10,000 people';
      }

      // Current occupancy validation
      if (formData.capacity.occupancy && formData.capacity.occupancy < 0) {
        newErrors['capacity.occupancy'] = 'Current occupancy cannot be negative';
      } else if (formData.capacity.occupancy && formData.capacity.occupancy > formData.capacity.total) {
        newErrors['capacity.occupancy'] = 'Current occupancy cannot exceed total capacity';
      }

      // Disaster types validation
      if (formData.supports.disasterTypes.length === 0) {
        newErrors['supports.disasterTypes'] = 'At least one disaster type must be selected';
      } else if (formData.supports.disasterTypes.length > 10) {
        newErrors['supports.disasterTypes'] = 'Cannot select more than 10 disaster types';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  
  
  
// Calculate estimated capacity based on features
useEffect(() => {
  const baseCapacity = parseInt(formData.capacity.total) || 0;
  const features = formData.supports ? Object.values(formData.supports).filter(Boolean).length : 0;
  const specialFeatures = formData.specialSupport ? Object.values(formData.specialSupport).filter(Boolean).length : 0;
  const amenities = formData.amenities ? Object.values(formData.amenities).filter(Boolean).length : 0;
  
  const multiplier = 1 + (features * 0.1) + (specialFeatures * 0.05) + (amenities * 0.03);
  setEstimatedCapacity(Math.floor(baseCapacity * multiplier));
}, [formData.capacity.total, formData.supports, formData.specialSupport, formData.amenities]);

const handlePrevious = () => {
  setCurrentStep(prev => Math.max(prev - 1, 1));
};

const resetForm = () => {
  setFormData({
    name: '',
    description: '',
    shelterType: 'OTHER',
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
      coordinates: [0, 0]
    },
    capacity: {
      total: ''
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
    status: 'OPEN',
    verified: false,
    images: []
  });
  setErrors({});
  setCurrentStep(1);
  setPreviewImages([]);
  setUploadProgress(0);
  setIsUploading(false);
  setEstimatedCapacity(0);
  // Clear draft from localStorage
  localStorage.removeItem('shelterDraft');
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateStep(4)) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const shelterData = {
      ...formData,
      verified: setVerified  // Use setVerified prop to determine verification status
    };
    
    const response = await fetch('/api/shelters/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shelterData)
    });
    
    if (response.ok) {
      const newShelter = await response.json();
      onSuccess(newShelter);
      resetForm(); // Clear form after successful submission
      onClose();
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.message || 'Failed to create shelter';
      setErrors({ submit: errorMessage });
      if (onError) onError(errorMessage);
    }
  } catch (error) {
    const errorMessage = 'Network error. Please try again.';
    setErrors({ submit: errorMessage });
    if (onError) onError(errorMessage);
  } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = [longitude, latitude];
          handleNestedInputChange('location', 'coordinates', coords);
          setMapCenter([latitude, longitude]);
          setSelectedLocation(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const coords = [lng, lat];
    handleNestedInputChange('location', 'coordinates', coords);
    setSelectedLocation(coords);
  };

  // MapEvents component to handle map clicks
  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelter Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500`}
                placeholder="Enter shelter name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500`}
                placeholder="Describe the shelter facilities and features"
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shelter Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SHELTER_TYPES.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.shelterType === type.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shelterType"
                      value={type.value}
                      checked={formData.shelterType === type.value}
                      onChange={(e) => handleInputChange('shelterType', e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center flex-1">
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-xs font-medium text-gray-900">{type.label}</div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.shelterType && <p className="mt-1 text-sm text-red-500">{errors.shelterType}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address (Optional)</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors['address.street'] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500`}
                    placeholder="123 Main Street"
                  />
                  {errors['address.street'] && <p className="mt-1 text-sm text-red-500">{errors['address.street']}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors['address.city'] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500`}
                      placeholder="City"
                    />
                    {errors['address.city'] && <p className="mt-1 text-sm text-red-500">{errors['address.city']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.address.province}
                      onChange={(e) => handleNestedInputChange('address', 'province', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors['address.province'] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900`}
                    >
                      <option value="">Select Province</option>
                      {PROVINCES.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors['address.province'] && <p className="mt-1 text-sm text-red-500">{errors['address.province']}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors['address.postalCode'] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500`}
                    placeholder="12345"
                  />
                  {errors['address.postalCode'] && <p className="mt-1 text-sm text-red-500">{errors['address.postalCode']}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.contact.phone}
                      onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors['contact.phone'] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500`}
                      placeholder="+94 11 234 5678"
                    />
                  </div>
                  {errors['contact.phone'] && <p className="mt-1 text-sm text-red-500">{errors['contact.phone']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleNestedInputChange('contact', 'email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors['contact.email'] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500`}
                      placeholder="shelter@example.com"
                    />
                  </div>
                  {errors['contact.email'] && <p className="mt-1 text-sm text-red-500">{errors['contact.email']}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Location on Map</h3>
              <p className="text-sm text-gray-600 mb-4">Click on the map to select the shelter location</p>
              
              <div className="bg-gray-100 rounded-xl p-4">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '400px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapEvents />
                  {selectedLocation && (
                    <Marker position={[selectedLocation[1], selectedLocation[0]]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">Selected Location</p>
                          <p>Lat: {selectedLocation[1].toFixed(6)}</p>
                          <p>Lng: {selectedLocation[0].toFixed(6)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedLocation ? (
                    <span>
                      Selected: {selectedLocation[1].toFixed(6)}, {selectedLocation[0].toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-orange-600">Click on the map to select location</span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use My Location</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity.total}
                    onChange={(e) => handleNestedInputChange('capacity', 'total', parseInt(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors['capacity.total'] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900`}
                    placeholder="100"
                  />
                </div>
                {errors['capacity.total'] && <p className="mt-1 text-sm text-red-500">{errors['capacity.total']}</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Disaster Types <span className="text-red-500">*</span></h3>
              
              <div className="grid grid-cols-3 gap-2">
                {DISASTER_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleDisasterTypeToggle(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.supports.disasterTypes.includes(type.value)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-900'
                    }`}
                  >
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
              {errors['supports.disasterTypes'] && <p className="mt-1 text-sm text-red-500">{errors['supports.disasterTypes']}</p>}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Features</h3>
              
              <div className="space-y-3">
                {SUPPORT_FEATURES.map(feature => {
                  const Icon = feature.icon;
                  return (
                    <label key={feature.key} className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.supports[feature.key]}
                        onChange={() => handleSupportToggle(feature.key)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <Icon className="w-5 h-5 ml-3 mr-3 text-gray-600" />
                      <span className="font-medium text-gray-700">{feature.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Support</h3>
              
              <div className="space-y-3">
                {SPECIAL_SUPPORTS.map(support => {
                  const Icon = support.icon;
                  return (
                    <label key={support.key} className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.specialSupport[support.key]}
                        onChange={() => handleSpecialSupportToggle(support.key)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <Icon className="w-5 h-5 ml-3 mr-3 text-gray-600" />
                      <span className="font-medium text-gray-700">{support.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
              
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Shelter Name:</span>
                    <p className="font-medium text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Type:</span>
                    <p className="font-medium text-gray-900">{SHELTER_TYPES.find(t => t.value === formData.shelterType)?.label}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">City:</span>
                    <p className="font-medium text-gray-900">{formData.address.city}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Province:</span>
                    <p className="font-medium text-gray-900">{formData.address.province}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium text-gray-900">{formData.contact.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Capacity:</span>
                    <p className="font-medium text-gray-900">{formData.capacity.total} people</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="font-medium text-gray-900">{formData.description}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Disaster Types:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.supports.disasterTypes.map(type => (
                      <span key={type} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {DISASTER_TYPES.find(d => d.value === type)?.label}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Support Features:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SUPPORT_FEATURES.filter(f => formData.supports[f.key]).map(feature => (
                      <span key={feature.key} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {feature.label}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Special Support:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {SPECIAL_SUPPORTS.filter(s => formData.specialSupport[s.key]).map(support => (
                      <span key={support.key} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {support.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-[3rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-8 text-white flex-shrink-0 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-75"></div>
              <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-150"></div>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-xl">
                  <Home className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Create New Shelter</h2>
                  <p className="text-white/80 text-sm font-medium">Add a new emergency shelter to the system</p>
                </div>
              </div>
              
              {autoSaveStatus && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{autoSaveStatus}</span>
                </div>
              )}
            </div>
            
            {/* Enhanced Progress Steps */}
            <div className="flex items-center justify-between mt-8 relative z-10">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 relative ${
                    step <= currentStep
                      ? 'bg-white text-green-600 shadow-lg shadow-white/30 scale-110'
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                    {step === currentStep && (
                      <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-30"></div>
                    )}
                  </div>
                  {step < 5 && (
                    <div className={`flex-1 h-1 mx-3 transition-all duration-500 ${
                      step < currentStep ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-red-700 font-medium">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Auto-save Status */}
            {currentStep === 5 && lastSaved && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-md">
                <div className="flex items-center justify-center">
                  <div className="text-sm text-green-700 font-medium">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {renderStepContent()}
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-6 bg-gradient-to-t from-gray-50 to-white flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600 font-medium">
                  Step {currentStep} of 5
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step <= currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Create Shelter</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ShelterCreationModal;
