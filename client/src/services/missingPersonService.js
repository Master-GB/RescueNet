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
        let errorData = {};
        let responseText = '';
        
        try {
          errorData = await response.json();
        } catch (e) {
          responseText = await response.text();
        }
        
        console.error('API Error Response:', errorData);
        console.error('Response status:', response.status);
        console.error('Response text:', responseText);
        
        // Log specific validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          console.error('Validation Errors:', errorData.errors);
          errorData.errors.forEach((error, index) => {
            console.error(`Error ${index + 1}:`, error);
          });
        }
        
        throw new Error(errorData.message || responseText || `HTTP ${response.status}: ${response.statusText}`);
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
    // Map frontend data to backend schema
    const backendData = {
      fullName: personData.name?.trim() || '',
      age: parseInt(personData.age) || 0,
      gender: personData.gender || '',
      lastSeenLocation: {
        address: personData.lastSeenAddress?.trim() || '',
        city: personData.lastSeenCity?.trim() || ''
      },
      lastSeenDate: personData.dateMissing ? new Date(personData.dateMissing).toISOString() : new Date().toISOString(),
      circumstances: personData.description?.trim() || '',
      reporterName: personData.contactName?.trim() || '',
      reporterContact: {
        phone: personData.contactPhone?.replace(/\D/g, '').trim() || '',
        email: personData.contactEmail?.trim() || ''
      },
      physicalDescription: {
        height: personData.physicalDescription?.height?.trim() || '',
        weight: personData.physicalDescription?.weight?.trim() || '',
        hairColor: personData.physicalDescription?.hairColor?.trim() || '',
        eyeColor: personData.physicalDescription?.eyeColor?.trim() || '',
        distinctiveMarks: personData.distinctiveMarks?.trim() || '',
        clothing: personData.clothing?.trim() || ''
      },
      medicalConditions: personData.medicalConditions?.trim() || '',
      emergencyContact: personData.emergencyContact?.trim() || '',
      priority: personData.priority || 'Medium'
    };

    // Explicitly set geoLocation to null to prevent Mongoose from applying defaults
    // Only populate if valid coordinates are provided
    if (personData.geoLocation?.coordinates && 
        Array.isArray(personData.geoLocation.coordinates) &&
        personData.geoLocation.coordinates.length === 2) {
      backendData.geoLocation = {
        type: 'Point',
        coordinates: personData.geoLocation.coordinates
      };
    } else {
      // Send null to prevent Mongoose from creating incomplete default object
      backendData.geoLocation = null;
    }

    // Debug: Log backend data being sent
    console.log('Submitting backend data:', backendData);

    return this.apiCall(API_ENDPOINTS.MISSING_PERSONS, {
      method: 'POST',
      body: JSON.stringify(backendData),
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
        description: sightingData.description
      }),
    });
  }

  // Update missing person report
  async updateReport(id, updateData) {
    const endpoint = API_ENDPOINTS.MISSING_PERSON.replace(':id', id);
    return this.apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete missing person report (soft delete)
  async deleteReport(id) {
    const endpoint = API_ENDPOINTS.MISSING_PERSON.replace(':id', id);
    return this.apiCall(endpoint, {
      method: 'DELETE',
    });
  }

  // Update sighting report
  async updateSighting(id, sightingId, updateData) {
    const endpoint = `${API_ENDPOINTS.SIGHTINGS.replace(':id', id)}/${sightingId}`;
    return this.apiCall(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete sighting report
  async deleteSighting(id, sightingId) {
    const endpoint = `${API_ENDPOINTS.SIGHTINGS.replace(':id', id)}/${sightingId}`;
    return this.apiCall(endpoint, {
      method: 'DELETE',
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
