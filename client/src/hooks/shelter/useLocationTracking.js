import { useState, useEffect } from 'react';
import locationService from '../../services/locationService.js';

export const useLocationTracking = () => {
  const [currentLocation, setCurrentLocation] = useState(null);

  // Subscribe to location updates from locationService
  useEffect(() => {
    const unsubscribe = locationService.subscribe((location) => {
      setCurrentLocation(location);
    });

    // Get initial location if available
    if (!locationService.getLocation()) {
      locationService.getCurrentLocation();
    } else {
      setCurrentLocation(locationService.getLocation());
    }

    return unsubscribe;
  }, []);

  // Update current location manually
  const updateLocation = (location) => {
    setCurrentLocation(location);
  };

  // Get current location on demand
  const getCurrentLocation = () => {
    locationService.getCurrentLocation();
  };

  return {
    currentLocation,
    setCurrentLocation,
    updateLocation,
    getCurrentLocation,
  };
};
