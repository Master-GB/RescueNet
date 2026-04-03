import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Shield, Loader, AlertCircle, RefreshCw } from 'lucide-react';

const CurrentLocationCard = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Reverse geocoding to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address details');
      }
      
      const addressData = await response.json();
      
      setLocation({
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        accuracy: accuracy.toFixed(0),
        address: {
          district: addressData.address?.county || addressData.address?.state_district || 'Unknown',
          city: addressData.address?.city || addressData.address?.town || addressData.address?.village || 'Unknown',
          country: addressData.address?.country || 'Unknown',
          road: addressData.address?.road || 'Unknown',
          postcode: addressData.address?.postcode || 'Unknown'
        },
        timestamp: new Date().toLocaleString()
      });
      
    } catch (err) {
      console.error('Location Error:', err);
      setError(err.message);
      
      // Fallback to default location (Colombo)
      setLocation({
        latitude: '6.927079',
        longitude: '79.861243',
        accuracy: 'N/A',
        address: {
          district: 'Colombo',
          city: 'Colombo',
          country: 'Sri Lanka',
          road: 'Main Street',
          postcode: '00100'
        },
        timestamp: new Date().toLocaleString(),
        isFallback: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Getting your location...</span>
        </div>
      </div>
    );
  }

  if (error && !location) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Location Access Error</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Location</h3>
            <p className="text-xs text-gray-500">
              {location.isFallback ? 'Default Location' : 'GPS Location'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchCurrentLocation}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Location Details */}
      <div className="space-y-4">
        {/* Address Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Full Address
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Street Address</p>
              <p className="font-medium text-gray-900">{location.address.road}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500">City/Town</p>
                <p className="font-medium text-gray-900">{location.address.city}</p>
              </div>
              <div>
                <p className="text-gray-500">District</p>
                <p className="font-medium text-gray-900">{location.address.district}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500">Country</p>
                <p className="font-medium text-gray-900">{location.address.country}</p>
              </div>
              <div>
                <p className="text-gray-500">Postal Code</p>
                <p className="font-medium text-gray-900">{location.address.postcode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Coordinates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Latitude</p>
              <p className="font-mono font-medium text-gray-900">{location.latitude}°</p>
            </div>
            <div>
              <p className="text-gray-500">Longitude</p>
              <p className="font-mono font-medium text-gray-900">{location.longitude}°</p>
            </div>
            <div>
              <p className="text-gray-500">Accuracy</p>
              <p className="font-medium text-gray-900">
                {location.accuracy === 'N/A' ? 'N/A' : `±${location.accuracy}m`}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          Last updated: {location.timestamp}
          {location.isFallback && (
            <span className="ml-2 text-yellow-600">
              (Using default location - enable GPS for accurate location)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentLocationCard;
