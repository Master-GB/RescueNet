import React, { createContext, useContext, useState, useCallback } from "react";
import {
  fetchMissingPersons,
  reportMissingPerson,
  updateMissingPerson,
  deleteMissingPerson,
  markAsFound,
  addSighting,
} from "../services/missingPersonService";

const MissingPersonContext = createContext();

export const MissingPersonProvider = ({ children }) => {
  const [missingPersons, setMissingPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [filters, setFilters] = useState({ status: "", search: "", gender: "" });

  const loadMissingPersons = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMissingPersons({ ...filters, ...params });
      setMissingPersons(data.missingPersons || data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load missing persons");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const submitReport = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportMissingPerson(formData);
      await loadMissingPersons();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editReport = async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await updateMissingPerson(id, formData);
      await loadMissingPersons();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeReport = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMissingPerson(id);
      setMissingPersons((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const foundPerson = async (id) => {
    try {
      await markAsFound(id);
      setMissingPersons((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: "found" } : p))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark as found");
      throw err;
    }
  };

  const submitSighting = async (id, data) => {
    try {
      const result = await addSighting(id, data);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add sighting");
      throw err;
    }
  };

  return (
    <MissingPersonContext.Provider
      value={{
        missingPersons,
        selectedPerson,
        setSelectedPerson,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        loadMissingPersons,
        submitReport,
        editReport,
        removeReport,
        foundPerson,
        submitSighting,
      }}
    >
      {children}
    </MissingPersonContext.Provider>
  );
};

export const useMissingPerson = () => {
  const context = useContext(MissingPersonContext);
  if (!context) throw new Error("useMissingPerson must be used within MissingPersonProvider");
  return context;
};

export default MissingPersonContext;