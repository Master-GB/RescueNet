import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { DEFAULT_FILTERS, STORAGE_KEYS, AGE_GROUPS } from '../constants/missingPersonConstants';

const MissingPersonContext = createContext(null);

export const useMissingPersonContext = () => {
  const ctx = useContext(MissingPersonContext);
  if (!ctx) {
    throw new Error('useMissingPersonContext must be used within MissingPersonProvider');
  }
  return ctx;
};

// Helper functions for localStorage
const readFilters = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.missingPersonFilters);
    return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : DEFAULT_FILTERS;
  } catch {
    return DEFAULT_FILTERS;
  }
};

const readSearchHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.missingPersonSearchHistory);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const readSavedPersons = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.savedMissingPersons);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const MissingPersonProvider = ({ children }) => {
  // State for missing persons data
  const [missingPersons, setMissingPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for filters and search
  const [filters, setFilters] = useState(() => readFilters());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'

  // State for user preferences
  const [savedPersons, setSavedPersons] = useState(() => readSavedPersons());
  const [searchHistory, setSearchHistory] = useState(() => readSearchHistory());
  const [notifications, setNotifications] = useState([]);

  // State for modal and UI
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter actions
  const updateFilter = useCallback((key, value) => {
    console.log('updateFilter called:', { key, value });
    
    if (key === 'sortBy') {
      // Handle sortBy separately since it's not in the filters object
      console.log('Setting sortBy to:', value);
      setSortBy(value);
    } else {
      // Handle regular filters
      setFilters(prev => {
        const newFilters = { ...prev, [key]: value };
        localStorage.setItem(STORAGE_KEYS.missingPersonFilters, JSON.stringify(newFilters));
        return newFilters;
      });
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSortBy('-createdAt'); // Reset sort to default
    localStorage.setItem(STORAGE_KEYS.missingPersonFilters, JSON.stringify(DEFAULT_FILTERS));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(readFilters());
  }, []);

  // Search actions
  const addToSearchHistory = useCallback((term) => {
    if (!term.trim()) return;
    
    setSearchHistory(prev => {
      const history = [term, ...prev.filter(h => h !== term)].slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.missingPersonSearchHistory, JSON.stringify(history));
      return history;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.setItem(STORAGE_KEYS.missingPersonSearchHistory, JSON.stringify([]));
  }, []);

  // Saved persons actions
  const toggleSavePerson = useCallback((personId) => {
    setSavedPersons(prev => {
      const newSaved = prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId];
      localStorage.setItem(STORAGE_KEYS.savedMissingPersons, JSON.stringify(newSaved));
      return newSaved;
    });
  }, []);

  const isPersonSaved = useCallback((personId) => {
    return savedPersons.includes(personId);
  }, [savedPersons]);

  // Person selection actions
  const selectPerson = useCallback((person) => {
    setSelectedPerson(person);
    setShowDetailModal(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedPerson(null);
  }, []);

  // Notification actions
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper function to format location for searching
  const formatLocationForSearch = (location) => {
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location !== null) {
      const parts = [];
      if (location.address) parts.push(location.address);
      if (location.city) parts.push(location.city);
      if (location.district) parts.push(location.district);
      if (location.province) parts.push(location.province);
      return parts.join(' ');
    }
    return '';
  };

  // Computed values
  const filteredPersons = useMemo(() => {
    console.log('Filtering persons:', {
      totalPersons: missingPersons.length,
      searchTerm,
      filters,
      sortBy
    });

    let filtered = missingPersons.filter(person => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const locationString = formatLocationForSearch(person.lastSeenLocation);
        const matchesSearch = 
          person.fullName?.toLowerCase().includes(searchLower) ||
          person.circumstances?.toLowerCase().includes(searchLower) ||
          locationString.toLowerCase().includes(searchLower) ||
          person.reporterName?.toLowerCase().includes(searchLower) ||
          person.caseNumber?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) {
          return false;
        }
      }

      // Status filter
      if (filters.status && person.status !== filters.status) return false;

      // Gender filter
      if (filters.gender && person.gender !== filters.gender) return false;

      // Age group filter
      if (filters.ageGroup) {
        const ageGroup = AGE_GROUPS.find(ag => ag.value === filters.ageGroup);
        if (ageGroup && (person.age < ageGroup.minAge || person.age > ageGroup.maxAge)) {
          return false;
        }
      }

      // Priority filter
      if (filters.priority && person.priority !== filters.priority) return false;

      // Has photo filter
      if (filters.hasPhoto && !person.photoUrl) {
        return false;
      }

      // Urgent only filter
      if (filters.urgentOnly && person.priority !== 'Critical') {
        return false;
      }

      // Time range filter
      if (filters.dateRange) {
        const now = new Date();
        const lastSeenDate = new Date(person.lastSeenDate);
        let cutoffDate;

        console.log('Time filter:', {
          dateRange: filters.dateRange,
          lastSeenDate: lastSeenDate.toISOString(),
          now: now.toISOString()
        });

        switch (filters.dateRange) {
          case '1h':
            cutoffDate = new Date(now.getTime() - (1 * 60 * 60 * 1000));
            break;
          case '24h':
            cutoffDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            break;
          case '7d':
            cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case '30d':
            cutoffDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
          case '90d':
            cutoffDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
            break;
          default:
            break;
        }

        if (cutoffDate && lastSeenDate < cutoffDate) {
          console.log('Filtered out by time range:', {
            personName: person.fullName,
            lastSeenDate: lastSeenDate.toISOString(),
            cutoffDate: cutoffDate.toISOString()
          });
          return false;
        }
      }

      // Custom date range filter
      if (filters.dateFrom || filters.dateTo) {
        const lastSeenDate = new Date(person.lastSeenDate);
        
        console.log('Custom date filter:', {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          lastSeenDate: lastSeenDate.toISOString()
        });
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0); // Start of day
          if (lastSeenDate < fromDate) {
            console.log('Filtered out by date from:', {
              personName: person.fullName,
              lastSeenDate: lastSeenDate.toISOString(),
              fromDate: fromDate.toISOString()
            });
            return false;
          }
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (lastSeenDate > toDate) {
            console.log('Filtered out by date to:', {
              personName: person.fullName,
              lastSeenDate: lastSeenDate.toISOString(),
              toDate: toDate.toISOString()
            });
            return false;
          }
        }
      }

      return true;
    });

    console.log('Filtered results:', filtered.length);

    // Sort filtered results
    const sorted = filtered.sort((a, b) => {
      console.log('Sorting by:', sortBy, 'for', filtered.length, 'items');
      
      switch (sortBy) {
        case '-createdAt':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'createdAt':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'fullName':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case '-fullName':
          return (b.fullName || '').localeCompare(a.fullName || '');
        case 'lastSeenDate':
          return new Date(a.lastSeenDate || 0) - new Date(b.lastSeenDate || 0);
        case '-lastSeenDate':
          return new Date(b.lastSeenDate || 0) - new Date(a.lastSeenDate || 0);
        default:
          return 0;
      }
    });

    console.log('Sorted results:', sorted.length);
    return sorted;
  }, [missingPersons, searchTerm, filters, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value && value !== '' && !(Array.isArray(value) && value.length === 0)
    ) || searchTerm.trim() !== '';
  }, [filters, searchTerm]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const value = useMemo(() => ({
    // Data state
    missingPersons,
    setMissingPersons,
    selectedPerson,
    loading,
    error,
    setLoading,
    setError,

    // Filter and search state
    filters,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,

    // Filter actions
    updateFilter,
    clearFilters,
    resetFilters,

    // Search actions
    addToSearchHistory,
    searchHistory,
    clearSearchHistory,

    // Saved persons
    savedPersons,
    toggleSavePerson,
    isPersonSaved,

    // Person selection
    selectPerson,
    showDetailModal,
    closeDetailModal,

    // Report modal
    showReportModal,
    setShowReportModal,

    // Notifications
    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,

    // Computed values
    filteredPersons,
    hasActiveFilters,
    unreadNotifications,
  }), [
    missingPersons,
    selectedPerson,
    loading,
    error,
    filters,
    searchTerm,
    sortBy,
    viewMode,
    showFilters,
    searchHistory,
    savedPersons,
    notifications,
    showDetailModal,
    showReportModal,
    filteredPersons,
    hasActiveFilters,
    unreadNotifications,
    updateFilter,
    clearFilters,
    resetFilters,
    addToSearchHistory,
    clearSearchHistory,
    toggleSavePerson,
    isPersonSaved,
    selectPerson,
    closeDetailModal,
    addNotification,
    markNotificationRead,
    clearNotifications,
    setSearchTerm,
    setSortBy,
    setViewMode,
    setShowFilters,
    setShowReportModal,
    setLoading,
    setError,
    setMissingPersons,
  ]);

  return (
    <MissingPersonContext.Provider value={value}>
      {children}
    </MissingPersonContext.Provider>
  );
};
