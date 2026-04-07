import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Grid, List, Plus, Heart, 
  AlertTriangle, Users, TrendingUp, RefreshCw,
  Phone, Mail, MapPin, Calendar, Clock, User, Shield,
  Eye, EyeOff, ChevronDown, X, Menu, Home, ArrowUpDown, Leaf, CheckCircle
} from 'lucide-react';
import { MissingPersonProvider, useMissingPersonContext } from '../../contexts/MissingPersonContext';
import { useMissingPerson } from '../../hooks/useMissingPerson';
import { MISSING_PERSON_STATUS, AGE_GROUPS, GENDER_OPTIONS } from '../../constants/missingPersonConstants';

// Import components (we'll create these next)
import MissingPersonCard from '../../components/missing/MissingPersonCard';
import MissingPersonModal from '../../components/missing/MissingPersonModal';
import SearchAndFilter from '../../components/missing/SearchAndFilter';

const MissingPersonPageContent = () => {
  const {
    filteredPersons,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    selectPerson,
    showDetailModal,
    closeDetailModal,
    showReportModal,
    setShowReportModal,
    sortBy,
    updateFilter,
  } = useMissingPersonContext();

  const { statistics, loadingStats, refresh } = useMissingPerson();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!statistics) return null;
    
    return {
      total: statistics.total || 0,
      missing: statistics.active || 0,
      found: statistics.found || 0,
      closed: statistics.closed || 0,
      thisWeek: statistics.thisWeek || 0,
      thisMonth: statistics.thisMonth || 0,
    };
  }, [statistics]);

  // Status color mapping
  const getStatusColor = (status) => {
    const statusConfig = MISSING_PERSON_STATUS.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Missing Persons
                  </h1>
                  <p className="text-sm text-gray-600 hidden md:block">Help reunite families</p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Report Missing</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-white border border-gray-200 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Report Missing</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Missing</p>
                  <p className="text-2xl font-bold text-red-600">{stats.missing}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Found</p>
                  <p className="text-2xl font-bold text-green-600">{stats.found}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.thisWeek}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.thisMonth}</p>
                </div>
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/60 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, description, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border transition-all ${
                  hasActiveFilters 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                )}
              </button>

              {/* Sort Dropdown - Right next to filter button */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Sort</span>
                </div>
                <select
                  value={sortBy || '-createdAt'}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm text-gray-700 font-medium cursor-pointer"
                >
                  <option value="-createdAt">Most Recent</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="priority">Priority Level</option>
                  <option value="fullName">Name (A-Z)</option>
                  <option value="-fullName">Name (Z-A)</option>
                  <option value="lastSeenDate">Last Seen Date</option>
                  <option value="-lastSeenDate">Last Seen Date (Newest)</option>
                </select>
              </div>

              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={refresh}
                className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {/* This will be populated by the SearchAndFilter component */}
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8">
            <SearchAndFilter />
          </div>
        )}

        {/* Results Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/70">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Search Results
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredPersons.length} person{filteredPersons.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-100 border-t-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading missing persons...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPersons.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No missing persons found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Report a Missing Person
                </button>
              </div>
            </div>
          )}

          {/* Results Grid/List */}
          {!loading && filteredPersons.length > 0 && (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'
                : viewMode === 'list'
                ? 'divide-y divide-gray-200'
                : 'p-6'
            }`}>
              {filteredPersons.map((person) => (
                <MissingPersonCard
                  key={person._id}
                  person={person}
                  viewMode={viewMode}
                  onClick={() => selectPerson(person)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && (
        <MissingPersonModal
          onClose={closeDetailModal}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Report Missing Person</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Report form will be implemented here. This is a placeholder for the missing person report form.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MissingPersonPage = () => {
  return (
    <MissingPersonProvider>
      <MissingPersonPageContent />
    </MissingPersonProvider>
  );
};

export default MissingPersonPage;
