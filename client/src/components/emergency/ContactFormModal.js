import React, { useState, useEffect } from 'react';
import {
  User, Phone, Mail, MapPin, Edit3, X, CheckCircle, AlertTriangle,
  Briefcase, Heart, Home, UserCircle, Star
} from 'lucide-react';

const ContactFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingContact = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    category: 'personal',
    address: '',
    notes: '',
    isPrimary: false
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'personal', name: 'Personal', icon: UserCircle, color: 'blue' },
    { id: 'medical', name: 'Medical', icon: Heart, color: 'red' },
    { id: 'work', name: 'Work', icon: Briefcase, color: 'purple' },
    { id: 'family', name: 'Family', icon: Home, color: 'green' }
  ];

  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name || '',
        phone: editingContact.phone || '',
        email: editingContact.email || '',
        relationship: editingContact.relationship || '',
        category: editingContact.category || 'personal',
        address: editingContact.address || '',
        notes: editingContact.notes || '',
        isPrimary: editingContact.isPrimary || false
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        category: 'personal',
        address: '',
        notes: '',
        isPrimary: false
      });
    }
    setErrors({});
  }, [editingContact, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Enter contact name"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.phone ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="+94 XX XXX XXXX"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Edit3 className="w-4 h-4 inline mr-1" />
              Relationship *
            </label>
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => handleInputChange('relationship', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                errors.relationship ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="e.g., Family Doctor, Brother, Colleague"
            />
            {errors.relationship && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {errors.relationship}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleInputChange('category', category.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-1 ${
                      formData.category === category.id
                        ? `border-${category.color}-300 bg-${category.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 text-${category.color}-600`} />
                    <span className="text-xs font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
              placeholder="Enter address"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Edit3 className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
              placeholder="Additional notes or instructions"
            />
          </div>

          {/* Primary Contact */}
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <input
              type="checkbox"
              id="isPrimary"
              checked={formData.isPrimary}
              onChange={(e) => handleInputChange('isPrimary', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="isPrimary" className="text-sm text-gray-700 flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              Mark as primary emergency contact
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {editingContact ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                editingContact ? 'Update Contact' : 'Add Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
