import { useState, useCallback, useEffect } from 'react';
import areaSituationService from '../services/areaSituationService';

/**
 * Custom hook for managing area situations
 * @returns {Object} Area situation state and methods
 */
export default function useAreaSituation() {
  const [situations, setSituations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  /**
   * Fetch active situations
   */
  const fetchSituations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await areaSituationService.getActiveSituations();
      
      if (response.success) {
        const situationList = response.data.situations || [];
        setSituations(situationList);
        setPagination(prev => ({
          ...prev,
          total: situationList.length,
        }));
      } else {
        setError(response.message || 'Failed to fetch situations');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch situations');
      console.error('Fetch situations error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new situation
   */
  const createSituation = useCallback(async (situationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await areaSituationService.createSituation(situationData);
      
      if (response.success) {
        // Refetch situations to get updated list
        await fetchSituations();
        return {
          success: true,
          message: response.message || 'Situation created successfully',
          data: response.data,
        };
      } else {
        setError(response.message || 'Failed to create situation');
        return {
          success: false,
          message: response.message || 'Failed to create situation',
        };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create situation';
      setError(errorMsg);
      console.error('Create situation error:', err);
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [fetchSituations]);

  /**
   * Update existing situation
   */
  const updateSituation = useCallback(async (situationId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await areaSituationService.updateSituation(situationId, updateData);
      
      if (response.success) {
        // Refetch situations to get updated list
        await fetchSituations();
        return {
          success: true,
          message: response.message || 'Situation updated successfully',
          data: response.data,
        };
      } else {
        setError(response.message || 'Failed to update situation');
        return {
          success: false,
          message: response.message || 'Failed to update situation',
        };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update situation';
      setError(errorMsg);
      console.error('Update situation error:', err);
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [fetchSituations]);

  /**
   * Deactivate situation
   */
  const deactivateSituation = useCallback(async (situationId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await areaSituationService.deactivateSituation(situationId);
      
      if (response.success) {
        // Refetch situations to get updated list
        await fetchSituations();
        return {
          success: true,
          message: response.message || 'Situation deactivated successfully',
        };
      } else {
        setError(response.message || 'Failed to deactivate situation');
        return {
          success: false,
          message: response.message || 'Failed to deactivate situation',
        };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to deactivate situation';
      setError(errorMsg);
      console.error('Deactivate situation error:', err);
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [fetchSituations]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    situations,
    loading,
    error,
    pagination,
    fetchSituations,
    createSituation,
    updateSituation,
    deactivateSituation,
    clearError,
  };
}
