import { useEffect, useCallback, useState } from 'react';
import { useMissingPersonContext } from '../contexts/MissingPersonContext';
import missingPersonService from '../services/missingPersonService';

export const useMissingPerson = () => {
  const {
    filters,
    searchTerm,
    sortBy,
    setMissingPersons,
    setLoading,
    setError,
    addNotification,
  } = useMissingPersonContext();

  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState(null);

  // Fetch missing persons with current filters
  const fetchMissingPersons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For client-side filtering, fetch all data without search parameters
      // Only use pagination
      const params = {
        page: 1,
        limit: 100, // Get more results for better filtering experience
      };

      console.log('Fetching missing persons with params:', params);
      const response = await missingPersonService.getMissingPersons(params);
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('Setting missing persons:', response.data);
        setMissingPersons(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch missing persons');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to load missing persons');
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Load Error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, sortBy, setMissingPersons, setLoading, setError, addNotification]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);

      const response = await missingPersonService.getStatistics();
      
      if (response.success) {
        setStatistics(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to load statistics');
      setErrorStats(errorMessage);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Report new missing person
  const reportMissingPerson = useCallback(async (personData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate data
      const validation = missingPersonService.validatePersonData(personData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Format data for API
      const formattedData = missingPersonService.formatPersonData(personData);

      const response = await missingPersonService.reportMissingPerson(formattedData);
      
      if (response.success) {
        // Refresh the list
        await fetchMissingPersons();
        
        addNotification({
          type: 'success',
          title: 'Report Submitted',
          message: 'Missing person report has been submitted successfully.',
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit report');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to submit report');
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Report Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, addNotification, fetchMissingPersons]);

  // Update missing person status
  const updatePersonStatus = useCallback(async (personId, status, notes = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await missingPersonService.updateStatus(personId, status, notes);
      
      if (response.success) {
        // Update the person in the list
        setMissingPersons(prev => prev.map(person => 
          person.id === personId 
            ? { ...person, status, updatedAt: new Date().toISOString() }
            : person
        ));

        addNotification({
          type: 'success',
          title: 'Status Updated',
          message: `Status has been updated to ${status.toLowerCase()}.`,
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to update status');
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Update Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, addNotification, setMissingPersons]);

  // Update last seen information
  const updateLastSeen = useCallback(async (personId, lastSeenData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await missingPersonService.updateLastSeen(personId, lastSeenData);
      
      if (response.success) {
        // Update the person in the list
        setMissingPersons(prev => prev.map(person => 
          person.id === personId || person._id === personId
            ? { 
                ...person, 
                lastSeenLocation: {
                  address: lastSeenData.address,
                  city: lastSeenData.city
                },
                lastSeenDate: lastSeenData.dateTime,
                updatedAt: new Date().toISOString()
              }
            : person
        ));

        addNotification({
          type: 'success',
          title: 'Last Seen Updated',
          message: 'Person\'s last seen information has been updated.',
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update last seen information');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to update last seen');
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Update Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, addNotification, setMissingPersons]);

  // Add tip/information
  const addTip = useCallback(async (personId, tipData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await missingPersonService.addSighting(personId, tipData);
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Sighting Submitted',
          message: 'Your sighting information has been submitted. Thank you for helping.',
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit sighting');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to submit sighting');
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Sighting Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, addNotification]);

  // Search for similar persons
  const searchSimilar = useCallback(async (personData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await missingPersonService.searchSimilar(personData);
      
      if (response.success) {
        return response.data || [];
      } else {
        throw new Error(response.message || 'Failed to search similar persons');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to search similar persons');
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Search Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, addNotification]);

  // Upload image
  const uploadImage = useCallback(async (file, personId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await missingPersonService.uploadImage(file, personId);
      
      if (response.success) {
        addNotification({
          type: 'success',
          title: 'Image Uploaded',
          message: 'Image has been uploaded successfully.',
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to upload image');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to upload image');
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Upload Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Get person by ID
  const getPersonById = useCallback(async (personId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await missingPersonService.getMissingPerson(personId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch person details');
      }
    } catch (error) {
      const errorMessage = missingPersonService.handleApiError(error, 'Failed to fetch person details');
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Fetch missing persons when search term, filters, or sort changes
  useEffect(() => {
    fetchMissingPersons();
  }, [fetchMissingPersons]);

  // Load statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    // Data
    statistics,
    loadingStats,
    errorStats,

    // Actions
    fetchMissingPersons,
    fetchStatistics,
    reportMissingPerson,
    updatePersonStatus,
    updateLastSeen,
    addTip,
    searchSimilar,
    uploadImage,
    getPersonById,

    // Refresh
    refresh: () => {
      fetchMissingPersons();
      fetchStatistics();
    },
  };
};
