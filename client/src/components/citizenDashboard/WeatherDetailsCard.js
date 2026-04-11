import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge,
  Thermometer,
  Loader,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const WeatherDetailsCard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user location first
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Fetch weather data
      const weatherResponse = await fetch(
        `api/weather/current?lat=${latitude}&lon=${longitude}`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);
      
    } catch (err) {
      console.error('Weather Error:', err);
      setError(err.message);
      
      // Fallback to Colombo weather
      try {
        const fallbackResponse = await fetch(
          'api/weather/current?city=Colombo'
        );
        const fallbackData = await fallbackResponse.json();
        setWeather(fallbackData);
        setError(null);
      } catch (fallbackErr) {
        setError('Unable to fetch weather data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition, size = "w-8 h-8") => {
    const conditionLower = condition?.toLowerCase() || '';
    
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
      return <Sun className={`${size} text-yellow-500`} />;
    } else if (conditionLower.includes('partly cloudy')) {
      return <Cloud className={`${size} text-gray-400`} />;
    } else if (conditionLower.includes('overcast') || conditionLower.includes('cloudy')) {
      return <Cloud className={`${size} text-gray-500`} />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain className={`${size} text-blue-500`} />;
    } else if (conditionLower.includes('thunderstorm')) {
      return <CloudRain className={`${size} text-purple-600`} />;
    } else if (conditionLower.includes('fog')) {
      return <Cloud className={`${size} text-gray-400`} />;
    } else if (conditionLower.includes('snow')) {
      return <Cloud className={`${size} text-blue-300`} />;
    } else {
      return <Cloud className={`${size} text-gray-400`} />;
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return 'text-red-600';
    if (temp >= 25) return 'text-orange-500';
    if (temp >= 15) return 'text-green-600';
    if (temp >= 5) return 'text-blue-500';
    return 'text-blue-700';
  };

  const getWindSpeedLevel = (speed) => {
    const kmh = speed;
    if (kmh < 12) return { level: 'Light', color: 'text-green-600' };
    if (kmh < 29) return { level: 'Moderate', color: 'text-yellow-600' };
    if (kmh < 50) return { level: 'Strong', color: 'text-orange-600' };
    return { level: 'Severe', color: 'text-red-600' };
  };

  const getUVIndex = () => {
    // Mock UV index based on weather condition
    const condition = weather?.current?.condition?.toLowerCase() || '';
    if (condition.includes('clear') || condition.includes('sunny')) return { level: 'High', color: 'text-red-600', value: '8' };
    if (condition.includes('partly')) return { level: 'Moderate', color: 'text-yellow-600', value: '5' };
    if (condition.includes('cloudy')) return { level: 'Low', color: 'text-green-600', value: '3' };
    return { level: 'Low', color: 'text-green-600', value: '2' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center text-red-600 mb-4">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Weather Data Error</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchWeatherData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const windInfo = getWindSpeedLevel(weather?.current?.windSpeed || 0);
  const uvInfo = getUVIndex();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getWeatherIcon(weather?.current?.condition, "w-5 h-5")}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weather Details</h3>
            <p className="text-xs text-gray-500">
              {weather?.location?.name || 'Current Location'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchWeatherData}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Current Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Temperature */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <p className="text-sm text-gray-600 mb-1">Temperature</p>
              <p className={`text-3xl font-bold ${getTemperatureColor(weather?.current?.temperature || 0)}`}>
                {Math.round(weather?.current?.temperature || 0)}°
              </p>
              <p className="text-xs text-gray-500">
                {weather?.units === 'imperial' ? 'Fahrenheit' : 'Celsius'}
              </p>
            </div>
            <Thermometer className={`w-8 h-8 ${getTemperatureColor(weather?.current?.temperature || 0)} animate-pulse`} />
          </div>
        </div>

        {/* Condition */}
        <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <p className="text-sm text-gray-600 mb-1">Condition</p>
              <p className="text-xl font-bold text-gray-900 capitalize">
                {weather?.current?.condition || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">
                Provider: {weather?.provider || 'Unknown'}
              </p>
            </div>
            <div className="animate-bounce-slow">
              {getWeatherIcon(weather?.current?.condition)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wind */}
        <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-gray-600 animate-spin-slow" />
            <p className="text-sm font-semibold text-gray-700">Wind</p>
          </div>
          <div className="animate-fade-in">
            <p className="text-lg font-bold text-gray-900">
              {Math.round(weather?.current?.windSpeed || 0)}
            </p>
            <p className="text-xs text-gray-500">
              {weather?.units === 'imperial' ? 'mph' : 'km/h'}
            </p>
            <p className={`text-xs font-medium mt-1 ${windInfo.color}`}>
              {windInfo.level} winds
            </p>
          </div>
        </div>

        {/* Humidity (Mock Data) */}
        <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-gray-600 animate-pulse" />
            <p className="text-sm font-semibold text-gray-700">Humidity</p>
          </div>
          <div className="animate-fade-in">
            <p className="text-lg font-bold text-gray-900">65%</p>
            <p className="text-xs text-gray-500">Moderate</p>
          </div>
        </div>

        {/* UV Index (Mock Data) */}
        <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-gray-600 animate-pulse-slow" />
            <p className="text-sm font-semibold text-gray-700">UV Index</p>
          </div>
          <div className="animate-fade-in">
            <p className="text-lg font-bold text-gray-900">{uvInfo.value}</p>
            <p className={`text-xs font-medium ${uvInfo.color}`}>
              {uvInfo.level} exposure
            </p>
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      {weather?.current?.condition?.toLowerCase().includes('thunderstorm') ||
       weather?.current?.condition?.toLowerCase().includes('heavy rain') ||
       weather?.current?.condition?.toLowerCase().includes('severe') ? (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse-slow">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span className="text-sm font-medium">
              Severe Weather Alert: Take precautions and avoid unnecessary travel
            </span>
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 mt-4">
        Last updated: {new Date().toLocaleString()}
        {weather?.location?.name && (
          <span className="ml-2">
            • Location: {weather.location.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default WeatherDetailsCard;
