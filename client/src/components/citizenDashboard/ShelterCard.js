import React, { useState, useEffect } from 'react';
import { MapPin, Users, Navigation, Phone, Shield } from 'lucide-react';
import locationService from '../../services/locationService.js';

const ShelterCard = ({ shelterId, onShelterClick }) => {
  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState('N/A');

  useEffect(() => {
    // Subscribe to location updates
    const unsubscribe = locationService.subscribe((currentLocation) => {
      if (shelter) {
        const distanceStr = locationService.getDistanceToShelter(shelter);
        setDistance(distanceStr);
      }
    });

    // Initialize location if not already done
    if (!locationService.getLocation()) {
      locationService.getCurrentLocation();
    }

    return unsubscribe;
  }, [shelter]);

  useEffect(() => {
    const fetchShelterData = async () => {
      try {
        setLoading(true);
        // Fetch shelter data from API
        const response = await fetch(`/api/shelters/get/${shelterId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch shelter data');
        }
        const data = await response.json();
        setShelter(data.shelter);
        
        // Calculate distance once we have shelter data
        if (data.shelter) {
          const distanceStr = locationService.getDistanceToShelter(data.shelter);
          setDistance(distanceStr);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shelterId) {
      fetchShelterData();
    }
  }, [shelterId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'full':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getCapacityPercentage = () => {
    if (!shelter?.occupancy?.current || !shelter?.capacity?.total) return 0;
    return Math.round((shelter.occupancy.current / shelter.capacity.total) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-200 rounded-xl"></div>
            <div className="h-16 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
            <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Failed to load shelter</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-slate-800 mb-1">{shelter.name}</h4>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>{`${shelter.address?.street || ''}, ${shelter.address?.city || ''}, ${shelter.address?.province || ''}`}</span>
            </div>
            {shelter.shelterType && (
              <span className="inline-block mt-2 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                {shelter.shelterType.replace('_', ' ')}
              </span>
            )}
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(shelter.status)}`}>
            {shelter.status || 'OPEN'}
          </span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              {shelter.occupancy?.current || 0} / {shelter.capacity?.total || 0}
            </span>
          </div>
          <span className="text-xs text-slate-500">{getCapacityPercentage()}% full</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              getCapacityPercentage() > 80 ? 'bg-red-500' : 
              getCapacityPercentage() > 60 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${getCapacityPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-4 h-4 text-slate-500" />
            <p className="text-xs text-slate-500">Distance</p>
          </div>
          <p className="font-bold text-slate-800">
            {distance}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-4 h-4 text-slate-500" />
            <p className="text-xs text-slate-500">Contact</p>
          </div>
          <p className="font-bold text-slate-800">
            {shelter.contact?.phone || 'N/A'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-0">
        <button 
          onClick={() => onShelterClick && onShelterClick(shelter)}
          className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default ShelterCard;