import { API_BASE_URL, ENDPOINTS, HTTP_METHODS, DEFAULT_HEADERS, STATUS_CODES } from '../constants/apiConstants';

class ShelterService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Make HTTP request with error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: { ...DEFAULT_HEADERS, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        status: response.status,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to make request',
        error: error,
      };
    }
  }

  /**
   * Get cache key for request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {string} Cache key
   */
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  /**
   * Get cached data if available and not expired
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached data or null
   */
  getCachedData(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache data
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedData(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get all shelters with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Shelters data
   */
  async getAllShelters(filters = {}) {
    const cacheKey = this.getCacheKey(ENDPOINTS.SHELTERS, filters);
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    
    // Add filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item));
        } else {
          params.append(key, value);
        }
      }
    });

    const endpoint = `${ENDPOINTS.SHELTERS}${params.toString() ? `?${params.toString()}` : ''}`;
    const result = await this.request(endpoint);

    if (result.success) {
      this.setCachedData(cacheKey, result);
    }

    return result;
  }

  /**
   * Get nearby shelters based on location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Nearby shelters data
   */
  async getNearbyShelters(lat, lng, filters = {}) {
    const params = {
      lat,
      lng,
      ...filters,
    };

    const cacheKey = this.getCacheKey(ENDPOINTS.NEARBY_SHELTERS, params);
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${ENDPOINTS.NEARBY_SHELTERS}?${queryString}`;
    const result = await this.request(endpoint);

    if (result.success) {
      this.setCachedData(cacheKey, result);
    }

    return result;
  }

  /**
   * Get shelter by ID
   * @param {string} id - Shelter ID
   * @returns {Promise<Object>} Shelter data
   */
  async getShelterById(id) {
    const cacheKey = this.getCacheKey(ENDPOINTS.SHELTER_BY_ID(id));
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.request(ENDPOINTS.SHELTER_BY_ID(id));

    if (result.success) {
      this.setCachedData(cacheKey, result);
    }

    return result;
  }

  /**
   * Get route between two points
   * @param {number} fromLat - Starting latitude
   * @param {number} fromLng - Starting longitude
   * @param {number} toLat - Destination latitude
   * @param {number} toLng - Destination longitude
   * @param {string} profile - Route profile (driving, walking, cycling)
   * @param {boolean} alternatives - Whether to return alternative routes
   * @returns {Promise<Object>} Route data
   */
  async getRoute(fromLat, fromLng, toLat, toLng, profile = 'driving', alternatives = false) {
    const params = {
      fromLat,
      fromLng,
      toLat,
      toLng,
      profile,
      alternatives: alternatives.toString(),
    };

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${ENDPOINTS.ROUTE}?${queryString}`;
    
    return await this.request(endpoint);
  }

  /**
   * Geocode address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Geocoding data
   */
  async geocode(address) {
    const params = { address };
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${ENDPOINTS.GEOCODE}?${queryString}`;
    
    return await this.request(endpoint);
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Reverse geocoding data
   */
  async reverseGeocode(lat, lng) {
    const params = { lat, lng };
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `${ENDPOINTS.REVERSE_GEOCODE}?${queryString}`;
    
    return await this.request(endpoint);
  }

  /**
   * Search shelters by query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Search results
   */
  async searchShelters(query, filters = {}) {
    const params = {
      q: query,
      ...filters,
    };

    const cacheKey = this.getCacheKey('/shelters/search', params);
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/shelters/search?${queryString}`;
    const result = await this.request(endpoint);

    if (result.success) {
      this.setCachedData(cacheKey, result);
    }

    return result;
  }

  /**
   * Get shelter statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Statistics data
   */
  async getShelterStatistics(filters = {}) {
    const cacheKey = this.getCacheKey('/shelters/statistics', filters);
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const endpoint = `/shelters/statistics${params.toString() ? `?${params.toString()}` : ''}`;
    const result = await this.request(endpoint);

    if (result.success) {
      this.setCachedData(cacheKey, result);
    }

    return result;
  }

  /**
   * Clear cache
   * @param {string} pattern - Optional pattern to match cache keys
   */
  clearCache(pattern = null) {
    if (pattern) {
      // Clear cache entries matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  getCacheSize() {
    return this.cache.size;
  }

  /**
   * Validate shelter data
   * @param {Object} shelter - Shelter object to validate
   * @returns {Object} Validation result
   */
  validateShelter(shelter) {
    const errors = [];
    const required = ['name', 'location', 'capacity', 'status'];

    required.forEach(field => {
      if (!shelter[field]) {
        errors.push(`${field} is required`);
      }
    });

    // Validate location
    if (shelter.location && (!shelter.location.coordinates || shelter.location.coordinates.length !== 2)) {
      errors.push('Valid location coordinates are required');
    }

    // Validate capacity
    if (shelter.capacity && (typeof shelter.capacity.total !== 'number' || shelter.capacity.total < 0)) {
      errors.push('Total capacity must be a positive number');
    }

    // Validate status
    const validStatuses = ['OPEN', 'FULL', 'CLOSED', 'MAINTENANCE'];
    if (shelter.status && !validStatuses.includes(shelter.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Filter shelters by criteria
   * @param {Array} shelters - Array of shelters
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered shelters
   */
  filterShelters(shelters, filters) {
    return shelters.filter(shelter => {
      // Status filter
      if (filters.status && shelter.status !== filters.status) {
        return false;
      }

      // Shelter type filter
      if (filters.shelterType && shelter.type !== filters.shelterType) {
        return false;
      }

      // City filter
      if (filters.city && shelter.address?.city !== filters.city) {
        return false;
      }

      // Province filter
      if (filters.province && shelter.address?.province !== filters.province) {
        return false;
      }

      // Disaster types filter
      if (filters.disasterTypes && filters.disasterTypes.length > 0) {
        const hasDisasterType = filters.disasterTypes.some(type => 
          shelter.disasterTypes?.includes(type)
        );
        if (!hasDisasterType) {
          return false;
        }
      }

      // Support features filters
      const supportFeatures = [
        'wheelchairAccess', 'medical', 'food', 'water', 'power',
        'petFriendly', 'childFriendly', 'elderlySupport', 
        'disabilitySupport', 'pregnancySupport'
      ];

      for (const feature of supportFeatures) {
        if (filters[feature] !== undefined && filters[feature] !== '' && 
            shelter.amenities?.[feature] !== filters[feature]) {
          return false;
        }
      }

      // Verified filter
      if (filters.verified !== undefined && shelter.verified !== (filters.verified === 'true')) {
        return false;
      }

      return true;
    });
  }

  /**
   * Search shelters by text query
   * @param {Array} shelters - Array of shelters
   * @param {string} query - Search query
   * @returns {Array} Search results
   */
  searchSheltersByText(shelters, query) {
    if (!query || query.trim() === '') {
      return shelters;
    }

    const searchTerm = query.toLowerCase().trim();

    return shelters.filter(shelter => {
      // Search in name
      if (shelter.name && shelter.name.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in address
      if (shelter.address) {
        const { city, province, street, postalCode } = shelter.address;
        const addressString = [city, province, street, postalCode].join(' ').toLowerCase();
        if (addressString.includes(searchTerm)) {
          return true;
        }
      }

      // Search in description
      if (shelter.description && shelter.description.toLowerCase().includes(searchTerm)) {
        return true;
      }

      // Search in disaster types
      if (shelter.disasterTypes) {
        const disasterTypesString = shelter.disasterTypes.join(' ').toLowerCase();
        if (disasterTypesString.includes(searchTerm)) {
          return true;
        }
      }

      return false;
    });
  }
}

// Create singleton instance
const shelterService = new ShelterService();

export default shelterService;
