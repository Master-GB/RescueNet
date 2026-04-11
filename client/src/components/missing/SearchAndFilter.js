import React, { useState } from 'react';
import { 
  X, Filter, Search, Calendar, MapPin, User, ChevronDown,
  Clock, AlertTriangle, Heart, Eye, Sparkles, Zap, Target, TrendingUp
} from 'lucide-react';
import { 
  MISSING_PERSON_STATUS, AGE_GROUPS, GENDER_OPTIONS, TIME_RANGES,
  SEARCH_SORT_OPTIONS
} from '../../constants/missingPersonConstants';
import { useMissingPersonContext } from '../../contexts/MissingPersonContext';

const SearchAndFilter = () => {
  const {
    filters,
    searchTerm,
    updateFilter,
    clearFilters,
    applyFilters,
    searchHistory,
    addToSearchHistory,
    setShowFilters,
  } = useMissingPersonContext();

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    priority: false,
    quickFilters: false,
    time: false,
  });


  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    // Create a copy of filters without sortBy for counting
    const { sortBy: _, ...filtersWithoutSort } = filters;
    Object.entries(filtersWithoutSort).forEach(([key, value]) => {
      if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        count++;
      }
    });
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-100/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
              <p className="text-xs text-green-100">Refine your search</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <div className="px-3 py-1 bg-white/20 rounded-full">
                <span className="text-sm font-medium text-white">
                  {activeFiltersCount} active
                </span>
              </div>
            )}
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-6 space-y-6">
        {/* Basic Filters */}
        <div>
          <button
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900">Basic Information</span>
                <span className="text-xs text-gray-600">Status, Gender & Age</span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                expandedSections.basic ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.basic && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span>Status</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MISSING_PERSON_STATUS.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleFilterChange('status', 
                        filters.status === status.value ? '' : status.value
                      )}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                        filters.status === status.value
                          ? status.value === 'Closed'
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-500 text-white shadow-lg ring-2 ring-purple-300 ring-offset-2'
                            : `bg-gradient-to-r from-${status.color}-500 to-${status.color}-600 border-${status.color}-500 text-white shadow-lg ring-2 ring-${status.color}-300 ring-offset-2`
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md active:shadow-sm'
                      }`}
                    >
                      <span className="font-medium">{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Age Group</span>
                </label>
                <select
                  value={filters.ageGroup || ''}
                  onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all"
                >
                  <option value="">All Ages</option>
                  {AGE_GROUPS.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span>Gender</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((gender) => (
                    <button
                      key={gender.value}
                      onClick={() => handleFilterChange('gender', 
                        filters.gender === gender.value ? '' : gender.value
                      )}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        filters.gender === gender.value
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-lg'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <span className="font-bold">{gender.icon}</span>
                      <span className="text-xs">{gender.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div>
          <button
            onClick={() => toggleSection('priority')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl hover:from-orange-100 hover:to-red-100 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900">Priority Level</span>
                <span className="text-xs text-gray-600">Filter by urgency</span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                expandedSections.priority ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.priority && (
            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl border border-orange-100/50">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleFilterChange('priority', 
                    filters.priority === 'Low' ? '' : 'Low'
                  )}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    filters.priority === 'Low'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Low</div>
                    <div className="text-xs opacity-80">Priority</div>
                  </div>
                </button>
                <button
                  onClick={() => handleFilterChange('priority', 
                    filters.priority === 'Medium' ? '' : 'Medium'
                  )}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    filters.priority === 'Medium'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-500 text-white shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Medium</div>
                    <div className="text-xs opacity-80">Priority</div>
                  </div>
                </button>
                <button
                  onClick={() => handleFilterChange('priority', 
                    filters.priority === 'High' ? '' : 'High'
                  )}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    filters.priority === 'High'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white shadow-lg'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">High</div>
                    <div className="text-xs opacity-80">Priority</div>
                  </div>
                </button>
                <button
                  onClick={() => handleFilterChange('priority', 
                    filters.priority === 'Critical' ? '' : 'Critical'
                  )}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    filters.priority === 'Critical'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 border-red-500 text-white shadow-lg animate-pulse'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">Critical</div>
                    <div className="text-xs opacity-80">Priority</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div>
          <button
            onClick={() => toggleSection('quickFilters')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl hover:from-green-100 hover:to-teal-100 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900">Quick Filters</span>
                <span className="text-xs text-gray-600">Instant filters</span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                expandedSections.quickFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.quickFilters && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50/50 to-teal-50/50 rounded-2xl border border-green-100/50">
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.hasPhoto || false}
                    onChange={(e) => handleFilterChange('hasPhoto', e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                      Has Photo
                    </span>
                    <span className="text-xs text-gray-500">Show only with images</span>
                  </div>
                  {filters.hasPhoto && (
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  )}
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-red-300 transition-all cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.urgentOnly || false}
                    onChange={(e) => handleFilterChange('urgentOnly', e.target.checked)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-700 transition-colors">
                      Critical Priority Only
                    </span>
                    <span className="text-xs text-gray-500">Urgent cases</span>
                  </div>
                  {filters.urgentOnly && (
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  )}
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Time Filters */}
        <div>
          <button
            onClick={() => toggleSection('time')}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl hover:from-green-100 hover:to-teal-100 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900">Time Period</span>
                <span className="text-xs text-gray-600">Filter by date</span>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                expandedSections.time ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSections.time && (
            <div className="mt-4 space-y-4 p-4 bg-gradient-to-r from-green-50/50 to-teal-50/50 rounded-2xl border border-green-100/50">
              {/* Time Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>Missing Since</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleFilterChange('dateRange', 
                        filters.dateRange === range.value ? '' : range.value
                      )}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        filters.dateRange === range.value
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 border-green-500 text-white shadow-lg'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Custom Date Range</span>
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-all"
                    />
                  </div>
                  <div className="flex items-center px-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Recent Searches</span>
              </label>
              <button
                onClick={() => {
                  // Clear search history functionality would go here
                }}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Apply search term
                    addToSearchHistory(term);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-700 rounded-full text-sm hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 border border-indigo-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Apply/Reset Buttons */}
        <div className="flex space-x-3 pt-6 border-t border-gray-200/50">
          <button
            onClick={() => {
              applyFilters();
              setShowFilters(false);
            }}
            className="flex-1 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 p-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold transform hover:scale-105"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
