import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, User, MapPin, Calendar, Phone, Mail, 
  AlertTriangle, Heart, Shield, Camera, FileText, 
  Plus, Trash2, CheckCircle, AlertCircle
} from 'lucide-react';
import { PRIORITY_LEVELS, GENDER_OPTIONS, PHYSICAL_ATTRIBUTES, SPECIAL_MARKS } from '../../constants/missingPersonConstants';
import missingPersonService from '../../services/missingPersonService';
import useAuth from '../../hooks/useAuth';

const ReportMissingPersonModal = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    age: '',
    gender: '',
    dateMissing: '',
    priority: 'Medium',
    
    // Location
    lastSeenAddress: '',
    lastSeenCity: '',
    
    // Description
    description: '',
    
    // Reporter Information
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    
    // Physical Description
    physicalDescription: {
      height: '',
      weight: '',
      hairColor: '',
      eyeColor: '',
    },
    distinctiveMarks: '',
    clothing: '',
    
    // Medical
    medicalConditions: '',
    
    // Images
    photoUrl: null, // this will hold the cloudinary URL after upload
    selectedFile: null, // this holds the actual file before upload
    previewUrl: null // this holds the local preview URL
  });

  // Special marks state
  const [selectedMarks, setSelectedMarks] = useState([]);

  // Auto-populate contact information from authenticated user
  useEffect(() => {
    if (user) {
      const userName = user.name || profile?.name || user.fullName || user.email || '';
      const userPhone = profile?.phone || user.phone || '';
      const userEmail = user.email || profile?.email || '';
      
      setFormData(prev => ({
        ...prev,
        contactName: userName,
        contactPhone: userPhone,
        contactEmail: userEmail
      }));
    }
  }, [user, profile]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle nested field changes
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle special marks toggle
  const handleMarkToggle = (markKey) => {
    setSelectedMarks(prev => {
      const updated = prev.includes(markKey) 
        ? prev.filter(mark => mark !== markKey)
        : [...prev, markKey];
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        distinctiveMarks: updated.join(', ')
      }));
      
      return updated;
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert(`File ${file.name} is too large. Maximum size is 5MB.`);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert(`File ${file.name} is not an image (JPG/PNG only).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      selectedFile: file,
      previewUrl: preview
    }));
  };

  // Remove image
  const removeImage = () => {
    if (formData.previewUrl) {
      URL.revokeObjectURL(formData.previewUrl);
    }
    setFormData(prev => ({
      ...prev,
      selectedFile: null,
      previewUrl: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Basic Information Validation
      if (!formData.name?.trim()) newErrors.name = 'Name is required';
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.dateMissing) newErrors.dateMissing = 'Date is required';
    }

    if (step === 2) {
      // Location Validation
      if (!formData.lastSeenAddress?.trim()) newErrors.lastSeenAddress = 'Address is required';
      if (!formData.lastSeenCity?.trim()) newErrors.lastSeenCity = 'City is required';
      if (!formData.description?.trim() || formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }
    }

    if (step === 3) {
      // Reporter Validation
      if (!formData.contactName?.trim() || formData.contactName.trim().length < 2) {
        newErrors.contactName = 'Contact name is required (minimum 2 characters)';
      }
      if (!formData.contactPhone?.trim()) {
        newErrors.contactPhone = 'Phone is required';
      } else {
        // Clean phone number and validate 10 digits
        const cleanPhone = formData.contactPhone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          newErrors.contactPhone = 'Phone must be exactly 10 digits';
        }
      }
      if (!formData.contactEmail?.trim()) {
        newErrors.contactEmail = 'Email is required';
      } else {
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Invalid email format';
        }
      }
    }

    if (step === 4) {
      // Physical Description Validation (optional fields, no validation needed)
      // All physical description fields are optional according to backend schema
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = (e) => {
    e?.preventDefault(); // Prevent form submission if called from form
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;

    // Additional validation for required fields
    const requiredFields = [
      'name', 'age', 'gender', 'dateMissing', 'priority',
      'lastSeenAddress', 'lastSeenCity', 'description',
      'contactName', 'contactPhone', 'contactEmail'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      setErrors({ 
        submit: `Missing required fields: ${missingFields.join(', ')}` 
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      let finalPhotoUrl = null;
      
      // Upload image to Cloudinary if one is selected
      if (formData.selectedFile) {
        setErrors({ submit: 'Uploading photo...' }); // temporary loading message
        const uploadData = new FormData();
        uploadData.append('file', formData.selectedFile);
        uploadData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
        
        const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
        if (!cloudName || !process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET) {
           throw new Error('Cloudinary environment variables missing. Please check client/.env');
        }

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          console.error("Cloudinary error response:", errData);
          throw new Error(`Cloudinary Error: ${errData.error?.message || 'Failed to upload image'}`);
        }

        const uploadJson = await uploadRes.json();
        finalPhotoUrl = uploadJson.secure_url;
      }

      setErrors({ submit: 'Submitting report...' }); // temporary loading message
      
      const payload = {
        ...formData,
        photoUrl: finalPhotoUrl,
      };
      // remove temporary files from payload
      delete payload.selectedFile;
      delete payload.previewUrl;

      console.log('Submitting form data:', payload);
      await missingPersonService.reportMissingPerson(payload);
      console.log('Report submitted successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      
      // Check if it's a validation error with specific field errors
      if (error.message && error.message.includes('HTTP 400')) {
        setErrors({ 
          submit: 'Validation failed. Please check all required fields and try again.' 
        });
      } else {
        setErrors({ submit: error.message || 'Failed to submit report' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Step indicators
  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Location', icon: MapPin },
    { id: 3, title: 'Contact', icon: Phone },
    { id: 4, title: 'Physical Description', icon: User },
    { id: 5, title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 relative">
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-blue-400/20 to-purple-400/20"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/20 bg-white/50 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Report Missing Person
              </h2>
              <p className="text-sm text-gray-600">Help us find them</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl hover:bg-white hover:scale-110 transition-all duration-300 border border-white/30"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="relative z-10 p-6 bg-white/30 backdrop-blur-sm border-b border-white/20">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg transform scale-110' 
                        : isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <StepIcon className="w-5 h-5" />
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium transition-colors ${
                      isActive ? 'text-green-600' : isCompleted ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <User className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Information</h3>
                  <p className="text-gray-600">Tell us about the missing person</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter age"
                      min="0"
                      max="150"
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Date Missing <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dateMissing}
                      onChange={(e) => handleInputChange('dateMissing', e.target.value)}
                      max={new Date().toISOString().slice(0, 16)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.dateMissing ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dateMissing && <p className="text-red-500 text-sm mt-1">{errors.dateMissing}</p>}
                  </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Priority Level
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PRIORITY_LEVELS.map(priority => (
                          <button
                            key={priority.value}
                            type="button"
                            onClick={() => handleInputChange('priority', priority.value)}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                              formData.priority === priority.value
                                ? `border-${priority.color}-500 bg-${priority.color}-50 text-${priority.color}-700`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">{priority.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload UI */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Upload Photo (Optional)
                      </label>
                      <div className="mt-2 flex items-center justify-center w-full">
                        {formData.previewUrl ? (
                          <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <img src={formData.previewUrl} alt="Preview" className="w-full h-auto object-cover" />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center py-6">
                              <Camera className="w-10 h-10 text-gray-400 mb-3" />
                              <p className="mb-2 text-sm text-gray-500 font-semibold">
                                Click to upload photo
                              </p>
                              <p className="text-xs text-gray-500">JPG or PNG (Max 5MB)</p>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              className="hidden"
                              accept="image/jpeg, image/png, image/jpg"
                              onChange={handleImageUpload}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Step 2: Location & Description */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Last Seen Location</h3>
                  <p className="text-gray-600">Where and when was the person last seen?</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Last Seen Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastSeenAddress}
                      onChange={(e) => handleInputChange('lastSeenAddress', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.lastSeenAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter address where person was last seen"
                    />
                    {errors.lastSeenAddress && <p className="text-red-500 text-sm mt-1">{errors.lastSeenAddress}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastSeenCity}
                      onChange={(e) => handleInputChange('lastSeenCity', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.lastSeenCity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.lastSeenCity && <p className="text-red-500 text-sm mt-1">{errors.lastSeenCity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Circumstances of Disappearance <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Provide detailed information about the circumstances of disappearance..."
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Phone className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
                  <p className="text-gray-600">How can we reach you?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.contactName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter 10-digit phone number (e.g., 771234567)"
                    />
                    {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all ${
                        errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all"
                      placeholder="Emergency contact person and phone"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Physical Description */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <User className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Physical Description</h3>
                  <p className="text-gray-600">Provide physical characteristics to help identify the person</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      value={formData.physicalDescription.height}
                      onChange={(e) => handleNestedChange('physicalDescription', 'height', e.target.value)}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all border-gray-300"
                      placeholder="e.g., 5'8&quot; or 173 cm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={formData.physicalDescription.weight}
                      onChange={(e) => handleNestedChange('physicalDescription', 'weight', e.target.value)}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all border-gray-300"
                      placeholder="e.g., 70 kg or 154 lbs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Hair Color
                    </label>
                    <input
                      type="text"
                      value={formData.physicalDescription.hairColor}
                      onChange={(e) => handleNestedChange('physicalDescription', 'hairColor', e.target.value)}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all border-gray-300"
                      placeholder="e.g., Black, Brown, Blonde"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Eye Color
                    </label>
                    <input
                      type="text"
                      value={formData.physicalDescription.eyeColor}
                      onChange={(e) => handleNestedChange('physicalDescription', 'eyeColor', e.target.value)}
                      className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all border-gray-300"
                      placeholder="e.g., Brown, Blue, Green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Distinctive Marks
                  </label>
                  <textarea
                    value={formData.distinctiveMarks}
                    onChange={(e) => handleInputChange('distinctiveMarks', e.target.value)}
                    rows={3}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all border-gray-300"
                    placeholder="e.g., scars, tattoos, birthmarks, moles"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Clothing
                  </label>
                  <textarea
                    value={formData.clothing}
                    onChange={(e) => handleInputChange('clothing', e.target.value)}
                    rows={3}
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 transition-all border-gray-300"
                    placeholder="Describe what the person was wearing"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Submit</h3>
                  <p className="text-gray-600">Please review your information before submitting</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Name:</span>
                      <p className="text-gray-900">{formData.name}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Age:</span>
                      <p className="text-gray-900">{formData.age} years</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Gender:</span>
                      <p className="text-gray-900">{formData.gender}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Date Missing:</span>
                      <p className="text-gray-900">{new Date(formData.dateMissing).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Last Seen:</span>
                      <p className="text-gray-900">{formData.lastSeenAddress}, {formData.lastSeenCity}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Priority:</span>
                      <p className="text-gray-900">{formData.priority}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-700">Circumstances:</span>
                      <p className="text-gray-900">{formData.description}</p>
                    </div>
                    
                    {/* Physical Description Section */}
                    {(formData.physicalDescription.height || formData.physicalDescription.weight || 
                      formData.physicalDescription.hairColor || formData.physicalDescription.eyeColor ||
                      formData.distinctiveMarks || formData.clothing) && (
                      <>
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-semibold text-gray-900 mb-2">Physical Description</h5>
                        </div>
                        {formData.physicalDescription.height && (
                          <div>
                            <span className="font-semibold text-gray-700">Height:</span>
                            <p className="text-gray-900">{formData.physicalDescription.height}</p>
                          </div>
                        )}
                        {formData.physicalDescription.weight && (
                          <div>
                            <span className="font-semibold text-gray-700">Weight:</span>
                            <p className="text-gray-900">{formData.physicalDescription.weight}</p>
                          </div>
                        )}
                        {formData.physicalDescription.hairColor && (
                          <div>
                            <span className="font-semibold text-gray-700">Hair Color:</span>
                            <p className="text-gray-900">{formData.physicalDescription.hairColor}</p>
                          </div>
                        )}
                        {formData.physicalDescription.eyeColor && (
                          <div>
                            <span className="font-semibold text-gray-700">Eye Color:</span>
                            <p className="text-gray-900">{formData.physicalDescription.eyeColor}</p>
                          </div>
                        )}
                        {formData.distinctiveMarks && (
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700">Distinctive Marks:</span>
                            <p className="text-gray-900">{formData.distinctiveMarks}</p>
                          </div>
                        )}
                        {formData.clothing && (
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700">Clothing:</span>
                            <p className="text-gray-900">{formData.clothing}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Moved inside form */}
          <div className="relative z-10 p-6 border-t border-white/20 bg-white/50 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={(e) => handleNext(e)}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Remove old footer section - buttons are now inside form */}
      </div>
    </div>
  );
};

export default ReportMissingPersonModal;
