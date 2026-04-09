import { useState, useEffect, useCallback } from 'react';
import { emergencyContactService, emergencyServicesService, contactActionsService } from '../services/emergencyContactService';

export const useEmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load all contacts and emergency services
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [contactsData, servicesData] = await Promise.all([
        emergencyContactService.getAllContacts(),
        emergencyServicesService.getAllServices()
      ]);
      
      setContacts(contactsData.contacts || []);
      setEmergencyServices(servicesData.services || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new contact
  const addContact = useCallback(async (contactData) => {
    try {
      setError(null);
      const newContact = await emergencyContactService.createContact(contactData);
      setContacts(prev => [...prev, newContact]);
      setSuccess('Contact added successfully!');
      return newContact;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contact');
      throw err;
    }
  }, []);

  // Update existing contact
  const updateContact = useCallback(async (id, contactData) => {
    try {
      setError(null);
      const updatedContact = await emergencyContactService.updateContact(id, contactData);
      setContacts(prev => prev.map(contact => 
        contact.id === id ? updatedContact : contact
      ));
      setSuccess('Contact updated successfully!');
      return updatedContact;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update contact');
      throw err;
    }
  }, []);

  // Delete contact
  const deleteContact = useCallback(async (id) => {
    try {
      setError(null);
      await emergencyContactService.deleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
      setSuccess('Contact deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete contact');
      throw err;
    }
  }, []);

  // Set primary contact
  const setPrimaryContact = useCallback(async (id) => {
    try {
      setError(null);
      await emergencyContactService.setPrimaryContact(id);
      setContacts(prev => prev.map(contact => ({
        ...contact,
        isPrimary: contact.id === id
      })));
      setSuccess('Primary contact updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set primary contact');
      throw err;
    }
  }, []);

  // Search contacts
  const searchContacts = useCallback(async (query) => {
    try {
      setError(null);
      const results = await emergencyContactService.searchContacts(query);
      return results.contacts || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search contacts');
      return [];
    }
  }, []);

  // Get contacts by category
  const getContactsByCategory = useCallback(async (category) => {
    try {
      setError(null);
      const results = await emergencyContactService.getContactsByCategory(category);
      return results.contacts || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get contacts by category');
      return [];
    }
  }, []);

  // Log call to contact
  const logCall = useCallback(async (contactId, duration, notes) => {
    try {
      setError(null);
      await contactActionsService.logCall(contactId, duration, notes);
      setSuccess('Call logged successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log call');
      throw err;
    }
  }, []);

  // Send message to contact
  const sendMessage = useCallback(async (contactId, message) => {
    try {
      setError(null);
      await contactActionsService.sendMessage(contactId, message);
      setSuccess('Message sent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      throw err;
    }
  }, []);

  // Get contact history
  const getContactHistory = useCallback(async (contactId) => {
    try {
      setError(null);
      const history = await contactActionsService.getContactHistory(contactId);
      return history.history || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get contact history');
      return [];
    }
  }, []);

  // Export contacts
  const exportContacts = useCallback(async () => {
    try {
      setError(null);
      const blob = await emergencyContactService.exportContacts();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emergency-contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Contacts exported successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export contacts');
      throw err;
    }
  }, []);

  // Import contacts
  const importContacts = useCallback(async (file) => {
    try {
      setError(null);
      const result = await emergencyContactService.importContacts(file);
      await loadData(); // Reload contacts
      setSuccess(`Successfully imported ${result.imported || 0} contacts!`);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import contacts');
      throw err;
    }
  }, [loadData]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Filter contacts locally
  const filterContacts = useCallback((contacts, searchTerm, category) => {
    return contacts.filter(contact => {
      const matchesSearch = !searchTerm || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.relationship.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !category || category === 'all' || contact.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }, []);

  // Get contact statistics
  const getStatistics = useCallback(() => {
    const stats = {
      total: contacts.length,
      primary: contacts.filter(c => c.isPrimary).length,
      byCategory: {},
      recentActivity: 0
    };

    contacts.forEach(contact => {
      stats.byCategory[contact.category] = (stats.byCategory[contact.category] || 0) + 1;
    });

    return stats;
  }, [contacts]);

  // Initialize data
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Data
    contacts,
    emergencyServices,
    loading,
    error,
    success,
    
    // Actions
    addContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
    searchContacts,
    getContactsByCategory,
    logCall,
    sendMessage,
    getContactHistory,
    exportContacts,
    importContacts,
    loadData,
    
    // Utilities
    filterContacts,
    getStatistics,
    clearMessages
  };
};

export default useEmergencyContacts;
