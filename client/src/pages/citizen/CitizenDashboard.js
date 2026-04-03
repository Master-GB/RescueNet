import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../layouts/DashboardLayout";
import AreaSituationBanner from "../../components/citizenDashboard/AreaSituationBanner";
import QuickActionCard from "../../components/citizenDashboard/QuickActionCard";
import ShelterCard from "../../components/citizenDashboard/ShelterCard";
import SectionHeader from "../../components/citizenDashboard/SectionHeader";
import CurrentLocationCard from "../../components/citizenDashboard/CurrentLocationCard";
import WeatherDetailsCard from "../../components/citizenDashboard/WeatherDetailsCard";
import RecentNotifications from "../../components/citizenDashboard/RecentNotifications";
import ShelterMap from "../../components/citizenDashboard/ShelterMap";
import locationService from '../../services/locationService.js';
import { AlertTriangle, Shield, Phone, Radio, Heart, Zap } from "lucide-react";

const CitizenDashboard = () => {
  const [sosProgress, setSosProgress] = useState(0);
  const [isSosActive, setIsSosActive] = useState(false);
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Fetch nearby shelters when location is available
  useEffect(() => {
    const fetchNearbyShelters = async (location) => {
      try {
        const { lat, lng } = location;
        
        const response = await fetch(`/api/shelters/get-nearby?lat=${lat}&lng=${lng}&radiusKm=20`);
        if (response.ok) {
          const data = await response.json();
          // Get only the closest 4 shelters
          const closestShelters = (data.shelters || []).slice(0, 4);
          setNearbyShelters(closestShelters);
        }
      } catch (error) {
        console.error('Failed to fetch nearby shelters:', error);
      }
    };

    // Subscribe to location updates
    const unsubscribe = locationService.subscribe((location) => {
      setCurrentLocation(location);
      fetchNearbyShelters(location);
    });

    // Initialize location if not already done
    if (!locationService.getLocation()) {
      locationService.getCurrentLocation();
    } else {
      // Use existing location
      const existingLocation = locationService.getLocation();
      setCurrentLocation(existingLocation);
      fetchNearbyShelters(existingLocation);
    }

    return unsubscribe;
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
    // Navigate to shelter details page or open modal
  };

  return (
    <DashboardLayout>
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
        <section>
          <SectionHeader
            title="Emergency Actions"
            subtitle="Critical actions for emergency situations"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <QuickActionCard
              title="Emergency SOS"
              description="Send immediate distress signal with your location to all emergency responders."
              buttonText={isSosActive ? "Cancel SOS" : "Activate SOS"}
              variant="emergency"
              icon={AlertTriangle}
              status={isSosActive ? "Signal Active" : "Ready"}
              progress={sosProgress > 0 ? sosProgress : undefined}
              onClick={handleSosClick}
            />
            <QuickActionCard
              title="Find Shelter"
              description="Locate nearby safe shelters with real-time availability and capacity information."
              buttonText="Find Shelters"
              variant="primary"
              icon={Shield}
              status="Available"
              onClick={() => console.log("Find shelters clicked")}
            />
            <QuickActionCard
              title="Emergency Call"
              description="Quick dial emergency services and saved contacts with one-touch access."
              buttonText="Call Emergency"
              variant="success"
              icon={Phone}
              status="Ready"
              onClick={() => console.log("Emergency call clicked")}
            />
            <QuickActionCard
              title="First Aid Guide"
              description="Access critical medical procedures and emergency first aid instructions instantly."
              buttonText="Open Guide"
              variant="warning"
              icon={Heart}
              status="Interactive"
              onClick={() => console.log("First aid guide clicked")}
            />
          </div>
        </section>

        {/* Shelters + activity */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <SectionHeader
              title="Recommended Shelters"
              subtitle="Suggested shelters based on your area and availability"
              actionText="See all"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyShelters.map((shelter) => (
                <ShelterCard
                  key={shelter.id}
                  shelterId={shelter.id}
                  onShelterClick={handleShelterClick}
                />
              ))}
              {nearbyShelters.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No nearby shelters found</p>
                  <p className="text-sm text-slate-500 mt-1">Check back later or expand your search area</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <SectionHeader
              title="Recent Notifications"
              subtitle="Latest emergency alerts and updates"
            />

            <RecentNotifications />
          </div>
        </section>

        {/* Shelter Map */}
        <section>
          <SectionHeader
            title="Shelter Map"
            subtitle="All verified shelters with real-time capacity information"
          />
          <ShelterMap />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;