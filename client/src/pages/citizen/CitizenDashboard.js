import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from "../../layouts/DashboardLayout";
import AreaSituationBanner from "../../components/citizenDashboard/AreaSituationBanner";
import QuickActionCard from "../../components/citizenDashboard/QuickActionCard";
import ShelterCard from "../../components/citizenDashboard/ShelterCard";
import SectionHeader from "../../components/citizenDashboard/SectionHeader";
import CurrentLocationCard from "../../components/citizenDashboard/CurrentLocationCard";
import WeatherDetailsCard from "../../components/citizenDashboard/WeatherDetailsCard";
import ShelterMap from "../../components/citizenDashboard/ShelterMap";
import locationService from '../../services/locationService.js';
import { DISASTER_TYPES } from '../../constants/disasterConstants';
import { AlertTriangle, Shield, Phone, Radio, Heart, Zap, MapPin, Users, Mail, Accessibility, Baby, Wifi, AlertCircle, X, ExternalLink, Loader2, Newspaper, Filter, ChevronDown, Check } from "lucide-react";

// Constants for shelter types and features
const SUPPORT_FEATURES = [
  { key: 'wheelchairAccess', label: 'Wheelchair Access', icon: Accessibility },
  { key: 'medical', label: 'Medical Support', icon: Shield },
  { key: 'food', label: 'Food Available', icon: Heart },
  { key: 'power', label: 'Power Available', icon: Wifi },
];

const SPECIAL_SUPPORTS = [
  { key: 'petFriendly', label: 'Pet Friendly', icon: Heart },
  { key: 'childFriendly', label: 'Child Friendly', icon: Baby },
  { key: 'elderlySupport', label: 'Elderly Support', icon: Users },
];

// Location constants
const PROVINCES = [
  'Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
];

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [sosProgress, setSosProgress] = useState(0);
  const [isSosActive, setIsSosActive] = useState(false);
  const [savedShelters, setSavedShelters] = useState([]);
  const [allShelters, setAllShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false);
  const [reliefWebUpdates, setReliefWebUpdates] = useState(null);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [updatesError, setUpdatesError] = useState(null);
  const [updatesFilter, setUpdatesFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debug savedShelters changes
  useEffect(() => {
    console.log('🔄 Dashboard: savedShelters state updated:', savedShelters);
  }, [savedShelters]);

  // Fetch all shelters and saved shelters on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Dashboard: Starting saved shelters fetch...');
        
        // Fetch all shelters first (using correct endpoint like ShelterPage)
        const sheltersResponse = await fetch('/api/shelters/get-list');
        console.log('📡 Dashboard: Shelters API response status:', sheltersResponse.status);
        
        if (sheltersResponse.ok) {
          const sheltersData = await sheltersResponse.json();
          console.log('🔍 Dashboard: Raw API response:', sheltersData);
          
          // Handle different response structures
          let allSheltersData = [];
          if (sheltersData.success && sheltersData.data) {
            allSheltersData = sheltersData.data;
          } else if (Array.isArray(sheltersData)) {
            allSheltersData = sheltersData;
          } else if (sheltersData.shelters) {
            allSheltersData = sheltersData.shelters;
          }
          
          console.log('📊 Dashboard: Processed shelters data:', allSheltersData);
          console.log('📊 Dashboard: All shelters count:', allSheltersData.length);
          setAllShelters(allSheltersData);

          // Get saved shelters from localStorage
          const savedShelterIds = JSON.parse(localStorage.getItem('savedShelters') || '[]');
          console.log('💾 Dashboard: Saved shelter IDs from localStorage:', savedShelterIds);
          
          // Filter saved shelters from all shelters data (same approach as ShelterPage)
          if (savedShelterIds.length > 0 && allSheltersData.length > 0) {
            const savedSheltersData = allSheltersData.filter(shelter => 
              savedShelterIds.includes(shelter._id)
            ).slice(0, 4); // Limit to 4 saved shelters
            
            console.log('🏠 Dashboard: Filtered saved shelters:', savedSheltersData);
            setSavedShelters(savedSheltersData);
          } else {
            console.log('⚠️ Dashboard: No saved shelters found or no all shelters data');
            setSavedShelters([]);
          }
        } else {
          console.error('❌ Dashboard: Failed to fetch shelters:', sheltersResponse.statusText);
        }
      } catch (error) {
        console.error('❌ Dashboard: Failed to fetch saved shelters:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch RelifWeb API updates
  useEffect(() => {
    const fetchRelifWebUpdates = async () => {
      try {
        setUpdatesLoading(true);
        setUpdatesError(null);
        const response = await fetch('/api/disasters/updates?q=Sri%20Lanka&limit=20');
        const data = await response.json();
        if (data.success) {
          setReliefWebUpdates(data.data);
        } else {
          setUpdatesError('Failed to fetch updates');
        }
      } catch (error) {
        console.error('❌ Dashboard: Failed to fetch RelifWeb updates:', error);
        setUpdatesError(error.message);
      } finally {
        setUpdatesLoading(false);
      }
    };

    fetchRelifWebUpdates();
    const interval = setInterval(fetchRelifWebUpdates, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSosClick = () => {
    setIsSosActive(!isSosActive);
    if (!isSosActive) {
      // Start progress animation
      const interval = setInterval(() => {
        setSosProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } else {
      setSosProgress(0);
    }
  };

  const handleShelterClick = (shelter) => {
    console.log('View shelter details:', shelter);
    console.log('Shelter data structure:', shelter);
    setSelectedShelter(shelter); // Open modal
  };

  // Filter logic for ReliefWeb updates
  const filteredUpdates = useMemo(() => {
    if (!reliefWebUpdates) return { reports: [], disasters: [] };
    
    const reports = reliefWebUpdates.reports || [];
    const disasters = reliefWebUpdates.disasters || [];
    
    const toItem = (x, kind) => ({
      id: `${kind}-${x.id}`,
      kind,
      title: x.title,
      url: x.url,
      date: x.date,
      countries: x.countries || [],
      disasterTypes: x.disasterTypes || [],
    });

    let allItems = [...reports.map((r) => toItem(r, 'report')), ...disasters.map((d) => toItem(d, 'disaster'))]
      .filter((x) => x.title)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

    // Apply disaster type filter
    if (updatesFilter !== 'all') {
      const filteredItems = allItems.filter((item) => {
        // Always filter by title since disasterTypes will be empty (no category field in ReliefWeb v2)
        const titleLower = item.title.toLowerCase();
        const filterLower = updatesFilter.toLowerCase();
        
        const disasterVariations = {
          'earthquake': ['earthquake', 'quake', 'seismic', 'tremor'],
          'fire': ['fire', 'wildfire', 'burn', 'flame', 'blaze'],
          'flood': ['flood', 'flooding', 'water', 'inundation'],
          'tsunami': ['tsunami', 'tidal wave', 'sea wave'],
          'cyclone': ['cyclone', 'storm', 'hurricane', 'typhoon'],
          'landslide': ['landslide', 'mudslide', 'rockslide'],
          'volcano': ['volcano', 'volcanic', 'eruption', 'lava'],
          'drought': ['drought', 'dry', 'arid'],
          'wildfire': ['wildfire', 'fire', 'burn', 'flame', 'blaze'],
        };
        
        const variations = disasterVariations[filterLower] || [filterLower];
        const titleMatch = variations.some(variation => titleLower.includes(variation));
        
        return titleMatch;
      });
      
      allItems = filteredItems;
    }

    // Separate back into reports and disasters
    const filteredReports = allItems.filter(item => item.kind === 'report');
    const filteredDisasters = allItems.filter(item => item.kind === 'disaster');
    
    return {
      reports: filteredReports.slice(0, 5),
      disasters: filteredDisasters.slice(0, 5)
    };
  }, [reliefWebUpdates, updatesFilter]);

  const selectedFilter = useMemo(() => {
    if (updatesFilter === 'all') return { label: 'All Updates', icon: Filter, color: 'gray' };
    const disasterType = DISASTER_TYPES.find(t => t.key.toLowerCase() === updatesFilter.toLowerCase());
    return disasterType ? { 
      label: disasterType.label, 
      icon: Filter, 
      color: disasterType.color 
    } : { label: 'All Updates', icon: Filter, color: 'gray' };
  }, [updatesFilter]);

  const handleFilterSelect = (value) => {
    setUpdatesFilter(value);
    setIsDropdownOpen(false);
  };

  const clearFilter = () => {
    setUpdatesFilter('all');
    setIsDropdownOpen(false);
  };

  return (
    <DashboardLayout>
      {/* Emergency Call Popup */}
      {showEmergencyPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl transform animate-pulse">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-600 to-red-700 p-4 text-white rounded-t-3xl">
              <button
                onClick={() => setShowEmergencyPopup(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Phone className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">Emergency Call</h2>
                  <p className="text-white/90 text-xs">Dial emergency services immediately</p>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="p-4 space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
                  <span className="text-3xl font-bold text-red-600">119</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Services</h3>
                <p className="text-gray-600 text-center text-sm">
                  Click the button below to dial emergency services (119) immediately
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = 'tel:119'}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Phone className="w-5 h-5 inline mr-2" />
                  Call 119 Now
                </button>
                
                <button
                  onClick={() => setShowEmergencyPopup(false)}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <h4 className="text-base font-bold text-yellow-800 mb-2">Important Notice</h4>
                <p className="text-yellow-700 text-xs">
                  This is for emergency situations only. Please use responsibly.
                </p>
                <p className="text-yellow-700 text-xs font-medium">
                  ⚠️ False emergency calls may result in legal consequences.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Shelter Detail Modal - Outside main container for full coverage */}
      {selectedShelter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setSelectedShelter(null)} 
                  className="text-white/80 hover:text-white bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:bg-white/30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedShelter.name}</h2>
                  <div className="flex items-center space-x-4 text-white/90">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                      selectedShelter.status === 'OPEN' ? 'bg-green-500/30 text-green-100' :
                      selectedShelter.status === 'FULL' ? 'bg-yellow-500/30 text-yellow-100' : 'bg-red-500/30 text-red-100'
                    }`}>
                      {selectedShelter.status || 'OPEN'}
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedShelter.address?.city}, {selectedShelter.address?.province}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-emerald-700" />
                    <span className="text-2xl font-bold text-emerald-900">
                      {selectedShelter.occupancy?.current || 0}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-600">Current Occupancy</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-blue-700" />
                    <span className="text-2xl font-bold text-blue-900">
                      {selectedShelter.capacity?.total || 0}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600">Total Capacity</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-amber-700" />
                    <span className="text-2xl font-bold text-amber-900">
                      {Math.max(0, (selectedShelter.capacity?.total || 0) - (selectedShelter.occupancy?.current || 0))}
                    </span>
                  </div>
                  <p className="text-sm text-amber-600">Available Spaces</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-2xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Phone className="w-6 h-6 text-purple-700" />
                    <span className="text-lg font-bold text-purple-900">
                      {selectedShelter.contact?.phone || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-purple-600">Contact</p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Shelter</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedShelter.description || 'No description available.'}
                </p>
              </div>

              {/* Address & Contact */}
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location & Contact
                </h3>
                
                {/* Full Address */}
                <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 mb-1">Full Address</div>
                      <div className="text-gray-900 font-medium">
                        {selectedShelter.address?.street && `${selectedShelter.address.street}, `}
                        {selectedShelter.address?.city && `${selectedShelter.address?.city}, `}
                        {selectedShelter.address?.province && `${selectedShelter.address?.province} `}
                        {selectedShelter.address?.postalCode && `${selectedShelter.address?.postalCode}`}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Phone Number</div>
                        <div className="text-gray-900 font-medium">{selectedShelter.contact?.phone || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">Email Address</div>
                        <div className="text-gray-900 font-medium">{selectedShelter.contact?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedShelter.supports?.medical && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Medical Support</span>
                    </div>
                  )}
                  {selectedShelter.supports?.food && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Heart className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Food & Water</span>
                    </div>
                  )}
                  {selectedShelter.supports?.power && (
                    <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Heart className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Power Supply</span>
                    </div>
                  )}
                  {selectedShelter.supports?.wheelchairAccess && (
                    <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Heart className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Wheelchair Access</span>
                    </div>
                  )}
                  {selectedShelter.supports?.petFriendly && (
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <Heart className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Pet Friendly</span>
                    </div>
                  )}
                  {selectedShelter.supports?.childFriendly && (
                    <div className="flex items-center space-x-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <span className="text-sm font-medium text-pink-800">Child Friendly</span>
                    </div>
                  )}
                  {selectedShelter.supports?.elderlySupport && (
                    <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <Heart className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-800">Elderly Support</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Support */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-600" />
                  Special Support
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SPECIAL_SUPPORTS.map(support => (
                    <div 
                      key={support.key} 
                      className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedShelter.specialSupport?.[support.key] 
                          ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      <support.icon className="w-5 h-5" />
                      <span>{support.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedShelter(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = '/citizen/shelters'}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  View All Shelters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Area Situation Banner - Top Priority */}
        <AreaSituationBanner />

        {/* Location and Weather Information - Two Separate Cards */}
        <section>
          <SectionHeader
            title="Location & Weather Information"
            subtitle="Real-time location and weather details for your area"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrentLocationCard />
            <WeatherDetailsCard />
          </div>
        </section>

        {/* Emergency Quick Actions */}
        <section className='mt-10'>
          <SectionHeader
            title="Emergency Actions"
            subtitle="Critical actions for emergency situations"

          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <QuickActionCard
              title="Request Help"
              description="Request assistance for  emergency situations, or medical help needed."
              buttonText="Request Help"
              variant="emergency"
              icon={Radio}
              status="Available"
              onClick={() => navigate('/citizen/help-request')}
            />
            <QuickActionCard
              title="Find Shelter"
              description="Locate nearby safe shelters with real-time availability and capacity information."
              buttonText="Find Shelters"
              variant="primary"
              icon={Shield}
              status="Available"
              onClick={() => navigate('/citizen/shelters')}
            />
            <QuickActionCard
              title="Emergency Call"
              description="Quick dial emergency services and saved contacts with one-touch access."
              buttonText="Call Emergency"
              variant="success"
              icon={Phone}
              status="Ready"
              onClick={() => setShowEmergencyPopup(true)}
            />
            <QuickActionCard
              title="First Aid Guide"
              description="Access critical medical procedures and emergency first aid instructions instantly."
              buttonText="Open Guide"
              variant="warning"
              icon={Heart}
              status="Interactive"
              onClick={() => navigate('/citizen/first-aid-guide')}
            />
          </div>
        </section>

        {/* Shelters + activity */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <SectionHeader
              title="Saved Shelters"
              subtitle="Your saved shelters for quick access"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedShelters.map((shelter) => (
                <ShelterCard
                  key={shelter._id}
                  shelterId={shelter._id}
                  onShelterClick={handleShelterClick}
                />
              ))}
              {savedShelters.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No saved shelters found</p>
                  <p className="text-sm text-slate-500 mt-1">Save shelters to see them here for quick access</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionHeader
              title="Disaster Updates"
              subtitle="Latest disaster reports and alerts from RelifWeb"
            />

            <div className="rounded-3xl border border-gray-200 bg-white/70 backdrop-blur-md shadow-sm overflow-hidden">
              {/* Header with Enhanced Filter */}
              <div className="px-6 py-4 border-b border-gray-200/70">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Newspaper className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">Live Updates</div>
                      <div className="text-xs text-gray-500 font-semibold">ReliefWeb real-time feed</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {updatesLoading ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full font-semibold">
                        {filteredUpdates.reports.length + filteredUpdates.disasters.length} items
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-${selectedFilter.color}-100 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <selectedFilter.icon className={`w-4 h-4 text-${selectedFilter.color}-600`} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">{selectedFilter.label}</div>
                        <div className="text-xs text-gray-500">Filter by disaster type</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {updatesFilter !== 'all' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFilter();
                          }}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-2">
                          <button
                            onClick={() => handleFilterSelect('all')}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                              updatesFilter === 'all' 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                                <Filter className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-semibold">All Updates</span>
                            </div>
                            {updatesFilter === 'all' && <Check className="w-4 h-4 text-blue-600" />}
                          </button>
                          
                          <div className="border-t border-gray-100 my-2"></div>
                          
                          {DISASTER_TYPES.map(type => {
                            const isActive = updatesFilter === type.key.toLowerCase();
                            
                            return (
                              <button
                                key={type.key}
                                onClick={() => handleFilterSelect(type.key.toLowerCase())}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                                  isActive 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-xl bg-${type.color}-100 flex items-center justify-center`}>
                                    <span className="text-sm font-bold text-${type.color}-700">{type.label[0]}</span>
                                  </div>
                                  <div className="text-left">
                                    <span className="font-semibold">{type.label}</span>
                                  </div>
                                </div>
                                {isActive && <Check className="w-4 h-4 text-blue-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-3 max-h-[500px] overflow-y-auto">
                {updatesLoading ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Loading disaster updates...</span>
                  </div>
                ) : updatesError ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{updatesError}</span>
                  </div>
                ) : filteredUpdates ? (
                  <>
                    {filteredUpdates.reports && filteredUpdates.reports.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Newspaper className="w-4 h-4 text-blue-600" />
                          </div>
                          Reports
                          <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            {filteredUpdates.reports.length}
                          </span>
                        </h4>
                        <div className="space-y-3">
                          {filteredUpdates.reports.map((report, idx) => (
                            <a
                              key={`report-${idx}`}
                              href={report.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                  <ExternalLink className="w-3 h-3 text-blue-600" />
                                  <span className="text-xs text-blue-600 font-medium">View</span>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                  <Newspaper className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                                    {report.title}
                                  </h5>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                      <span>Report</span>
                                    </div>
                                    <span>·</span>
                                    <span>{report.date}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {filteredUpdates.disasters && filteredUpdates.disasters.length > 0 && (
                      <div className={filteredUpdates.reports && filteredUpdates.reports.length > 0 ? 'border-t border-gray-200 pt-6' : ''}>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          </div>
                          Disaster Alerts
                          <span className="ml-2 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                            {filteredUpdates.disasters.length}
                          </span>
                        </h4>
                        <div className="space-y-3">
                          {filteredUpdates.disasters.map((disaster, idx) => (
                            <a
                              key={`disaster-${idx}`}
                              href={disaster.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative block p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                  <ExternalLink className="w-3 h-3 text-amber-600" />
                                  <span className="text-xs text-amber-600 font-medium">View</span>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
                                    {disaster.title}
                                  </h5>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                                      <span>Alert</span>
                                    </div>
                                    <span>·</span>
                                    <span>{disaster.date}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!filteredUpdates.reports || filteredUpdates.reports.length === 0) && 
                     (!filteredUpdates.disasters || filteredUpdates.disasters.length === 0) && (
                      <div className="flex items-center justify-center py-8 text-gray-500">
                        <p>
                          {updatesFilter === 'all' ? 'No updates available.' : `No ${selectedFilter.label} updates found.`}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <p>No updates loaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Shelter Map */}
        <section>
          <SectionHeader
            title="Shelter Map"
            subtitle="All verified shelters with real-time capacity information"
            actionText="Find More Shelters Data"
            onActionClick={() => window.location.href = '/citizen/shelters'}
          />
          <ShelterMap />
        </section>

        {/* Shelter Detail Modal */}
        {selectedShelter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setSelectedShelter(null)} 
                    className="text-white/80 hover:text-white bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:bg-white/30"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedShelter.name}</h2>
                    <div className="flex items-center space-x-4 text-white/90">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                        selectedShelter.status === 'OPEN' ? 'bg-green-500/30 text-green-100' :
                        selectedShelter.status === 'FULL' ? 'bg-yellow-500/30 text-yellow-100' : 'bg-red-500/30 text-red-100'
                      }`}>
                        {selectedShelter.status || 'OPEN'}
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedShelter.address?.city}, {selectedShelter.address?.province}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-emerald-700" />
                      <span className="text-2xl font-bold text-emerald-900">
                        {selectedShelter.occupancy?.current || 0}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-600">Current Occupancy</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-blue-700" />
                      <span className="text-2xl font-bold text-blue-900">
                        {selectedShelter.capacity?.total || 0}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600">Total Capacity</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-amber-700" />
                      <span className="text-2xl font-bold text-amber-900">
                        {Math.max(0, (selectedShelter.capacity?.total || 0) - (selectedShelter.occupancy?.current || 0))}
                      </span>
                    </div>
                    <p className="text-sm text-amber-600">Available Spaces</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-2xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <Phone className="w-6 h-6 text-purple-700" />
                      <span className="text-lg font-bold text-purple-900">
                        {selectedShelter.contact?.phone || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-purple-600">Contact</p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Shelter</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedShelter.description || 'No description available.'}
                  </p>
                </div>

                {/* Address & Contact */}
                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Location & Contact
                  </h3>
                  
                  {/* Full Address */}
                  <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600 mb-1">Full Address</div>
                        <div className="text-gray-900 font-medium">
                          {selectedShelter.address?.street && `${selectedShelter.address.street}, `}
                          {selectedShelter.address?.city && `${selectedShelter.address?.city}, `}
                          {selectedShelter.address?.province && `${selectedShelter.address?.province} `}
                          {selectedShelter.address?.postalCode && `${selectedShelter.address?.postalCode}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Phone Number</div>
                          <div className="text-gray-900 font-medium">{selectedShelter.contact?.phone || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Email Address</div>
                          <div className="text-gray-900 font-medium">{selectedShelter.contact?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedShelter.supports?.medical && (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Medical Support</span>
                      </div>
                    )}
                    {selectedShelter.supports?.food && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Heart className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Food & Water</span>
                      </div>
                    )}
                    {selectedShelter.supports?.power && (
                      <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Heart className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Power Supply</span>
                      </div>
                    )}
                    {selectedShelter.supports?.wheelchairAccess && (
                      <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Heart className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Wheelchair Access</span>
                      </div>
                    )}
                    {selectedShelter.supports?.petFriendly && (
                      <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Heart className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Pet Friendly</span>
                      </div>
                    )}
                    {selectedShelter.supports?.childFriendly && (
                      <div className="flex items-center space-x-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <Heart className="w-5 h-5 text-pink-600" />
                        <span className="text-sm font-medium text-pink-800">Child Friendly</span>
                      </div>
                    )}
                    {selectedShelter.supports?.elderlySupport && (
                      <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <Heart className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-800">Elderly Support</span>
                      </div>
                    )}
                  </div>
                </div>

                
                {/* Special Support */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    Special Support
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SPECIAL_SUPPORTS.map(support => (
                      <div 
                        key={support.key} 
                        className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedShelter.specialSupport?.[support.key] 
                            ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        <support.icon className="w-5 h-5" />
                        <span>{support.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedShelter(null)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.location.href = '/citizen/shelters'}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    View All Shelters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;