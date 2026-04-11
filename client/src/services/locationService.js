import { calculateDistanceToShelter, formatDistance } from '../utils/distanceUtils.js';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.listeners = [];
    this.loading = false;
  }

  /**
   * Get current location using browser geolocation
   * @returns {Promise<Object>} Current location object
   */
  async getCurrentLocation() {
    if (this.loading) {
      return this.currentLocation;
    }

    this.loading = true;
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      this.currentLocation = {
        lat: latitude,
        lng: longitude,
        accuracy: accuracy,
        timestamp: new Date().toISOString()
      };

      // Notify all listeners
      this.notifyListeners();

      return this.currentLocation;
      
    } catch (err) {
      console.error('Location Error:', err);
      
      // Fallback to Colombo coordinates
      this.currentLocation = {
        lat: 6.927079,
        lng: 79.861243,
        accuracy: null,
        timestamp: new Date().toISOString(),
        isFallback: true
      };

      this.notifyListeners();
      return this.currentLocation;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Subscribe to location updates
   * @param {Function} callback - Callback function called when location updates
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // If we already have location, call callback immediately
    if (this.currentLocation) {
      callback(this.currentLocation);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners about location update
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentLocation);
      } catch (err) {
        console.error('Error in location listener:', err);
      }
    });
  }

  /**
   * Calculate distance from current location to shelter
   * @param {Object} shelter - Shelter object with location.coordinates
   * @returns {string} Formatted distance string
   */
  getDistanceToShelter(shelter) {
    if (!this.currentLocation || !shelter?.location?.coordinates) {
      return 'N/A';
    }

    const distance = calculateDistanceToShelter(this.currentLocation, shelter);
    return formatDistance(distance);
  }

  /**
   * Get current location object
   * @returns {Object|null} Current location
   */
  getLocation() {
    return this.currentLocation;
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;
