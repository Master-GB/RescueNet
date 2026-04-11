import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const SITUATION_STATUSES = [
  { value: 'safe', label: 'Safe', color: 'bg-green-100 text-green-800', icon: '✓' },
  { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
  { value: 'danger', label: 'Danger', color: 'bg-red-100 text-red-800', icon: '🚨' },
  { value: 'monitor', label: 'Monitor', color: 'bg-blue-100 text-blue-800', icon: '👁️' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];

const PROVINCES = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
];

const AreaSituationForm = ({ onClose, onSubmit, isLoading, initialData }) => {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    status: 'safe',
    title: '',
    message: '',
    severity: 'low',
    authority: '',
    region: '',
    affectedAreas: [],
    recommendedActions: [],
    emergencyInstructions: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });

  const [errors, setErrors] = useState({});
  const [newArea, setNewArea] = useState('');
  const [newAction, setNewAction] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        status: initialData.status || 'safe',
        title: initialData.title || '',
        message: initialData.message || '',
        severity: initialData.severity || 'low',
        authority: initialData.authority || '',
        region: initialData.region || '',
        affectedAreas: initialData.affectedAreas || [],
        recommendedActions: initialData.recommendedActions || [],
        emergencyInstructions: initialData.emergencyInstructions || '',
        validFrom: initialData.validFrom
          ? new Date(initialData.validFrom).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        validUntil: initialData.validUntil
          ? new Date(initialData.validUntil).toISOString().split('T')[0]
          : '',
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleAddArea = () => {
    if (newArea.trim()) {
      setFormData(prev => ({
        ...prev,
        affectedAreas: [...prev.affectedAreas, newArea.trim()],
      }));
      setNewArea('');
    }
  };

  const handleRemoveArea = (index) => {
    setFormData(prev => ({
      ...prev,
      affectedAreas: prev.affectedAreas.filter((_, i) => i !== index),
    }));
  };

  const handleAddAction = () => {
    if (newAction.trim()) {
      setFormData(prev => ({
        ...prev,
        recommendedActions: [...prev.recommendedActions, newAction.trim()],
      }));
      setNewAction('');
    }
  };

  const handleRemoveAction = (index) => {
    setFormData(prev => ({
      ...prev,
      recommendedActions: prev.recommendedActions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.severity) newErrors.severity = 'Severity is required';
    if (!formData.authority.trim()) newErrors.authority = 'Authority is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      validFrom: formData.validFrom ? new Date(formData.validFrom) : new Date(),
      validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1300] p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center border-b rounded-t-lg flex-shrink-0">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Area Situation' : 'Create New Area Situation'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-green-700 p-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form - Scrollable content */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Status and Severity Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {SITUATION_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Severity *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 ${
                  errors.severity ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {SEVERITY_LEVELS.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {errors.severity && (
                <p className="text-red-500 text-sm mt-1">{errors.severity}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Flash Flood Warning"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Detailed description of the situation"
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={500}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          {/* Authority and Region Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Authority */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Authority *
              </label>
              <input
                type="text"
                name="authority"
                value={formData.authority}
                onChange={handleInputChange}
                placeholder="e.g., Disaster Management Center"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 ${
                  errors.authority ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {errors.authority && (
                <p className="text-red-500 text-sm mt-1">{errors.authority}</p>
              )}
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Region
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              >
                <option value="">Select Region</option>
                {PROVINCES.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            {/* Valid From */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Valid From
              </label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              />
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Valid Until
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              />
            </div>
          </div>

          {/* Affected Areas */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Affected Areas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                placeholder="Add affected area"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              />
              <button
                type="button"
                onClick={handleAddArea}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.affectedAreas.map((area, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveArea(index)}
                    className="hover:text-blue-900"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Recommended Actions
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAction())}
                placeholder="Add recommended action"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              />
              <button
                type="button"
                onClick={handleAddAction}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.recommendedActions.map((action, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-200"
                >
                  <span className="text-gray-700">{action}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Emergency Instructions
            </label>
            <textarea
              name="emergencyInstructions"
              value={formData.emergencyInstructions}
              onChange={handleInputChange}
              placeholder="Emergency instructions for the public"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
              maxLength={1000}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isEditing ? 'Update' : 'Create'} Situation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaSituationForm;
