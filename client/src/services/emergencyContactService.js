import apiClient from "./apiClient";

// Emergency Contact Service
export const emergencyContactService = {
  // Get all emergency contacts for the current user
  getAllContacts: async () => {
    const response = await apiClient.get("/api/emergency-contacts");
    return response.data;
  },

  // Get a single contact by ID
  getContactById: async (id) => {
    const response = await apiClient.get(`/api/emergency-contacts/${id}`);
    return response.data;
  },

  // Create a new emergency contact
  createContact: async (contactData) => {
    const response = await apiClient.post("/api/emergency-contacts", contactData);
    return response.data;
  },

  // Update an existing contact
  updateContact: async (id, contactData) => {
    const response = await apiClient.put(`/api/emergency-contacts/${id}`, contactData);
    return response.data;
  },

  // Delete a contact
  deleteContact: async (id) => {
    const response = await apiClient.delete(`/api/emergency-contacts/${id}`);
    return response.data;
  },

  // Set primary contact
  setPrimaryContact: async (id) => {
    const response = await apiClient.patch(`/api/emergency-contacts/${id}/set-primary`);
    return response.data;
  },

  // Search contacts
  searchContacts: async (query) => {
    const response = await apiClient.get(`/api/emergency-contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get contacts by category
  getContactsByCategory: async (category) => {
    const response = await apiClient.get(`/api/emergency-contacts/category/${category}`);
    return response.data;
  },

  // Export contacts
  exportContacts: async () => {
    const response = await apiClient.get("/api/emergency-contacts/export", {
      responseType: 'blob'
    });
    return response.data;
  },

  // Import contacts
  importContacts: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post("/api/emergency-contacts/import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Emergency Services Service
export const emergencyServicesService = {
  // Get all emergency services
  getAllServices: async () => {
    const response = await apiClient.get("/api/emergency-services");
    return response.data;
  },

  // Get emergency services by type
  getServicesByType: async (type) => {
    const response = await apiClient.get(`/api/emergency-services/type/${type}`);
    return response.data;
  },

  // Get emergency services by location
  getServicesByLocation: async (latitude, longitude) => {
    const response = await apiClient.get(`/api/emergency-services/nearby?lat=${latitude}&lng=${longitude}`);
    return response.data;
  }
};

// Contact Actions Service
export const contactActionsService = {
  // Log a call to contact
  logCall: async (contactId, duration, notes) => {
    const response = await apiClient.post(`/api/emergency-contacts/${contactId}/log-call`, {
      duration,
      notes,
      timestamp: new Date().toISOString()
    });
    return response.data;
  },

  // Send message to contact
  sendMessage: async (contactId, message) => {
    const response = await apiClient.post(`/api/emergency-contacts/${contactId}/send-message`, {
      message,
      timestamp: new Date().toISOString()
    });
    return response.data;
  },

  // Get contact history
  getContactHistory: async (contactId) => {
    const response = await apiClient.get(`/api/emergency-contacts/${contactId}/history`);
    return response.data;
  }
};

export default emergencyContactService;
