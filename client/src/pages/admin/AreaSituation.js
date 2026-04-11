import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import useAreaSituation from '../../hooks/useAreaSituation';
import AreaSituationFilters from '../../components/admin/AreaSituationFilters';
import AreaSituationTable from '../../components/admin/AreaSituationTable';
import AreaSituationForm from '../../components/admin/AreaSituationForm';
import Toast from '../../components/common/Toast';

const AreaSituation = () => {
  const {
    situations,
    loading,
    error,
    fetchSituations,
    createSituation,
    updateSituation,
    deactivateSituation,
    clearError,
  } = useAreaSituation();

  const [showForm, setShowForm] = useState(false);
  const [editingSituation, setEditingSituation] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    severity: '',
    region: '',
  });
  const [selectedId, setSelectedId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Fetch situations on mount
  useEffect(() => {
    fetchSituations();
  }, [fetchSituations]);

  // Add toast notification
  const addToast = useCallback((type, title, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  // Remove toast notification
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Filter situations based on filters
  const filteredSituations = useMemo(() => {
    let filtered = situations;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (sit) =>
          sit.title?.toLowerCase().includes(searchLower) ||
          sit.message?.toLowerCase().includes(searchLower) ||
          sit.authority?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((sit) => sit.status === filters.status);
    }

    // Severity filter
    if (filters.severity) {
      filtered = filtered.filter((sit) => sit.severity === filters.severity);
    }

    // Region filter
    if (filters.region) {
      filtered = filtered.filter((sit) => sit.region === filters.region);
    }

    return filtered;
  }, [situations, filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      severity: '',
      region: '',
    });
  };

  // Handle create new situation
  const handleCreateNew = () => {
    setEditingSituation(null);
    setShowForm(true);
  };

  // Handle edit situation
  const handleEdit = (situation) => {
    setEditingSituation(situation);
    setShowForm(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSituation(null);
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      let result;
      
      if (editingSituation) {
        // Update existing
        result = await updateSituation(editingSituation.id, formData);
        if (result.success) {
          addToast('success', 'Success', 'Area situation updated successfully');
          handleCloseForm();
        } else {
          addToast('error', 'Error', result.message);
        }
      } else {
        // Create new
        result = await createSituation(formData);
        if (result.success) {
          addToast('success', 'Success', 'Area situation created successfully');
          handleCloseForm();
        } else {
          addToast('error', 'Error', result.message);
        }
      }
    } catch (err) {
      addToast('error', 'Error', err.message || 'Failed to save situation');
    } finally {
      setFormLoading(false);
    }
  };

  
  return (
    <>
      <div className="min-h-screen  p-1">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
                  <AlertTriangle size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Area Situation Management
                  </h1>
                  <p className="text-gray-600">
                    Create, update, and manage area situations and emergency notifications
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Plus size={20} />
                New Situation
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Filters */}
          <AreaSituationFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            isLoading={loading}
          />

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Info className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Situations</p>
                  <p className="text-2xl font-bold text-gray-900">{situations.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Safe Areas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {situations.filter((s) => s.status === 'safe').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Critical Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {situations.filter((s) => s.status === 'danger').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && situations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-600">Loading area situations...</p>
              </div>
            </div>
          ) : (
            /* Table */
            <AreaSituationTable
              situations={filteredSituations}
              onEdit={handleEdit}
              onDeactivate={async (id) => {
                try {
                  const result = await deactivateSituation(id);
                  if (result.success) {
                    addToast('success', 'Success', 'Area situation deactivated successfully');
                    setSelectedId(null);
                  } else {
                    addToast('error', 'Error', result.message);
                  }
                } catch (err) {
                  addToast('error', 'Error', err.message || 'Failed to deactivate situation');
                }
              }}
              isLoading={loading}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
            />
          )}

          {/* Empty State */}
          {!loading && filteredSituations.length === 0 && situations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Situations Match Your Filters
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or clear filters
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AreaSituationForm
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          initialData={editingSituation}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-40 space-y-3 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

export default AreaSituation;
