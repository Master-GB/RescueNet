import React from 'react';
import { Search, X } from 'lucide-react';

const SITUATION_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'safe', label: 'Safe' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
  { value: 'monitor', label: 'Monitor' },
];

const SEVERITY_LEVELS = [
  { value: '', label: 'All Severities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const PROVINCES = [
  { value: '', label: 'All Regions' },
  { value: 'Western', label: 'Western' },
  { value: 'Central', label: 'Central' },
  { value: 'Southern', label: 'Southern' },
  { value: 'Northern', label: 'Northern' },
  { value: 'Eastern', label: 'Eastern' },
  { value: 'North Western', label: 'North Western' },
  { value: 'North Central', label: 'North Central' },
  { value: 'Uva', label: 'Uva' },
  { value: 'Sabaragamuwa', label: 'Sabaragamuwa' },
];

const AreaSituationFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  isLoading,
}) => {
  const hasActiveFilters = Object.values(filters).some(
    (val) => val !== '' && val !== null
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
        <input
          type="text"
          name="search"
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search by title, message, authority..."
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-gray-800"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Status
          </label>
          <select
            name="status"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-gray-900"
          >
            {SITUATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Severity
          </label>
          <select
            name="severity"
            value={filters.severity || ''}
            onChange={(e) => onFilterChange('severity', e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-gray-900"
          >
            {SEVERITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Region
          </label>
          <select
            name="region"
            value={filters.region || ''}
            onChange={(e) => onFilterChange('region', e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-gray-900"
          >
            {PROVINCES.map((province) => (
              <option key={province.value} value={province.value}>
                {province.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AreaSituationFilters;
