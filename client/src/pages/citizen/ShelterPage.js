import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Navigation, Phone, Star, Filter, Search, Grid, Map, Heart, Car, Users, Shield, Wifi, Baby, Accessibility, AlertCircle, Home, Mail, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationService from '../../services/locationService.js';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
  tooltipAnchor: [1, -34],
});

const SHELTER_TYPES = [
  { value: 'SCHOOL', label: 'School', icon: '🏫' },
  { value: 'TEMPLE', label: 'Temple', icon: '🛕' },
  { value: 'COMMUNITY_HALL', label: 'Community Hall', icon: '🏛️' },
  { value: 'STADIUM', label: 'Stadium', icon: '🏟️' },
  { value: 'GOVERNMENT_BUILDING', label: 'Government Building', icon: '🏢' },
  { value: 'OTHER', label: 'Other', icon: '🏠' },
];

const DISASTER_TYPES = [
  { value: 'FLOOD', label: 'Flood', icon: '💧' },
  { value: 'LANDSLIDE', label: 'Landslide', icon: '⛰️' },
  { value: 'TSUNAMI', label: 'Tsunami', icon: '🌊' },
  { value: 'FIRE', label: 'Fire', icon: '🔥' },
  { value: 'CYCLONE', label: 'Cyclone', icon: '🌪️' },
  { value: 'OTHER', label: 'Other', icon: '⚠️' },
];

const PROVINCES = [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
];

const SUPPORT_FEATURES = [
  { key: 'wheelchairAccess', label: 'Wheelchair Access', icon: Accessibility },
  { key: 'medical', label: 'Medical Support', icon: Shield },
  { key: 'food', label: 'Food Available', icon: Heart },
  { key: 'water', label: 'Water Available', icon: AlertCircle },
  { key: 'power', label: 'Power Available', icon: Wifi },
];

const SPECIAL_SUPPORTS = [
  { key: 'petFriendly', label: 'Pet Friendly', icon: Heart },
  { key: 'childFriendly', label: 'Child Friendly', icon: Baby },
  { key: 'elderlySupport', label: 'Elderly Support', icon: Users },
  { key: 'disabilitySupport', label: 'Disability Support', icon: Accessibility },
  { key: 'pregnancySupport', label: 'Pregnancy Support', icon: Heart },
];

const ShelterPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'nearby'
  const [allShelters, setAllShelters] = useState([]);
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [allSheltersOriginal, setAllSheltersOriginal] = useState([]);
  const [nearbySheltersOriginal, setNearbySheltersOriginal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [savedShelters, setSavedShelters] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [gettingRoute, setGettingRoute] = useState(false);
  const [routeViewMode, setRouteViewMode] = useState(false); // for custom route view
  const [selectedRoute, setSelectedRoute] = useState(null); // for alternative routes
  const [navigationType, setNavigationType] = useState('driving'); // driving, walking, cycling
  const [isNavigating, setIsNavigating] = useState(false); // for in-map navigation mode
  const mapRef = React.useRef(null);

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
    maxDistance: 20, // Default 20km
  });

  const [allFiltersDraft, setAllFiltersDraft] = useState(allFilters);
  const [nearbyFiltersDraft, setNearbyFiltersDraft] = useState(nearbyFilters);

  // Search states for each tab
  const [allSearchTerm, setAllSearchTerm] = useState('');
  const [nearbySearchTerm, setNearbySearchTerm] = useState('');
  const [allSearchTermDraft, setAllSearchTermDraft] = useState('');
  const [nearbySearchTermDraft, setNearbySearchTermDraft] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = (filters) =>
    Object.values(filters).some(
      (v) => v && v !== '' && !(Array.isArray(v) && v.length === 0)
    );

  const areFiltersEqual = (a, b) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      const av = a[key];
      const bv = b[key];
      if (Array.isArray(av) || Array.isArray(bv)) {
        const aa = Array.isArray(av) ? av : [];
        const ba = Array.isArray(bv) ? bv : [];
        if (aa.length !== ba.length) return false;
        for (let i = 0; i < aa.length; i++) {
          if (aa[i] !== ba[i]) return false;
        }
      } else if (String(av ?? '') !== String(bv ?? '')) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    setAllFiltersDraft(allFilters);
    setAllSearchTermDraft(allSearchTerm);
  }, [allFilters, allSearchTerm]);

  useEffect(() => {
    setNearbyFiltersDraft(nearbyFilters);
    setNearbySearchTermDraft(nearbySearchTerm);
  }, [nearbyFilters, nearbySearchTerm]);

  useEffect(() => {
    if (activeTab === 'all') {
      setAllFiltersDraft(allFilters);
      setAllSearchTermDraft(allSearchTerm);
    } else {
      setNearbyFiltersDraft(nearbyFilters);
      setNearbySearchTermDraft(nearbySearchTerm);
    }
  }, [activeTab, allFilters, allSearchTerm, nearbyFilters, nearbySearchTerm]);

  // Statistics
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

  // Statistics based on active tab
  const statistics = activeTab === 'all' ? allStatistics : nearbyStatistics;

  // Filtered shelters based on active tab
  const filteredShelters = activeTab === 'all' ? allShelters : nearbyShelters;

  // Fetch all shelters for "All" tab
  useEffect(() => {
    const fetchAllShelters = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        Object.entries(allFilters).forEach(([key, value]) => {
          if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value);
            }
          }
        });

        const response = await fetch(`/api/shelters/get-list?${params.toString()}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAllSheltersOriginal(result.shelters || []);
            setAllShelters(result.shelters || []);
          } else {
            setError(result.message);
          }
        } else {
          throw new Error('Failed to fetch shelters');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllShelters();
  }, [allFilters]);

  // Fetch nearby shelters for "Nearby" tab
  useEffect(() => {
    const fetchNearbyShelters = async () => {
      if (!currentLocation) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        Object.entries(nearbyFilters).forEach(([key, value]) => {
          if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value);
            }
          }
        });

        const { lat, lng } = currentLocation;
        const response = await fetch(`/api/shelters/get-nearby?lat=${lat}&lng=${lng}&radiusKm=${nearbyFilters.maxDistance}&${params.toString()}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setNearbySheltersOriginal(result.shelters || []);
            setNearbyShelters(result.shelters || []);
          } else {
            setError(result.message);
          }
        } else {
          throw new Error('Failed to fetch nearby shelters');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyShelters();
  }, [currentLocation, nearbyFilters.maxDistance]);

  // Subscribe to location updates
  useEffect(() => {
    const unsubscribe = locationService.subscribe((location) => {
      setCurrentLocation(location);
    });

    if (!locationService.getLocation()) {
      locationService.getCurrentLocation();
    } else {
      setCurrentLocation(locationService.getLocation());
    }

    return unsubscribe;
  }, []);

  // Load saved shelters from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedShelters') || '[]');
    setSavedShelters(saved);
  }, []);

  // Auto-apply search term when draft changes (for immediate search experience)
  useEffect(() => {
    if (activeTab === 'all') {
      setAllSearchTerm(allSearchTermDraft);
    } else {
      setNearbySearchTerm(nearbySearchTermDraft);
    }
  }, [allSearchTermDraft, nearbySearchTermDraft, activeTab]);

  // Apply search and filters based on active tab
  useEffect(() => {
    let filtered = activeTab === 'all' ? allSheltersOriginal : nearbySheltersOriginal;
    const searchTerm = activeTab === 'all' ? allSearchTerm : nearbySearchTerm;
    const filters = activeTab === 'all' ? allFilters : nearbyFilters;
    
    console.log('Filtering - Active Tab:', activeTab);
    console.log('Filtering - Original Data Count:', filtered.length);
    console.log('Filtering - Search Term:', searchTerm);
    console.log('Filtering - Filters:', filters);
    
    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(shelter =>
        shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.address?.province?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(shelter => shelter.status === filters.status);
    }
    if (filters.shelterType) {
      filtered = filtered.filter(shelter => shelter.shelterType === filters.shelterType);
    }
    if (filters.province) {
      filtered = filtered.filter(shelter => shelter.address?.province === filters.province);
    }
    if (filters.city) {
      filtered = filtered.filter(shelter => shelter.address?.city?.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.disasterTypes && filters.disasterTypes.length > 0) {
      console.log('Disaster Types Filter Applied:', filters.disasterTypes);
      filtered = filtered.filter(shelter => {
        console.log('Shelter disaster types:', shelter.supports?.disasterTypes);
        return filters.disasterTypes.some(type => shelter.supports?.disasterTypes?.includes(type))
      });
      console.log('After disaster type filter count:', filtered.length);
    }
    if (filters.hasFood === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.food === true);
    }
    if (filters.hasWater === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.water === true);
    }
    if (filters.hasMedical === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.medical === true);
    }
    if (filters.hasElectricity === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.electricity === true);
    }
    if (filters.hasWifi === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.wifi === true);
    }
    if (filters.hasParking === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.parking === true);
    }
    if (filters.hasPetFriendly === 'true') {
      filtered = filtered.filter(shelter => shelter.specialSupport?.petFriendly === true);
    }
    if (filters.hasAccessibility === 'true') {
      filtered = filtered.filter(shelter => shelter.specialSupport?.accessibility === true);
    }
    if (filters.hasChildCare === 'true') {
      filtered = filtered.filter(shelter => shelter.specialSupport?.childCare === true);
    }

    console.log('Filtering - Final Filtered Count:', filtered.length);

    // Update the appropriate shelter list
    if (activeTab === 'all') {
      setAllShelters(filtered);
    } else {
      setNearbyShelters(filtered);
    }
  }, [allSheltersOriginal, nearbySheltersOriginal, allSearchTerm, nearbySearchTerm, allFilters, nearbyFilters, activeTab]);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get capacity color
  const getCapacityColor = (shelter) => {
    if (shelter.status?.toLowerCase() === 'closed') return '#EF4444';
    if (shelter.status?.toLowerCase() === 'full') return '#EAB308';
    if (!shelter.occupancy?.current || !shelter.capacity?.total) return '#22C55E';
    
    const percentage = (shelter.occupancy?.current / shelter.capacity.total) * 100;
    if (percentage >= 90) return '#EAB308';
    return '#22C55E';
  };

  // Create custom icon for shelters
  const createShelterIcon = (shelter) => {
    const color = getCapacityColor(shelter);
    const percentage = shelter.occupancy?.current && shelter.capacity?.total 
      ? Math.round((shelter.occupancy.current / shelter.capacity.total) * 100)
      : 0;

    return L.divIcon({
      className: 'custom-shelter-marker',
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="12" width="12" height="10" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="1.5"/>
            <path d="M3 12L12 3L21 12" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="1.5"/>
            <path d="M9 20V14H15V20" 
                  fill="white" 
                  opacity="0.8"/>
            <rect x="10" y="15" width="4" height="7" 
                  fill="white" 
                  opacity="0.8"/>
            <rect x="7.5" y="14" width="2" height="2" 
                  fill="white" 
                  opacity="0.6"/>
            <rect x="14.5" y="14" width="2" height="2" 
                  fill="white" 
                  opacity="0.6"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  // Filter handlers for each tab
  const handleAllFilterChange = (key, value) => {
    setAllFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNearbyFilterChange = (key, value) => {
    setNearbyFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAllFilterDraftChange = (key, value) => {
    setAllFiltersDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleNearbyFilterDraftChange = (key, value) => {
    setNearbyFiltersDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleAllSearchTermDraftChange = (value) => {
    setAllSearchTermDraft(value);
  };

  const handleNearbySearchTermDraftChange = (value) => {
    setNearbySearchTermDraft(value);
  };

  const handleAllDisasterTypeChange = (type) => {
    setAllFilters(prev => ({
      ...prev,
      disasterTypes: prev.disasterTypes.includes(type)
        ? prev.disasterTypes.filter(t => t !== type)
        : [...prev.disasterTypes, type]
    }));
  };

  const handleNearbyDisasterTypeChange = (type) => {
    setNearbyFilters(prev => ({
      ...prev,
      disasterTypes: prev.disasterTypes.includes(type)
        ? prev.disasterTypes.filter(t => t !== type)
        : [...prev.disasterTypes, type]
    }));
  };

  const handleAllDisasterTypeDraftChange = (type) => {
    setAllFiltersDraft(prev => ({
      ...prev,
      disasterTypes: prev.disasterTypes.includes(type)
        ? prev.disasterTypes.filter(t => t !== type)
        : [...prev.disasterTypes, type]
    }));
  };

  const handleNearbyDisasterTypeDraftChange = (type) => {
    setNearbyFiltersDraft(prev => ({
      ...prev,
      disasterTypes: prev.disasterTypes.includes(type)
        ? prev.disasterTypes.filter(t => t !== type)
        : [...prev.disasterTypes, type]
    }));
  };

  const clearAllFilters = () => {
    setAllFilters({
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
    setAllSearchTerm('');
  };

  const clearNearbyFilters = () => {
    setNearbyFilters({
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
      maxDistance: 20,
    });
    setNearbySearchTerm('');
  };

  // Applied vs Draft values (Draft is used for UI; Applied drives actual filtering/fetching)
  const currentFiltersApplied = activeTab === 'all' ? allFilters : nearbyFilters;
  const currentSearchTermApplied = activeTab === 'all' ? allSearchTerm : nearbySearchTerm;
  const currentFiltersDraft = activeTab === 'all' ? allFiltersDraft : nearbyFiltersDraft;
  const currentSearchTermDraft = activeTab === 'all' ? allSearchTermDraft : nearbySearchTermDraft;

  const setCurrentSearchTermDraft = activeTab === 'all' ? setAllSearchTermDraft : setNearbySearchTermDraft;
  const setCurrentFiltersDraft = activeTab === 'all' ? setAllFiltersDraft : setNearbyFiltersDraft;
  const handleFilterDraftChange = activeTab === 'all' ? handleAllFilterDraftChange : handleNearbyFilterDraftChange;
  const handleDisasterTypeDraftChange = activeTab === 'all' ? handleAllDisasterTypeDraftChange : handleNearbyDisasterTypeDraftChange;
  const handleSearchTermDraftChange = activeTab === 'all' ? handleAllSearchTermDraftChange : handleNearbySearchTermDraftChange;

  const applyCurrentDraft = () => {
    if (activeTab === 'all') {
      setAllFilters(allFiltersDraft);
      setAllSearchTerm(allSearchTermDraft);
    } else {
      setNearbyFilters(nearbyFiltersDraft);
      setNearbySearchTerm(nearbySearchTermDraft);
    }
  };

  const resetCurrentDraft = () => {
    if (activeTab === 'all') {
      setAllFiltersDraft(allFilters);
      setAllSearchTermDraft(allSearchTerm);
    } else {
      setNearbyFiltersDraft(nearbyFilters);
      setNearbySearchTermDraft(nearbySearchTerm);
    }
  };

  const clearApplied = () => {
    if (activeTab === 'all') {
      clearAllFilters();
    } else {
      clearNearbyFilters();
    }
  };

  const hasApplied =
    hasActiveFilters(currentFiltersApplied) ||
    (currentSearchTermApplied && currentSearchTermApplied.trim() !== '');

  const isDirty =
    !areFiltersEqual(currentFiltersDraft, currentFiltersApplied) ||
    String(currentSearchTermDraft ?? '') !== String(currentSearchTermApplied ?? '');

  // Draft handlers
  const handleFilter = (key, value) => {
    handleFilterDraftChange(key, value);
  };

  const handleDisasterType = (type) => {
    handleDisasterTypeDraftChange(type);
  };

  // Save/unsave shelter
  const toggleSaveShelter = (shelterId) => {
    const saved = JSON.parse(localStorage.getItem('savedShelters') || '[]');
    if (saved.includes(shelterId)) {
      const newSaved = saved.filter(id => id !== shelterId);
      localStorage.setItem('savedShelters', JSON.stringify(newSaved));
      setSavedShelters(newSaved);
    } else {
      const newSaved = [...saved, shelterId];
      localStorage.setItem('savedShelters', JSON.stringify(newSaved));
      setSavedShelters(newSaved);
    }
  };

  // Get route to shelter
  const getRouteToShelter = async (shelter) => {
    if (!currentLocation || !shelter?.location?.coordinates) {
      console.error('No location data available');
      return;
    }

    try {
      setGettingRoute(true);
      setRouteInfo(null);

      const [fromLng, fromLat] = [currentLocation.lng, currentLocation.lat];
      const [toLng, toLat] = shelter.location.coordinates;

      // Use backend geo API for routing
      const response = await fetch(
        `/api/geo/route?fromLng=${fromLng}&fromLat=${fromLat}&toLng=${toLng}&toLat=${toLat}&profile=${navigationType}&alternatives=true`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.routes && result.data.routes.length > 0) {
          const route = result.data.routes[0];
          setRouteInfo({
            shelter,
            route: route,
            distance: route.distance, // in meters
            duration: route.duration, // in seconds
            alternatives: result.data.routes.slice(1), // alternative routes
            geometry: route.geometry // route geometry for drawing on map
          });
          setSelectedRoute(route); // select the main route
          setRouteViewMode(true); // open route view
          console.log('Route calculated successfully:', route);
        } else {
          console.error('No routes found');
          // Show a simple fallback with direct distance
          const distance = calculateDistance(fromLat, fromLng, toLat, toLat) * 1000; // convert to meters
          setRouteInfo({
            shelter,
            route: null,
            distance: distance,
            duration: Math.round(distance / 50), // rough estimate: 50km/h average
            alternatives: [],
            geometry: null
          });
          setRouteViewMode(true); // still open route view with fallback
        }
      } else {
        throw new Error('Failed to fetch route');
      }
    } catch (err) {
      console.error('Failed to get route:', err);
      // Show a simple fallback with direct distance
      const [fromLng, fromLat] = [currentLocation.lng, currentLocation.lat];
      const [toLng, toLat] = shelter.location.coordinates;
      const distance = calculateDistance(fromLat, fromLng, toLat, toLat) * 1000; // convert to meters
      setRouteInfo({
        shelter,
        route: null,
        distance: distance,
        duration: Math.round(distance / 50), // rough estimate: 50km/h average
        alternatives: [],
        geometry: null
      });
      setRouteViewMode(true); // still open route view with fallback
    } finally {
      setGettingRoute(false);
    }
  };

  // Start navigation to shelter (in-map)
  const startNavigation = (shelter) => {
    if (!shelter?.location?.coordinates || !currentLocation) return;

    // Enable in-map navigation mode
    setIsNavigating(true);
    
    // Keep route view open and show navigation on it
    // Don't close route view - let user see the route on the route view map
    
    console.log('In-map navigation started for:', shelter.name);
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setRouteInfo(null);
    setSelectedRoute(null);
  };
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (currentLocation) {
        map.setView([currentLocation.lat, currentLocation.lng], 8);
      }
    }, [currentLocation, map]);

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          {/* Loading Animation */}
          <div className="relative inline-flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-100 border-t-green-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600 animate-pulse" />
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="mt-8 space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">Loading Emergency Shelters</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Fetching shelter data and availability...
            </p>
          </div>
          
          {/* Loading Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to Load Shelters</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm  z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Emergency Shelters
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">Find safe havens near you</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-2xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'map' 
                      ? 'bg-white text-green-600 shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Map className="w-5 h-5" />
                  <span className="hidden sm:inline">Map View</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                  <span className="hidden sm:inline">List View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-5 py-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all duration-200 border border-gray-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>All Shelters</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                {allStatistics.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('nearby')}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all duration-200 border border-gray-300 ${
                activeTab === 'nearby'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Navigation className="w-5 h-5" />
              <span>Nearby Shelters</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                {nearbyStatistics.total}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-1 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">{statistics.total}</span>
                <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total</div>
              </div>
            </div>
            <div className="text-sm sm:text-base font-semibold text-gray-700">Total Shelters</div>
          </div>
          
          <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl sm:text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300">{statistics.open}</span>
                <div className="text-xs sm:text-sm font-medium text-green-600 uppercase tracking-wide">Available</div>
              </div>
            </div>
            <div className="text-sm sm:text-base font-semibold text-gray-700">Available Shelters</div>
          </div>
          
          <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl sm:text-3xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300">{statistics.full}</span>
                <div className="text-xs sm:text-sm font-medium text-yellow-600 uppercase tracking-wide">Full</div>
              </div>
            </div>
            <div className="text-sm sm:text-base font-semibold text-gray-700">Full Shelters</div>
          </div>
          
          <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl sm:text-3xl font-bold text-red-600 group-hover:text-red-700 transition-colors duration-300">{statistics.closed}</span>
                <div className="text-xs sm:text-sm font-medium text-red-600 uppercase tracking-wide">Closed</div>
              </div>
            </div>
            <div className="text-sm sm:text-base font-semibold text-gray-700">Closed Shelters</div>
          </div>
          
          <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl sm:text-3xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors duration-300">{statistics.availableCapacity}</span>
                <div className="text-xs sm:text-sm font-medium text-purple-600 uppercase tracking-wide">Beds</div>
              </div>
            </div>
            <div className="text-sm sm:text-base font-semibold text-gray-700">Available Beds</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl px-8 py-3 border border-gray-200/50 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-7 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'all' ? 'all shelters' : 'nearby shelters'} by name, city, or province...`}
                value={currentSearchTermDraft}
                onChange={(e) => handleSearchTermDraftChange(e.target.value)}
                className="w-full pl-14 pr-6 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-lg"
              />
            </div>
            <button
              onClick={() => {
                setShowFilters(!showFilters);
                if (!showFilters) {
                  setCurrentFiltersDraft(currentFiltersDraft);
                }
              }}
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
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg"></div>
                ) : hasApplied ? (
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg"></div>
                ) : null}
              </div>
              <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${showFilters ? 'ring-4 ring-green-200/50 ring-offset-2' : ''}`}></div>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-8 rounded-3xl border border-gray-200/60 bg-white/70 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="p-6 sm:p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200/70">Basic Filters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <select 
                        value={currentFiltersDraft.status} 
                        onChange={(e) => handleFilter('status', e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      >
                        <option value="">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="FULL">Full</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-gray-700">Shelter Type</label>
                      <select 
                        value={currentFiltersDraft.shelterType} 
                        onChange={(e) => handleFilter('shelterType', e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      >
                        <option value="">All Types</option>
                        {SHELTER_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-gray-700">Province</label>
                      <select 
                        value={currentFiltersDraft.province} 
                        onChange={(e) => handleFilter('province', e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      >
                        <option value="">All Provinces</option>
                        {PROVINCES.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={currentFiltersDraft.city}
                        onChange={(e) => handleFilter('city', e.target.value)}
                        placeholder="Enter city name"
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Distance Filter for Nearby Tab */}
                {activeTab === 'nearby' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200/70">Distance Range</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <label className="text-sm font-medium text-gray-700">Max Distance:</label>
                      <select 
                        value={currentFiltersDraft.maxDistance} 
                        onChange={(e) => handleFilter('maxDistance', e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      >
                        <option value="5">5 km</option>
                        <option value="10">10 km</option>
                        <option value="20">20 km</option>
                        <option value="50">50 km</option>
                        <option value="100">100 km</option>
                      </select>
                      <span className="text-sm text-gray-600">from your current location</span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200/70">Support Disaster Types</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {DISASTER_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleDisasterType(type.value)}
                        className={`flex flex-col items-center space-y-2 p-3 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                          currentFiltersDraft.disasterTypes.includes(type.value) 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 hover:border-green-300 bg-white'
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200/70">Support Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUPPORT_FEATURES.map(feature => (
                      <div key={feature.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center space-x-3">
                          <feature.icon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                        </div>
                        <button
                          onClick={() => handleFilter(feature.key, currentFiltersDraft[feature.key] === 'true' ? '' : 'true')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            currentFiltersDraft[feature.key] === 'true' ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            currentFiltersDraft[feature.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200/70">Special Support</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SPECIAL_SUPPORTS.map(support => (
                      <div key={support.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center space-x-3">
                          <support.icon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{support.label}</span>
                        </div>
                        <button
                          onClick={() => handleFilter(support.key, currentFiltersDraft[support.key] === 'true' ? '' : 'true')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            currentFiltersDraft[support.key] === 'true' ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            currentFiltersDraft[support.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={resetCurrentDraft}
                    disabled={!isDirty}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isDirty
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Reset
                  </button>
                  <button
                    onClick={clearApplied}
                    className="px-6 py-3 rounded-lg font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyCurrentDraft}
                    disabled={!isDirty}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isDirty
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Main Content */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 ${viewMode}`}>
          {viewMode === 'map' ? (
            /* Map View */
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl ring-2 ring-gray-300/60 overflow-hidden border-2 border-gray-200/80">
                <div className="relative">
                  <MapContainer
                    center={[currentLocation?.lat || 7.5, currentLocation?.lng || 80.5]}
                    zoom={8}
                    style={{ height: '600px', width: '100%' }}
                    ref={mapRef}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapController />
                    
                    {/* Map Control Buttons */}
                    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setView([currentLocation?.lat || 7.5, currentLocation?.lng || 80.5], 8);
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Reset View"
                      >
                        <Grid className="w-4 h-4" />
                        Reset View
                      </button>
                      <button
                        onClick={() => {
                          if (mapRef.current && currentLocation) {
                            mapRef.current.setView([currentLocation.lat, currentLocation.lng], 12);
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Center Map"
                      >
                        <Navigation className="w-4 h-4" />
                        Center Map
                      </button>
                      <button
                        onClick={() => {
                          const mapContainer = mapRef.current?.getContainer();
                          if (mapContainer) {
                            if (!document.fullscreenElement) {
                              mapContainer.requestFullscreen().catch(err => {
                                console.log(`Error attempting to enable fullscreen: ${err.message}`);
                              });
                            } else {
                              document.exitFullscreen();
                            }
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Toggle Fullscreen"
                      >
                        <Camera className="w-4 h-4" />
                        Fullscreen
                      </button>
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            const currentZoom = mapRef.current.getZoom();
                            mapRef.current.setView([currentLocation?.lat || 7.5, currentLocation?.lng || 80.5], currentZoom);
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Recenter at Current Zoom"
                      >
                        <MapPin className="w-4 h-4" />
                        Recenter
                      </button>
                    </div>
                  
                  {/* Navigation Bar (shown when navigating) */}
          {isNavigating && routeInfo && (
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-gray-200/60 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-5 h-5 text-green-700" />
                    <span className="font-semibold text-gray-900">Navigating to {routeInfo.shelter.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {(routeInfo.distance / 1000).toFixed(1)} km • {Math.round(routeInfo.duration / 60)} min
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      const phoneNumber = routeInfo.shelter.contact?.phone;
                      if (phoneNumber) {
                        window.open(`tel:${phoneNumber}`, '_blank');
                      }
                    }}
                    className="px-4 py-2 bg-white text-gray-800 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2 shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </button>
                  <button 
                    onClick={stopNavigation}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-sm"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          )}

                  {/* Current Location Marker */}
                  {currentLocation && (
                    <Marker
                      position={[currentLocation.lat, currentLocation.lng]}
                      icon={L.icon({
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        shadowSize: [41, 41],
                        shadowAnchor: [12, 41],
                        popupAnchor: [1, -34],
                      })}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong>Your Location</strong>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Route Line (shown when navigating) */}
                  {isNavigating && routeInfo && routeInfo.geometry && (
                    <Polyline
                      positions={routeInfo.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                      color="#16a34a"
                      weight={4}
                      opacity={0.7}
                    />
                  )}

                  {/* Shelter Markers */}
                  {filteredShelters.map((shelter) => {
                    const [lng, lat] = shelter.location.coordinates;
                    const isSaved = savedShelters.includes(shelter._id);
                    
                    return (
                      <Marker
                        key={shelter._id}
                        position={[lat, lng]}
                        icon={createShelterIcon(shelter)}
                      >
                        <Popup>
                        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl ring-1 ring-gray-200/60 min-w-[260px] max-w-[320px]">
                          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/70">
                            <strong className="text-gray-900">{shelter.name}</strong>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveShelter(shelter._id);
                              }}
                              className={`p-2 rounded-xl hover:bg-gray-100 transition-colors ${isSaved ? 'text-yellow-500' : 'text-gray-400'}`}
                            >
                              <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Status:</span>
                              <span className={`font-medium ${
                                shelter.status === 'OPEN' ? 'text-green-600' :
                                shelter.status === 'FULL' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {shelter.status || 'OPEN'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Capacity:</span>
                              <span className="font-medium text-gray-900">
                                {shelter.occupancy?.current || 0}/{shelter.capacity?.total || 0}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium text-gray-900">{shelter.shelterType?.replace('_', ' ') || 'OTHER'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium text-gray-900">{shelter.contact?.phone || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShelter(shelter);
                                // Close popup by triggering map click
                                const mapContainer = e.target.closest('.leaflet-popup-content');
                                if (mapContainer) {
                                  const closeButton = mapContainer.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button');
                                  if (closeButton) closeButton.click();
                                }
                              }}
                              className="flex-1 px-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold shadow-sm"
                            >
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                getRouteToShelter(shelter);
                                // Close popup by triggering map click
                                const mapContainer = e.target.closest('.leaflet-popup-content');
                                if (mapContainer) {
                                  const closeButton = mapContainer.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button');
                                  if (closeButton) closeButton.click();
                                }
                              }}
                              className="flex-1 px-1 py-2 bg-white text-gray-900 text-sm rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors font-semibold flex items-center justify-center gap-1 shadow-sm"
                              disabled={gettingRoute}
                            >
                              <Car className="w-4 h-4" />
                              Get Route
                            </button>
                          </div>
                        </div>
                      </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
                </div>
              </div>

              </div>
          ) : (
            /* List View */
            <div className="space-y-6">
              {/* All Shelters Section */}
              <section>
                <div className="py-5 mb-6 ">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-700" />
                    Shelters Information
                    <span className="text-sm font-normal text-gray-600">
                      ({filteredShelters.length} total)
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredShelters.map((shelter) => {
                      const isSaved = savedShelters.includes(shelter._id);
                      const percentage = shelter.occupancy?.current && shelter.capacity?.total 
                        ? Math.round((shelter.occupancy.current / shelter.capacity.total) * 100)
                        : 0;
                      
                      return (
                        <div key={shelter._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl ring-1 ring-gray-200/60 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                          <div className="flex justify-between items-center p-5 bg-white/70 border-b border-gray-200/60">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">
                                {SHELTER_TYPES.find(t => t.value === shelter.shelterType)?.icon || '🏠'}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {SHELTER_TYPES.find(t => t.value === shelter.shelterType)?.label || 'Other'}
                              </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              shelter.status === 'OPEN' ? 'bg-green-100 text-green-600' :
                              shelter.status === 'FULL' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {shelter.status || 'OPEN'}
                            </div>
                          </div>
                          
                          <div className="p-5 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">{shelter.name}</h3>
                            <p className="text-sm text-gray-600">
                              {shelter.address?.street && `${shelter.address.street}, `}
                              {shelter.address?.city}, {shelter.address?.province}
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">{shelter.description}</p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Capacity</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {shelter.occupancy?.current || 0}/{shelter.capacity?.total || 0}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: getCapacityColor(shelter)
                                  }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {SUPPORT_FEATURES.slice(0, 4).map(feature => (
                                <div 
                                  key={feature.key} 
                                  className={`flex items-center space-x-1 p-2 rounded text-xs font-medium ${
                                    shelter.supports?.[feature.key] 
                                      ? 'bg-green-50 text-green-600' 
                                      : 'bg-gray-50 text-gray-400'
                                  }`}
                                >
                                  <feature.icon className="w-3 h-3" />
                                  <span>{feature.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-5 bg-white/70 border-t border-gray-200/60">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-green-700" />
                              <span className="text-sm font-medium text-gray-900">{shelter.contact?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleSaveShelter(shelter._id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isSaved 
                                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => setSelectedShelter(shelter)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold shadow-sm"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => getRouteToShelter(shelter)}
                                className="p-2 bg-white text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                                disabled={gettingRoute}
                              >
                                <Car className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {filteredShelters.length === 0 && (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeTab === 'all' ? 'No Shelters Found' : 'No Nearby Shelters Found'}
                      </h3>
                      <p className="text-gray-600">
                        {activeTab === 'all' 
                          ? 'Try adjusting your filters or search terms to find more shelters.'
                          : 'Try increasing the distance range or adjusting filters to find nearby shelters.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

        {/* Custom Route View */}
        {routeViewMode && routeInfo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9998]">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl ring-1 ring-white/30">
              <div className="flex justify-between items-center p-5 border-b border-gray-200/70 bg-white/70">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-gray-900">Route to {routeInfo.shelter.name}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{(routeInfo.distance / 1000).toFixed(1)} km</span>
                    <span>•</span>
                    <span>{Math.round(routeInfo.duration / 60)} min</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setRouteViewMode(false);
                    setRouteInfo(null);
                    setSelectedRoute(null);
                  }} 
                  className="text-gray-500 hover:text-gray-900 text-2xl w-10 h-10 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              <div className="flex h-[calc(90vh-80px)]">
                {/* Navigation Bar (shown when navigating) */}
                {isNavigating && (
                  <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-gray-200/60 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Navigation className="w-5 h-5 text-green-700" />
                          <span className="font-semibold text-gray-900">Navigating to {routeInfo.shelter.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {(routeInfo.distance / 1000).toFixed(1)} km • {Math.round(routeInfo.duration / 60)} min
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            const phoneNumber = routeInfo.shelter.contact?.phone;
                            if (phoneNumber) {
                              window.open(`tel:${phoneNumber}`, '_blank');
                            }
                          }}
                          className="px-4 py-2 bg-white text-gray-800 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2 shadow-sm"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                        <button 
                          onClick={() => {
                            stopNavigation();
                            setRouteViewMode(false);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-sm"
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Map Section */}
                <div className="flex-1 relative">
                  <MapContainer
                    center={[currentLocation.lat, currentLocation.lng]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    ref={mapRef}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Map Control Buttons for Navigation Map */}
                    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.setView([currentLocation.lat, currentLocation.lng], 12);
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Reset View"
                      >
                        <Grid className="w-4 h-4" />
                        Reset View
                      </button>
                      <button
                        onClick={() => {
                          if (mapRef.current && currentLocation) {
                            mapRef.current.setView([currentLocation.lat, currentLocation.lng], 14);
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Center Map"
                      >
                        <Navigation className="w-4 h-4" />
                        Center Map
                      </button>
                      <button
                        onClick={() => {
                          const mapContainer = mapRef.current?.getContainer();
                          if (mapContainer) {
                            if (!document.fullscreenElement) {
                              mapContainer.requestFullscreen().catch(err => {
                                console.log(`Error attempting to enable fullscreen: ${err.message}`);
                              });
                            } else {
                              document.exitFullscreen();
                            }
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Toggle Fullscreen"
                      >
                        <Camera className="w-4 h-4" />
                        Fullscreen
                      </button>
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            const currentZoom = mapRef.current.getZoom();
                            mapRef.current.setView([currentLocation.lat, currentLocation.lng], currentZoom);
                          }
                        }}
                        className="px-4 py-2 bg-white/95 backdrop-blur-sm text-gray-700 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl"
                        title="Recenter at Current Zoom"
                      >
                        <MapPin className="w-4 h-4" />
                        Recenter
                      </button>
                    </div>
                    
                    {/* Route Line (shown on route view map) */}
                    {selectedRoute && selectedRoute.geometry && (
                      <Polyline
                        positions={selectedRoute.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                        color="#16a34a"
                        weight={4}
                        opacity={0.7}
                      />
                    )}
                    
                    {/* Current Location Marker */}
                    <Marker position={[currentLocation.lat, currentLocation.lng]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Your Location</strong>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Shelter Marker */}
                    <Marker 
                      position={[routeInfo.shelter.location.coordinates[1], routeInfo.shelter.location.coordinates[0]]}
                      icon={createShelterIcon(routeInfo.shelter)}
                    >
                      <Popup>
                        <div className="text-sm">
                          <strong>{routeInfo.shelter.name}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                
                {/* Route Controls Section */}
                <div className="w-80 bg-white/70 border-l border-gray-200/70 p-5 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Route Alternatives */}
                    {routeInfo.alternatives && routeInfo.alternatives.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Alternative Routes</h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => setSelectedRoute(routeInfo.route)}
                            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              selectedRoute === routeInfo.route
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm'
                                : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            Main Route - {(routeInfo.distance / 1000).toFixed(1)} km, {Math.round(routeInfo.duration / 60)} min
                          </button>
                          {routeInfo.alternatives.map((alt, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedRoute(alt)}
                              className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                selectedRoute === alt
                                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm'
                                  : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              Alternative {index + 1} - {(alt.distance / 1000).toFixed(1)} km, {Math.round(alt.duration / 60)} min
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Start Navigation Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => startNavigation(routeInfo.shelter)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Navigation className="w-5 h-5" />
                        Start Navigation
                      </button>
                      <button 
                        onClick={() => {
                          const phoneNumber = routeInfo.shelter.contact?.phone;
                          if (phoneNumber) {
                            window.open(`tel:${phoneNumber}`, '_blank');
                          }
                        }}
                        className="w-full mt-3 px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-bold flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Phone className="w-5 h-5" />
                        Call Shelter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shelter Detail Modal */}
        {selectedShelter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setSelectedShelter(null)} 
                    className="text-white/80 hover:text-white bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:bg-white/30"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedShelter.name}</h2>
                    <div className="flex items-center space-x-4 text-white/90">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                        selectedShelter.status === 'OPEN' ? 'bg-green-500/30 text-green-100' :
                        selectedShelter.status === 'FULL' ? 'bg-yellow-500/30 text-yellow-100' : 'bg-red-500/30 text-red-100'
                      }`}>
                        {selectedShelter.status || 'OPEN'}
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedShelter.address?.city}, {selectedShelter.address?.province}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-emerald-700" />
                      <span className="text-2xl font-bold text-emerald-900">
                        {selectedShelter.occupancy?.current || 0}
                      </span>
                    </div>
                    <div className="text-sm text-emerald-700 font-medium">Current Occupancy</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-6 h-6 text-green-600" />
                      <span className="text-2xl font-bold text-green-900">
                        {(selectedShelter.capacity?.total || 0) - (selectedShelter.occupancy?.current || 0)}
                      </span>
                    </div>
                    <div className="text-sm text-green-700 font-medium">Available Beds</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <Home className="w-6 h-6 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-900">
                        {SHELTER_TYPES.find(t => t.value === selectedShelter.shelterType)?.icon || '🏠'}
                      </span>
                    </div>
                    <div className="text-sm text-purple-700 font-medium">
                      {SHELTER_TYPES.find(t => t.value === selectedShelter.shelterType)?.label || 'Other'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <Phone className="w-6 h-6 text-orange-600" />
                      <span className="text-lg font-bold text-orange-900">
                        {selectedShelter.contact?.phone || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-orange-700 font-medium">Contact Number</div>
                  </div>
                </div>

                {/* Address & Contact */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Location & Contact
                  </h3>
                  
                  {/* Full Address at Top */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-1">Full Address</div>
                        <div className="text-gray-900 font-medium">
                          {selectedShelter.address?.street && `${selectedShelter.address.street}, `}
                          {selectedShelter.address?.city && `${selectedShelter.address?.city}, `}
                          {selectedShelter.address?.province && `${selectedShelter.address?.province} `}
                          {selectedShelter.address?.postalCode && `${selectedShelter.address?.postalCode}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Phone Number</div>
                          <div className="text-gray-900 font-medium">{selectedShelter.contact?.phone || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Mail className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Email Address</div>
                          <div className="text-gray-900 font-medium">{selectedShelter.contact?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Disaster Types */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-green-600" />
                    Supported Disaster Types
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {selectedShelter.supports?.disasterTypes && selectedShelter.supports.disasterTypes.length > 0 ? (
                      selectedShelter.supports.disasterTypes.map(disasterTypeValue => {
                        const type = DISASTER_TYPES.find(t => t.value === disasterTypeValue);
                        if (!type) return null;
                        return (
                          <div 
                            key={type.value}
                            className="flex flex-col items-center space-y-2 p-4 rounded-xl border-2 border-green-500 bg-green-50 text-green-700 shadow-md transform scale-105 transition-all duration-200"
                          >
                            <span className="text-3xl">{type.icon}</span>
                            <span className="text-xs font-medium text-center">{type.label}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                        No disaster types specified for this shelter
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Support Features */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Support Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SUPPORT_FEATURES.map(feature => (
                      <div 
                        key={feature.key} 
                        className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedShelter.supports?.[feature.key] 
                            ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        <feature.icon className="w-5 h-5" />
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Special Support */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    Special Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SPECIAL_SUPPORTS.map(support => (
                      <div 
                        key={support.key} 
                        className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedShelter.specialSupport?.[support.key] 
                            ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        <support.icon className="w-5 h-5" />
                        <span>{support.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Images */}
                {selectedShelter.images && selectedShelter.images.length > 0 && (
                  <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-green-600" />
                      Gallery
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedShelter.images.map((image, index) => (
                        <div key={index} className="space-y-2 group cursor-pointer">
                          <div className="relative overflow-hidden rounded-xl">
                            <img 
                              src={image.url} 
                              alt={image.caption} 
                              className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          {image.caption && <p className="text-sm text-gray-600 text-center">{image.caption}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-r from-white via-gray-50 to-white border-t border-gray-200 p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => toggleSaveShelter(selectedShelter._id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 w-full sm:w-auto ${
                      savedShelters.includes(selectedShelter._id) 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-md'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${savedShelters.includes(selectedShelter._id) ? 'fill-current' : ''}`} />
                    <span>{savedShelters.includes(selectedShelter._id) ? 'Saved' : 'Save Shelter'}</span>
                  </button>
                  <button
                    onClick={() => {
                      getRouteToShelter(selectedShelter);
                      setSelectedShelter(null);
                    }}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                    disabled={gettingRoute}
                  >
                    <Car className="w-5 h-5" />
                    <span>Get Directions</span>
                  </button>
                  <button
                    onClick={() => window.open(`tel:${selectedShelter.contact?.phone}`)}
                    className="flex items-center space-x-3 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Shelter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShelterPage;
