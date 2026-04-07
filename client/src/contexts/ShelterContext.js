import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import  shelterService  from '../services/shelterService.js';

const ShelterContext = createContext();

export const useShelter = () => {
  const context = useContext(ShelterContext);
  if (!context) {
    throw new Error('useShelter must be used within a ShelterProvider');
  }
  return context;
};

export const ShelterProvider = ({ children }) => {
  // Core shelter data
  const [allShelters, setAllShelters] = useState([]);
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [allSheltersOriginal, setAllSheltersOriginal] = useState([]);
  const [nearbySheltersOriginal, setNearbySheltersOriginal] = useState([]);
  const [savedSheltersList, setSavedSheltersList] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'nearby', or 'saved'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  
  // Location state
  const [currentLocation, setCurrentLocation] = useState(null);
  
  // Saved shelters management
  const [savedShelters, setSavedShelters] = useState([]);
  
  // Navigation state
  const [routeInfo, setRouteInfo] = useState(null);
  const [gettingRoute, setGettingRoute] = useState(false);
  const [routeViewMode, setRouteViewMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [navigationType, setNavigationType] = useState('driving');
  const [isNavigating, setIsNavigating] = useState(false);

  // Filter states for each tab
  const [allFilters, setAllFilters] = useState({
    status: '',
    shelterType: '',
    city: '',
    province: '',
    disasterTypes: [],
    wheelchairAccess: '',
    medical: '',
    food: '',
    water: '',
    power: '',
    petFriendly: '',
    childFriendly: '',
    elderlySupport: '',
    disabilitySupport: '',
    pregnancySupport: '',
    verified: 'true',
  });

  const [nearbyFilters, setNearbyFilters] = useState({
    status: '',
    shelterType: '',
    city: '',
    province: '',
    disasterTypes: [],
    wheelchairAccess: '',
    medical: '',
    food: '',
    water: '',
    power: '',
    petFriendly: '',
    childFriendly: '',
    elderlySupport: '',
    disabilitySupport: '',
    pregnancySupport: '',
    verified: 'true',
    maxDistance: 10,
  });

  const [savedFilters, setSavedFilters] = useState({
    status: '',
    shelterType: '',
    city: '',
    province: '',
    disasterTypes: [],
    wheelchairAccess: '',
    medical: '',
    food: '',
    water: '',
    power: '',
    petFriendly: '',
    childFriendly: '',
    elderlySupport: '',
    disabilitySupport: '',
    pregnancySupport: '',
    verified: 'true',
  });

  // Filter draft states
  const [allFiltersDraft, setAllFiltersDraft] = useState(allFilters);
  const [nearbyFiltersDraft, setNearbyFiltersDraft] = useState(nearbyFilters);
  const [savedFiltersDraft, setSavedFiltersDraft] = useState(savedFilters);

  // Search states
  const [allSearchTerm, setAllSearchTerm] = useState('');
  const [nearbySearchTerm, setNearbySearchTerm] = useState('');
  const [savedSearchTerm, setSavedSearchTerm] = useState('');

  // Search draft states
  const [allSearchTermDraft, setAllSearchTermDraft] = useState('');
  const [nearbySearchTermDraft, setNearbySearchTermDraft] = useState('');
  const [savedSearchTermDraft, setSavedSearchTermDraft] = useState('');

  // Load saved shelters from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedShelters') || '[]');
    setSavedShelters(saved);
  }, []);

  // Update saved shelters list when savedShelters IDs or all shelters change
  useEffect(() => {
    if (savedShelters.length > 0 && allSheltersOriginal.length > 0) {
      const savedSheltersData = allSheltersOriginal.filter(shelter => 
        savedShelters.includes(shelter._id)
      );
      setSavedSheltersList(savedSheltersData);
    } else {
      setSavedSheltersList([]);
    }
  }, [savedShelters, allSheltersOriginal]);

  // Fetch all shelters for "All" tab
  const fetchAllShelters = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await shelterService.getAllShelters(allFilters);
      
      if (result.success) {
        setAllShelters(result.data);
        setAllSheltersOriginal(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby shelters for "Nearby" tab
  const fetchNearbyShelters = async () => {
    if (!currentLocation) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [lng, lat] = [currentLocation.lng, currentLocation.lat];
      const result = await shelterService.getNearbyShelters(lat, lng, nearbyFilters);
      
      if (result.success) {
        setNearbyShelters(result.data);
        setNearbySheltersOriginal(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  // Toggle saved shelter
  const toggleSavedShelter = (shelterId) => {
    const saved = [...savedShelters];
    const index = saved.indexOf(shelterId);
    
    if (index > -1) {
      saved.splice(index, 1);
    } else {
      saved.push(shelterId);
    }
    
    setSavedShelters(saved);
    localStorage.setItem('savedShelters', JSON.stringify(saved));
  };

  // Clear all filters for a tab
  const clearAllFilters = () => {
    const clearedFilters = {
      status: '',
      shelterType: '',
      city: '',
      province: '',
      disasterTypes: [],
      wheelchairAccess: '',
      medical: '',
      food: '',
      water: '',
      power: '',
      petFriendly: '',
      childFriendly: '',
      elderlySupport: '',
      disabilitySupport: '',
      pregnancySupport: '',
      verified: 'true',
    };
    setAllFilters(clearedFilters);
    setAllSearchTerm('');
  };

  const clearNearbyFilters = () => {
    const clearedFilters = {
      status: '',
      shelterType: '',
      city: '',
      province: '',
      disasterTypes: [],
      wheelchairAccess: '',
      medical: '',
      food: '',
      water: '',
      power: '',
      petFriendly: '',
      childFriendly: '',
      elderlySupport: '',
      disabilitySupport: '',
      pregnancySupport: '',
      verified: 'true',
      maxDistance: 10,
    };
    setNearbyFilters(clearedFilters);
    setNearbySearchTerm('');
  };

  const clearSavedFilters = () => {
    const clearedFilters = {
      status: '',
      shelterType: '',
      city: '',
      province: '',
      disasterTypes: [],
      wheelchairAccess: '',
      medical: '',
      food: '',
      water: '',
      power: '',
      petFriendly: '',
      childFriendly: '',
      elderlySupport: '',
      disabilitySupport: '',
      pregnancySupport: '',
      verified: 'true',
    };
    setSavedFilters(clearedFilters);
    setSavedSearchTerm('');
  };

  // Statistics calculations
  const allStatistics = useMemo(() => {
    const total = allSheltersOriginal.length;
    const open = allSheltersOriginal.filter(s => s.status === 'OPEN').length;
    const full = allSheltersOriginal.filter(s => s.status === 'FULL').length;
    const closed = allSheltersOriginal.filter(s => s.status === 'CLOSED').length;
    const totalCapacity = allSheltersOriginal.reduce((sum, s) => sum + (s.capacity?.total || 0), 0);
    const currentOccupancy = allSheltersOriginal.reduce((sum, s) => sum + (s.occupancy?.current || 0), 0);
    const availableCapacity = totalCapacity - currentOccupancy;
    
    return { total, open, full, closed, availableCapacity };
  }, [allSheltersOriginal]);

  const nearbyStatistics = useMemo(() => {
    const total = nearbySheltersOriginal.length;
    const open = nearbySheltersOriginal.filter(s => s.status === 'OPEN').length;
    const full = nearbySheltersOriginal.filter(s => s.status === 'FULL').length;
    const closed = nearbySheltersOriginal.filter(s => s.status === 'CLOSED').length;
    const totalCapacity = nearbySheltersOriginal.reduce((sum, s) => sum + (s.capacity?.total || 0), 0);
    const currentOccupancy = nearbySheltersOriginal.reduce((sum, s) => sum + (s.occupancy?.current || 0), 0);
    const availableCapacity = totalCapacity - currentOccupancy;
    
    return { total, open, full, closed, availableCapacity };
  }, [nearbySheltersOriginal]);

  const savedStatistics = useMemo(() => {
    const total = savedSheltersList.length;
    const open = savedSheltersList.filter(s => s.status === 'OPEN').length;
    const full = savedSheltersList.filter(s => s.status === 'FULL').length;
    const closed = savedSheltersList.filter(s => s.status === 'CLOSED').length;
    const totalCapacity = savedSheltersList.reduce((sum, s) => sum + (s.capacity?.total || 0), 0);
    const currentOccupancy = savedSheltersList.reduce((sum, s) => sum + (s.occupancy?.current || 0), 0);
    const availableCapacity = totalCapacity - currentOccupancy;
    
    return { total, open, full, closed, availableCapacity };
  }, [savedSheltersList]);

  const value = {
    // Core data
    allShelters,
    nearbyShelters,
    allSheltersOriginal,
    nearbySheltersOriginal,
    savedSheltersList,
    
    // UI state
    activeTab,
    setActiveTab,
    loading,
    error,
    selectedShelter,
    setSelectedShelter,
    viewMode,
    setViewMode,
    
    // Location
    currentLocation,
    setCurrentLocation,
    getCurrentLocation,
    
    // Saved shelters
    savedShelters,
    toggleSavedShelter,
    
    // Navigation
    routeInfo,
    setRouteInfo,
    gettingRoute,
    setGettingRoute,
    routeViewMode,
    setRouteViewMode,
    selectedRoute,
    setSelectedRoute,
    navigationType,
    setNavigationType,
    isNavigating,
    setIsNavigating,
    
    // Filters
    allFilters,
    setAllFilters,
    nearbyFilters,
    setNearbyFilters,
    savedFilters,
    setSavedFilters,
    allFiltersDraft,
    setAllFiltersDraft,
    nearbyFiltersDraft,
    setNearbyFiltersDraft,
    savedFiltersDraft,
    setSavedFiltersDraft,
    
    // Search
    allSearchTerm,
    setAllSearchTerm,
    nearbySearchTerm,
    setNearbySearchTerm,
    savedSearchTerm,
    setSavedSearchTerm,
    allSearchTermDraft,
    setAllSearchTermDraft,
    nearbySearchTermDraft,
    setNearbySearchTermDraft,
    savedSearchTermDraft,
    setSavedSearchTermDraft,
    
    // Actions
    fetchAllShelters,
    fetchNearbyShelters,
    clearAllFilters,
    clearNearbyFilters,
    clearSavedFilters,
    
    // Statistics
    allStatistics,
    nearbyStatistics,
    savedStatistics,
  };

  return (
    <ShelterContext.Provider value={value}>
      {children}
    </ShelterContext.Provider>
  );
};
