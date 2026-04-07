import { useContext } from 'react';
import { ShelterContext } from '../../contexts/shelter/ShelterContext';

export const useRouting = (currentLocation) => {
  const {
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
  } = useContext(ShelterContext);

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

  // Start navigation to shelter
  const startNavigation = (shelter) => {
    if (!shelter?.location?.coordinates || !currentLocation) return;

    setIsNavigating(true);
    console.log('In-map navigation started for:', shelter.name);
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setRouteInfo(null);
    setSelectedRoute(null);
  };

  // Close route view
  const closeRouteView = () => {
    setRouteViewMode(false);
    setRouteInfo(null);
    setSelectedRoute(null);
  };

  return {
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
    calculateDistance,
    getRouteToShelter,
    startNavigation,
    stopNavigation,
    closeRouteView,
  };
};
