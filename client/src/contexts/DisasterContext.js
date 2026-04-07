import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { DISASTER_TYPES, DEFAULT_BBOX, STORAGE_KEYS } from '../constants/disasterConstants';

const DisasterContext = createContext(null);

export const useDisasterContext = () => {
  const ctx = useContext(DisasterContext);
  if (!ctx) {
    throw new Error('useDisasterContext must be used within DisasterProvider');
  }
  return ctx;
};

const readSubscriptions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.subscriptions);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const DisasterProvider = ({ children }) => {
  const [activeType, setActiveType] = useState(DISASTER_TYPES[0].key);
  const [layerMode, setLayerMode] = useState('map'); // 'map' | 'heat'
  const [fireDays, setFireDays] = useState(3); // For FIRMS fire data filtering
  const [areaFilter, setAreaFilter] = useState('Sri Lanka'); // Area filter for data

  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    const toISO = (d) => d.toISOString().slice(0, 10);
    return { start: toISO(start), end: toISO(end) };
  });

  const [subscriptions, setSubscriptions] = useState(() => readSubscriptions());
  const [updatesFilter, setUpdatesFilter] = useState('all'); // 'all' | subscribed disaster type

  const toggleSubscription = useCallback((typeKey) => {
    setSubscriptions((prev) => {
      const next = prev.includes(typeKey)
        ? prev.filter((t) => t !== typeKey)
        : [...prev, typeKey];
      localStorage.setItem(STORAGE_KEYS.subscriptions, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      activeType,
      setActiveType,
      layerMode,
      setLayerMode,
      fireDays,
      setFireDays,
      areaFilter,
      setAreaFilter,
      dateRange,
      setDateRange,
      subscriptions,
      toggleSubscription,
      updatesFilter,
      setUpdatesFilter,
    }),
    [
      activeType,
      layerMode,
      fireDays,
      areaFilter,
      dateRange,
      subscriptions,
      updatesFilter,
      toggleSubscription,
    ],
  );

  return <DisasterContext.Provider value={value}>{children}</DisasterContext.Provider>;
};
