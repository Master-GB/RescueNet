import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Home, 
  Info, 
  X,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AreaSituationBanner = () => {
  const [situations, setSituations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 6.927079, lon: 79.861243 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (userLocation) {
      fetchAreaSituation();
    }
  }, [userLocation]); // Fetch when location is available

  // Refresh every 5 minutes
  useEffect(() => {
    if (userLocation) {
      const interval = setInterval(fetchAreaSituation, 300000);
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  // Auto-rotate through situations every 5 seconds
  useEffect(() => {
    // Only start rotation if data is loaded, there are multiple situations, and not hovered
    if (!loading && situations.length > 1 && !isHovered) {
      // Start rotation after 5 seconds delay (user sees first situation for 5 seconds)
      const rotationInterval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % situations.length);
      }, 5000);
      
      return () => clearInterval(rotationInterval);
    }
  }, [situations.length, loading, isHovered]);

  // Reset current index when situations change
  useEffect(() => {
    if (situations.length > 0) {
      setCurrentIndex(0); // Always start with first situation when data loads
    }
  }, [situations]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location');
          // Use Colombo as default location
          setUserLocation({ lat: 6.927079, lon: 79.861243 });
        }
      );
    } else {
      // Use Colombo as default location
      setUserLocation({ lat: 6.927079, lon: 79.861243 });
    }
  }, []);

  // Fallback: If location is not set after 3 seconds, use default
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!userLocation) {
        console.log('Location timeout, using default location');
        setUserLocation({ lat: 6.927079, lon: 79.861243 });
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [userLocation]);

  const fetchAreaSituation = async () => {
    setLoading(true);
    try {
      console.log('Fetching area situation from API...');
      
      // Build URL with location parameters
      let url = 'api/area/situation';
      const params = new URLSearchParams();
      
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lon', userLocation.lon);
        params.append('radius', '20'); // 20km radius
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      console.log('Fetching from URL:', url);
      
      // Real API call to backend
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Area situation data received:', data);
      setSituations(data.situations || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch area situation:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Set empty array on error - no mock data fallback
      console.log('API failed, showing no situations...');
      setSituations([]);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'safe': 'green',
      'warning': 'yellow',
      'danger': 'red',
      'monitor': 'blue'
    };
    return colors[status] || 'green';
  };

  const getSituationStyles = (color) => {
    const styles = {
      green: 'bg-gradient-to-r from-green-500 to-green-600 border-green-700',
      yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-700',
      red: 'bg-gradient-to-r from-red-500 to-red-600 border-red-800',
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700'
    };
    return styles[color] || styles.green;
  };

  const getIconStyles = (color) => {
    const styles = {
      green: 'text-green-100',
      yellow: 'text-yellow-100',
      red: 'text-red-100',
      blue: 'text-blue-100'
    };
    return styles[color] || styles.green;
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleRefresh = () => {
    fetchAreaSituation();
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          <span className="ml-2 text-gray-600">Loading area situation...</span>
        </div>
      </div>
    );
  }

  if (!situations || situations.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl border border-emerald-700 p-6 shadow-md text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white/20">
              <CheckCircle className="w-8 h-8 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">All Clear - No Active Disasters</h3>
              <p className="text-emerald-100 opacity-90">
                Your area is currently safe with no reported disaster situations. Stay prepared and informed.
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
        
        {/* Additional Safe Information */}
        <div className="mt-4 pt-4 border-t border-emerald-400/30">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Shield className="w-4 h-4" />
            <span>Emergency services are operational and monitoring the area</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90 mt-2">
            <Clock className="w-4 h-4" />
            <span>Last checked: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // Check if all situations are "safe" - show our custom safe message
  if (situations.every(situation => situation?.status === 'safe')) {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl border border-emerald-700 p-6 shadow-md text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white/20">
              <CheckCircle className="w-8 h-8 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">All Clear - No Active Disasters</h3>
              <p className="text-emerald-100 opacity-90">
                Your area is currently safe with no reported disaster situations. Stay prepared and informed.
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
        
        {/* Additional Safe Information */}
        <div className="mt-4 pt-4 border-t border-emerald-400/30">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Shield className="w-4 h-4" />
            <span>Emergency services are operational and monitoring the area</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-90 mt-2">
            <Clock className="w-4 h-4" />
            <span>Last checked: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  if (dismissed) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm">Area situation dismissed - Click to show</span>
          </div>
          <button
            onClick={() => setDismissed(false)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Show Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Navigation Arrows */}
      {situations.length > 1 && (
        <div className="absolute top-4 left-4 z-10 flex items-center justify-between w-full px-8">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + situations.length) % situations.length)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % situations.length)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Carousel Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out cursor-pointer"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {situations.map((situation, index) => {
          const Icon = situation?.icon || Shield;
          const statusColor = getStatusColor(situation?.status);
          
          return (
            <div key={situation.id || index} className="w-full flex-shrink-0">
              <div className={`rounded-2xl border-l-4 p-6 shadow-md text-white ${getSituationStyles(statusColor)}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Main Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-white/20`}>
                        <Icon className={`w-6 h-6 ${getIconStyles(statusColor)}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{situation.title}</h3>
                        <p className="text-sm opacity-90">{situation.authority}</p>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-base mb-4 opacity-95 leading-relaxed">
                      {situation.message}
                    </p>

                    {/* Affected Areas */}
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 opacity-75" />
                      <span className="text-sm font-medium">Affected Areas:</span>
                      <div className="flex flex-wrap gap-2">
                        {situation.affectedAreas && situation.affectedAreas.length > 0 ? (
                          situation.affectedAreas.map((area, areaIndex) => (
                            <span
                              key={areaIndex}
                              className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium"
                            >
                              {area}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs opacity-75">No specific areas affected</span>
                        )}
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 opacity-75" />
                      <span className="text-sm font-medium">Recommended Actions:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {situation.recommendedActions && situation.recommendedActions.length > 0 ? (
                        situation.recommendedActions.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-75"></div>
                            <span>{action}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm opacity-75">No specific actions required</div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs opacity-75">
                      <Clock className="w-3 h-3" />
                      <span>Last updated: {new Date(situation.lastUpdated).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions - Only show for current situation */}
                  {index === currentIndex && (
                    <div className="flex items-center gap-3 lg:flex-col">
                      <button
                        onClick={handleRefresh}
                        className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition font-medium"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Severity Indicator */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide opacity-75">
                      Severity Level: {situation.severity}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full ${
                            level <= (situation.severity === 'low' ? 1 : situation.severity === 'medium' ? 3 : 5)
                              ? 'bg-white'
                              : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      {situations.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {situations.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AreaSituationBanner;
