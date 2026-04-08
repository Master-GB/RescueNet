import { API_ENDPOINTS, IMAGE_CONFIG } from '../constants/missingPersonConstants';

class MissingPersonService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Get all missing persons with optional filters
  async getMissingPersons(params = {}) {
    const queryString = new URLSearchParams();
    
    // Add filters to query string (matching backend query params)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryString.append(key, v));
        } else {
          queryString.append(key, value);
        }
      }
    });

    const endpoint = queryString.toString() 
      ? `${API_ENDPOINTS.MISSING_PERSONS}?${queryString.toString()}`
      : API_ENDPOINTS.MISSING_PERSONS;

    return this.apiCall(endpoint);
  }

  // Get single missing person by ID
  async getMissingPerson(id) {
    const endpoint = API_ENDPOINTS.MISSING_PERSON.replace(':id', id);
    return this.apiCall(endpoint);
  }

  // Report a new missing person
  async reportMissingPerson(personData) {
    const formData = new FormData();

    // Map frontend data to backend schema
    const backendData = {
      fullName: personData.name,
      age: personData.age,
      gender: personData.gender,
      lastSeenLocation: {
        address: personData.lastSeenLocation?.address || personData.lastSeenAddress || '',
        city: personData.lastSeenLocation?.city || personData.lastSeenCity || ''
      },
      lastSeenDate: personData.dateMissing || personData.lastSeenDate,
      circumstances: personData.description || personData.circumstances,
      reporterName: personData.contactName,
      reporterContact: {
        phone: personData.contactPhone,
        email: personData.contactEmail
      },
      physicalDescription: {
        height: personData.physicalDescription?.height,
        weight: personData.physicalDescription?.weight,
        hairColor: personData.physicalDescription?.hairColor,
        eyeColor: personData.physicalDescription?.eyeColor,
        distinctiveMarks: personData.distinctiveMarks || personData.specialMarks?.join(', '),
        clothing: personData.clothing
      },
      medicalConditions: personData.medicalConditions,
      emergencyContact: personData.emergencyContact,
      priority: personData.priority || 'Medium'
    };

    // Add all data fields to FormData
    Object.keys(backendData).forEach(key => {
      if (key === 'physicalDescription' || key === 'reporterContact' || key === 'lastSeenLocation') {
        // Handle nested objects
        Object.keys(backendData[key]).forEach(nestedKey => {
          if (backendData[key][nestedKey]) {
            formData.append(`${key}.${nestedKey}`, backendData[key][nestedKey]);
          }
        });
      } else if (Array.isArray(backendData[key])) {
        backendData[key].forEach(item => formData.append(key, item));
      } else if (backendData[key] !== undefined && backendData[key] !== null) {
        formData.append(key, backendData[key]);
      }
    });

    // Handle images
    if (personData.images && personData.images.length > 0) {
      personData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`image`, image);
        }
      });
    }

    return this.apiCall(API_ENDPOINTS.MISSING_PERSONS, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Update missing person status
  async updateStatus(id, status, notes = '') {
    const endpoint = API_ENDPOINTS.MISSING_PERSON.replace(':id', id);
    return this.apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Update last seen information
  async updateLastSeen(id, lastSeenData) {
    const endpoint = API_ENDPOINTS.MISSING_PERSON.replace(':id', id);
    return this.apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        lastSeenLocation: {
          address: lastSeenData.address,
          city: lastSeenData.city
        },
        lastSeenDate: lastSeenData.dateTime
      }),
    });
  }

  // Add sighting/information about missing person
  async addSighting(id, sightingData) {
    const endpoint = API_ENDPOINTS.SIGHTINGS.replace(':id', id);
    return this.apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        reportedBy: sightingData.reportedBy || 'Anonymous',
        location: sightingData.location,
        dateTime: sightingData.dateTime || new Date().toISOString(),
        description: sightingData.description,
        verified: false
      }),
    });
  }

  // Search by location radius
  async searchByLocation(longitude, latitude, radius = 10) {
    const endpoint = `${API_ENDPOINTS.SEARCH_LOCATION}?longitude=${longitude}&latitude=${latitude}&radius=${radius}`;
    return this.apiCall(endpoint);
  }

  // Get statistics
  async getStatistics() {
    return this.apiCall(API_ENDPOINTS.STATISTICS);
  }

  // Upload image for missing person
  async uploadImage(file, personId) {
    if (!file) throw new Error('No file provided');

    // Validate file
    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${IMAGE_CONFIG.ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large. Max size: ${IMAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const formData = new FormData();
    formData.append('image', file);

    return this.apiCall(`/api/missing-persons/${personId}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Validate person data against backend schema
  validatePersonData(data) {
    const errors = [];

    // Required fields validation (matching backend)
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push('Full name is required (minimum 2 characters)');
    }

    if (!data.age || data.age < 0 || data.age > 150) {
      errors.push('Valid age is required (0-150)');
    }

    if (!data.gender || !['Male', 'Female', 'Other'].includes(data.gender)) {
      errors.push('Valid gender is required (Male, Female, or Other)');
    }

    if (!data.lastSeenLocation?.address) {
      errors.push('Last seen address is required');
    }

    if (!data.lastSeenLocation?.city) {
      errors.push('City is required');
    }

    if (!data.lastSeenDate) {
      errors.push('Last seen date is required');
    }

    if (!data.circumstances || data.circumstances.trim().length < 10) {
      errors.push('Circumstances of disappearance are required (minimum 10 characters)');
    }

    if (!data.reporterName || data.reporterName.trim().length < 2) {
      errors.push('Reporter name is required (minimum 2 characters)');
    }

    if (!data.reporterContact?.phone) {
      errors.push('Reporter phone number is required');
    } else if (!/^[0-9]{10}$/.test(data.reporterContact.phone)) {
      errors.push('Invalid phone number format (10 digits required)');
    }

    if (!data.reporterContact?.email) {
      errors.push('Reporter email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.reporterContact.email)) {
      errors.push('Invalid email format');
    }

    // Optional fields validation
    if (data.physicalDescription?.height && data.physicalDescription.height.length > 50) {
      errors.push('Height description too long');
    }

    if (data.physicalDescription?.weight && data.physicalDescription.weight.length > 50) {
      errors.push('Weight description too long');
    }

    if (data.physicalDescription?.distinctiveMarks && data.physicalDescription.distinctiveMarks.length > 500) {
      errors.push('Distinctive marks description too long (max 500 characters)');
    }

    if (data.physicalDescription?.clothing && data.physicalDescription.clothing.length > 500) {
      errors.push('Clothing description too long (max 500 characters)');
    }

    if (data.medicalConditions && data.medicalConditions.length > 500) {
      errors.push('Medical conditions description too long (max 500 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Format date for API (ISO string)
  formatDate(date) {
    if (!date) return null;
    return new Date(date).toISOString();
  }

  // Format person data for API (map frontend to backend)
  formatPersonData(data) {
    const formatted = { ...data };

    // Format dates
    if (formatted.lastSeenDate) {
      formatted.lastSeenDate = this.formatDate(formatted.lastSeenDate);
    }

    // Map frontend field names to backend
    if (formatted.name) {
      formatted.fullName = formatted.name;
      delete formatted.name;
    }

    if (formatted.dateMissing) {
      formatted.lastSeenDate = formatted.dateMissing;
      delete formatted.dateMissing;
    }

    if (formatted.description) {
      formatted.circumstances = formatted.description;
      delete formatted.description;
    }

    // Clean up empty values
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === null || formatted[key] === undefined || formatted[key] === '') {
        delete formatted[key];
      }
    });

    return formatted;
  }

  // Handle API errors gracefully
  handleApiError(error, defaultMessage = 'An error occurred') {
    if (error.message?.includes('Failed to fetch')) {
      return 'Network error. Please check your internet connection.';
    }

    if (error.message?.includes('401')) {
      return 'Authentication required. Please log in again.';
    }

    if (error.message?.includes('403')) {
      return 'You do not have permission to perform this action.';
    }

    if (error.message?.includes('404')) {
      return 'The requested resource was not found.';
    }

    if (error.message?.includes('413')) {
      return 'File too large. Please upload a smaller file.';
    }

    if (error.message?.includes('422')) {
      return 'Invalid data provided. Please check your inputs.';
    }

    if (error.message?.includes('500')) {
      return 'Server error. Please try again later.';
    }

    return error.message || defaultMessage;
  }
}

export const missingPersonService = new MissingPersonService();
export default missingPersonService;
