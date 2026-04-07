import { useEffect, useContext } from 'react';
import { ShelterContext } from '../../contexts/shelter/ShelterContext';

export const useFilteredShelters = (
  allSheltersOriginal,
  nearbySheltersOriginal,
  allFilters,
  nearbyFilters,
  allSearchTerm,
  nearbySearchTerm,
  activeTab
) => {
  const {
    allShelters,
    setAllShelters,
    nearbyShelters,
    setNearbyShelters,
  } = useContext(ShelterContext);

  // Apply search and filters based on active tab
  useEffect(() => {
    let filtered = activeTab === 'all' ? allSheltersOriginal : nearbySheltersOriginal;
    const searchTerm = activeTab === 'all' ? allSearchTerm : nearbySearchTerm;
    const filters = activeTab === 'all' ? allFilters : nearbyFilters;
    
    console.log('Filtering - Active Tab:', activeTab);
    console.log('Filtering - Original Data Count:', filtered.length);
    console.log('Filtering - Search Term:', searchTerm);
    console.log('Filtering - Filters:', filters);
    
    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(shelter =>
        shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.address?.province?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(shelter => shelter.status === filters.status);
    }
    if (filters.shelterType) {
      filtered = filtered.filter(shelter => shelter.shelterType === filters.shelterType);
    }
    if (filters.province) {
      filtered = filtered.filter(shelter => shelter.address?.province === filters.province);
    }
    if (filters.city) {
      filtered = filtered.filter(shelter => shelter.address?.city?.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.disasterTypes && filters.disasterTypes.length > 0) {
      console.log('Disaster Types Filter Applied:', filters.disasterTypes);
      filtered = filtered.filter(shelter => {
        console.log('Shelter disaster types:', shelter.supports?.disasterTypes);
        return filters.disasterTypes.some(type => shelter.supports?.disasterTypes?.includes(type))
      });
      console.log('After disaster type filter count:', filtered.length);
    }
    if (filters.hasFood === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.food === true);
    }
    if (filters.hasWater === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.water === true);
    }
    if (filters.hasMedical === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.medical === true);
    }
    if (filters.hasElectricity === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.electricity === true);
    }
    if (filters.hasWifi === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.wifi === true);
    }
    if (filters.hasParking === 'true') {
      filtered = filtered.filter(shelter => shelter.supportFeatures?.parking === true);
    }
    if (filters.hasPetFriendly === 'true') {
      filtered = filtered.filter(shelter => shelter.specialSupport?.petFriendly === true);
    }
    if (filters.hasAccessibility === 'true') {
      filtered = filtered.filter(shelter => shelter.specialSupport?.accessibility === true);
    }
    if (filters.hasChildCare === 'true') {
      filtered = filtered.filter(shelter => shelter.specialSupport?.childCare === true);
    }

    console.log('Filtering - Final Filtered Count:', filtered.length);

    // Update the appropriate shelter list
    if (activeTab === 'all') {
      setAllShelters(filtered);
    } else {
      setNearbyShelters(filtered);
    }
  }, [allSheltersOriginal, nearbySheltersOriginal, allSearchTerm, nearbySearchTerm, allFilters, nearbyFilters, activeTab, setAllShelters, setNearbyShelters]);

  return {
    allShelters,
    nearbyShelters,
  };
};
