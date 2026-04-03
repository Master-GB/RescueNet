import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Users, Navigation, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ShelterMap.css';
import locationService from '../../services/locationService.js';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ShelterMap = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);

  // Fetch all shelters for the map
  useEffect(() => {
    const fetchAllShelters = async () => {
      try {
        const response = await fetch('/api/shelters/get-list?limit=100');
        if (response.ok) {
          const data = await response.json();
          setShelters(data.shelters || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllShelters();
  }, []);

  // Subscribe to location updates
  useEffect(() => {
    const unsubscribe = locationService.subscribe((location) => {
      setCurrentLocation(location);
    });

    // Initialize location if not already done
    if (!locationService.getLocation()) {
      locationService.getCurrentLocation();
    } else {
      setCurrentLocation(locationService.getLocation());
    }

    return unsubscribe;
  }, []);

  // Get capacity percentage for color coding
  const getCapacityColor = (shelter) => {
    // Check shelter status first
    if (shelter.status?.toLowerCase() === 'closed') return '#EF4444'; // Red - Closed
    if (shelter.status?.toLowerCase() === 'full') return '#EAB308'; // Yellow - Full
    
    // If no occupancy data, default to available (green)
    if (!shelter.occupancy?.current || !shelter.capacity?.total) return '#22C55E'; // Green - Available
    
    const percentage = (shelter.occupancy.current / shelter.capacity.total) * 100;
    
    if (percentage >= 90) return '#EAB308'; // Yellow - Full
    return '#22C55E'; // Green - Available
  };

  // Create custom icon for shelters
  const createShelterIcon = (shelter) => {
    const color = getCapacityColor(shelter);

    return L.divIcon({
      className: 'custom-shelter-marker',
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- House base -->
            <rect x="6" y="12" width="12" height="10" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="1.5"/>
            <!-- Roof -->
            <path d="M3 12L12 3L21 12" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="1.5"/>
            <!-- Door -->
            <rect x="10" y="15" width="4" height="7" 
                  fill="white" 
                  opacity="0.8"/>
            <!-- Door knob -->
            <circle cx="13" cy="18.5" r="0.5" 
                    fill="${color}"/>
            <!-- Windows -->
            <rect x="7.5" y="14" width="2" height="2" 
                  fill="white" 
                  opacity="0.6"/>
            <rect x="14.5" y="14" width="2" height="2" 
                  fill="white" 
                  opacity="0.6"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      tooltipAnchor: [0, -18],
    });
  };

  // Create custom icon for current location
  const createLocationIcon = () => {
    return L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
      shadowAnchor: [12, 41],
      tooltipAnchor: [1, -34],
    });
  };

  // Component to handle map centering and animation
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (currentLocation) {
        map.setView([currentLocation.lat, currentLocation.lng], 8);
        
        // Create custom animated overlay
        const LocationAnimation = L.divIcon({
          className: 'location-animation-container',
          html: `
            <div class="location-pulse-wrapper">
              <div class="location-pulse-ring"></div>
              <div class="location-pulse-ring delay-1"></div>
              <div class="location-pulse-ring delay-2"></div>
            </div>
          `,
          iconSize: [100, 100],
          iconAnchor: [50, 50],
        });
        
        // Add animation overlay
        const animationMarker = L.marker([currentLocation.lat, currentLocation.lng], {
          icon: LocationAnimation,
          interactive: false,
          zIndex: 1000
        }).addTo(map);
        
        return () => {
          map.removeLayer(animationMarker);
        };
      }
    }, [currentLocation, map]);

    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Loading map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Failed to load map</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-2 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Shelter Map</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Full</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Closed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Your Location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[500px]">
        {/* Shelter Counter */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">
            {shelters.length} {shelters.length === 1 ? 'shelter' : 'shelters'} found
          </p>
        </div>
        
        <MapContainer
          center={[currentLocation?.lat || 7.5, currentLocation?.lng || 80.5]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapController />
          
          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={createLocationIcon()}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -20]}>
                <div className="text-sm">
                  <strong>Your Location</strong>
                </div>
              </Tooltip>
            </Marker>
          )}

          {/* Shelter Markers */}
          {shelters.map((shelter) => {
            const [lng, lat] = shelter.location.coordinates;
            
            return (
              <Marker
                key={shelter._id}
                position={[lat, lng]}
                icon={createShelterIcon(shelter)}
              >
                <Tooltip permanent={false} direction="top" offset={[0, -20]}>
                  <div className="text-sm p-2">
                    <strong>{shelter.name}</strong><br />
                    <div className="mt-1">
                      <span className="font-medium">Capacity:</span> {shelter.occupancy?.current || 0}/{shelter.capacity?.total || 0}<br />
                      <span className="font-medium">Status:</span> {shelter.status || 'OPEN'}<br />
                      <span className="font-medium">Type:</span> {shelter.shelterType?.replace('_', ' ') || 'OTHER'}<br />
                      <span className="font-medium">Phone:</span> {shelter.contact?.phone || 'N/A'}
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default ShelterMap;
