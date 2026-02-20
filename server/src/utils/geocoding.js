import axios from 'axios';

class GeocodingService {
  constructor() {
    this.apiKey = process.env.OPENCAGE_API_KEY;
    this.baseUrl = 'https://api.opencagedata.com/geocode/v1/json';
  }

  /**
   * Convert address to coordinates (latitude, longitude)
   * @param {string} address - Full address string
   * @returns {Object} - { coordinates: [lng, lat], formattedAddress, city, country }
   */
  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenCage API key is not configured');
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          q: address,
          key: this.apiKey,
          limit: 1
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const { lat, lng } = result.geometry;
        const components = result.components;

        return {
          success: true,
          coordinates: [lng, lat], // [longitude, latitude] for MongoDB
          latitude: lat,
          longitude: lng,
          formattedAddress: result.formatted,
          city: components.city || components.town || components.village || 'Unknown',
          country: components.country || 'Unknown',
          confidence: result.confidence
        };
      } else {
        return {
          success: false,
          error: 'Address not found or invalid'
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to geocode address'
      };
    }
  }

  /**
   * Convert coordinates to address (reverse geocoding)
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Object} - Address details
   */
  async reverseGeocode(latitude, longitude) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenCage API key is not configured');
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          q: `${latitude},${longitude}`,
          key: this.apiKey,
          limit: 1
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        
        return {
          success: true,
          formattedAddress: result.formatted,
          components: result.components
        };
      } else {
        return {
          success: false,
          error: 'Location not found'
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to reverse geocode'
      };
    }
  }

  /**
   * Validate if coordinates are within a specific country
   * @param {number} latitude
   * @param {number} longitude
   * @param {string} expectedCountry
   * @returns {boolean}
   */
  async validateLocation(latitude, longitude, expectedCountry = 'Sri Lanka') {
    try {
      const result = await this.reverseGeocode(latitude, longitude);
      
      if (!result.success) {
        return false;
      }

      return result.components.country && 
             result.components.country.toLowerCase() === expectedCountry.toLowerCase();
    } catch (error) {
      console.error('Location validation error:', error.message);
      return false;
    }
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   * @param {number} lat1
   * @param {number} lon1
   * @param {number} lat2
   * @param {number} lon2
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export default new GeocodingService();