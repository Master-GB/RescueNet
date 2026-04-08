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
import DashboardLayout from "../../layouts/DashboardLayout";
import NotificationContainer from '../../components/common/NotificationContainer';
import useAuth from '../../hooks/useAuth';

// Import components (we'll create these next)
import MissingPersonCard from '../../components/missing/MissingPersonCard';
import MissingPersonModal from '../../components/missing/MissingPersonModal';
import MyMissingPersonModal from '../../components/missing/MyMissingPersonModal';
import ReportMissingPersonModal from '../../components/missing/ReportMissingPersonModal';
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
    isDirty,
    hasApplied,
    selectPerson,
    showDetailModal,
    closeDetailModal,
    selectedPerson,
    savedPersons,
    setSavedPersons,
    isPersonSaved,
    showReportModal,
    setShowReportModal,
    sortBy,
    updateFilter,
    applyFilters,
    addNotification
  } = useMissingPersonContext();

  const { statistics, loadingStats, refresh } = useMissingPerson();
  const { user } = useAuth();

  // Success handler for report submission
  const handleReportSuccess = () => {
    // Refresh data to show new report
    refresh();
    // Show success notification
    addNotification({
      type: 'success',
      title: 'Report Submitted',
      message: 'Missing person report has been submitted successfully.'
    });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'saved', 'my'

  // Calculate statistics
  const stats = useMemo(() => {
    if (!statistics) return null;
    
    // Calculate this week and this month based on lastSeenDate
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    
    // Get all persons from filteredPersons to calculate based on lastSeenDate
    let thisWeekCount = 0;
    let thisMonthCount = 0;
    
    if (filteredPersons && filteredPersons.length > 0) {
      filteredPersons.forEach(person => {
        const lastSeenDate = person.lastSeenDate ? new Date(person.lastSeenDate) : null;
        
        if (lastSeenDate) {
          // Check if last seen date is this week
          if (lastSeenDate >= startOfWeek && lastSeenDate <= now) {
            thisWeekCount++;
          }
          
          // Check if last seen date is this month
          if (lastSeenDate >= startOfMonth && lastSeenDate <= now) {
            thisMonthCount++;
          }
        }
      });
    }
    
    return {
      total: statistics.total || 0,
      missing: statistics.active || 0,
      found: statistics.found || 0,
      closed: statistics.closed || 0,
      thisWeek: thisWeekCount, // Calculate based on lastSeenDate
      thisMonth: thisMonthCount, // Calculate based on lastSeenDate
    };
  }, [statistics, filteredPersons]);

  // Status color mapping
  const getStatusColor = (status) => {
    const statusConfig = MISSING_PERSON_STATUS.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  // Filter data based on active tab
  const getTabFilteredData = () => {
    switch (activeTab) {
      case 'saved':
        return filteredPersons.filter(person => savedPersons.includes(person._id || person.id));
      case 'my':
        return filteredPersons.filter(person => {
          const reporterId = person.reporterContact?.email || person.reporterEmail;
          const userId = user?.email;
          return reporterId === userId;
        });
      default:
        return filteredPersons;
    }
  };

  const tabFilteredPersons = getTabFilteredData();
  const tabCounts = {
    all: filteredPersons.length,
    saved: filteredPersons.filter(person => savedPersons.includes(person._id || person.id)).length,
    my: filteredPersons.filter(person => {
      const reporterId = person.reporterContact?.email || person.reporterEmail;
      const userId = user?.email;
      return reporterId === userId;
    }).length
  };

  return (
    <DashboardLayout>
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

      {/* Main Content */}
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
                className={`flex items-center space-x-3 px-7 py-3 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group transform hover:scale-105 active:scale-95 ${
                  showFilters 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-2xl' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 ${showFilters ? 'opacity-100' : ''}`}></div>
                <div className="relative flex items-center space-x-3">
                  <Filter className={`w-6 h-6 transition-all duration-300 ${showFilters ? 'text-white rotate-180' : 'text-gray-700 rotate-0'}`} />
                  <span className={`transition-all duration-300 ${showFilters ? 'text-white' : 'text-gray-700'}`}>Filters</span>
                  {isDirty ? (
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce shadow-lg"></div>
                  ) : hasApplied ? (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg"></div>
                  ) : (
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg"></div>
                  )}
                </div>
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${showFilters ? 'ring-4 ring-green-200/50 ring-offset-2' : ''}`}></div>
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
          {/* Tab Navigation */}
          <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
            <div className="px-6 py-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold transition-all duration-200 border border-gray-300 ${
                    activeTab === 'all'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>All</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    {tabCounts.all}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold transition-all duration-200 border border-gray-300 ${
                    activeTab === 'saved'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Saved</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    {tabCounts.saved}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold transition-all duration-200 border border-gray-300 ${
                    activeTab === 'my'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>My</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    {tabCounts.my}
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-b border-gray-200/70">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'all' ? 'Search Results' : activeTab === 'saved' ? 'Saved Persons' : 'My Missing Persons'}
                </h2>
                <p className="text-sm text-gray-600">
                  {tabFilteredPersons.length} person{tabFilteredPersons.length !== 1 ? 's' : ''} found
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
          {!loading && tabFilteredPersons.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'all' ? 'No missing persons found' : activeTab === 'saved' ? 'No saved persons found' : 'No missing persons found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'all' ? 'Try adjusting your search or filters' : activeTab === 'saved' ? 'Save persons to see them here' : 'You haven\'t reported any missing persons'}
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
          {!loading && tabFilteredPersons.length > 0 && (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'
                : viewMode === 'list'
                ? 'divide-y divide-gray-200'
                : 'p-6'
            }`}>
              {tabFilteredPersons.map((person) => (
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

      {/* Detail Modal - Different modal for different tabs */}
      {showDetailModal && activeTab === 'my' ? (
        <MyMissingPersonModal
          person={selectedPerson}
          onClose={closeDetailModal}
        />
      ) : (
        <MissingPersonModal
          onClose={closeDetailModal}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportMissingPersonModal
          onClose={() => setShowReportModal(false)}
          onSuccess={handleReportSuccess}
        />
      )}
    </div>
    </DashboardLayout>
  );
};

const MissingPersonPage = () => {
  return (
    <MissingPersonProvider>
      <MissingPersonPageContent />
      <NotificationContainer />
    </MissingPersonProvider>
  );
};

export default MissingPersonPage;
