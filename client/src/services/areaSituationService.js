import { API_BASE_URL, ENDPOINTS, HTTP_METHODS, DEFAULT_HEADERS } from '../constants/apiConstants';

class AreaSituationService {
  constructor() {
    this.baseURL = API_BASE_URL;
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
      credentials: 'include', // Include cookies for authentication
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
   * Get all active situations with optional filtering
   * @returns {Promise<Object>} Response with situations array
   */
  async getActiveSituations() {
    return this.request('/area/situation/active', {
      method: HTTP_METHODS.GET,
    });
  }

  /**
   * Get current situation by region or location
   * @param {Object} params - Query parameters {region, lat, lon, radius}
   * @returns {Promise<Object>} Response with current situation
   */
  async getCurrentSituation(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/area/situation?${queryString}` : '/area/situation';
    
    return this.request(endpoint, {
      method: HTTP_METHODS.GET,
    });
  }

  /**
   * Get situation history for region
   * @param {Object} params - Query parameters {region, limit}
   * @returns {Promise<Object>} Response with situations history
   */
  async getSituationHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/area/situation/history?${queryString}` : '/area/situation/history';
    
    return this.request(endpoint, {
      method: HTTP_METHODS.GET,
    });
  }

  /**
   * Create new area situation
   * @param {Object} situationData - Situation data
   * @returns {Promise<Object>} Response with created situation
   */
  async createSituation(situationData) {
    return this.request('/area/situation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(situationData),
    });
  }

  /**
   * Update existing situation
   * @param {string} situationId - Situation ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Response with updated situation
   */
  async updateSituation(situationId, updateData) {
    return this.request(`/area/situation/${situationId}`, {
      method: HTTP_METHODS.PUT,
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Deactivate/delete situation
   * @param {string} situationId - Situation ID
   * @returns {Promise<Object>} Response
   */
  async deactivateSituation(situationId) {
    return this.request(`/area/situation/${situationId}`, {
      method: HTTP_METHODS.DELETE,
    });
  }
}

const areaSituationService = new AreaSituationService();
export default areaSituationService;
