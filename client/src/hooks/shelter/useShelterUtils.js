import { useEffect } from 'react';

export const useShelterUtils = () => {
  // Get capacity color based on shelter status and occupancy
  const getCapacityColor = (shelter) => {
    if (shelter.status?.toLowerCase() === 'closed') return '#EF4444';
    if (shelter.status?.toLowerCase() === 'full') return '#EAB308';
    if (!shelter.occupancy?.current || !shelter.capacity?.total) return '#22C55E';
    
    const percentage = (shelter.occupancy?.current / shelter.capacity.total) * 100;
    if (percentage >= 90) return '#EAB308';
    return '#22C55E';
  };

  // Create custom icon for shelters (Leaflet divIcon)
  const createShelterIcon = (shelter, L) => {
    const color = getCapacityColor(shelter);
    const percentage = shelter.occupancy?.current && shelter.capacity?.total 
      ? Math.round((shelter.occupancy.current / shelter.capacity.total) * 100)
      : 0;

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
            <rect x="6" y="12" width="12" height="10" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="1.5"/>
            <path d="M3 12L12 3L21 12" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="1.5"/>
            <path d="M9 20V14H15V20" 
                  fill="white" 
                  opacity="0.8"/>
            <rect x="10" y="15" width="4" height="7" 
                  fill="white" 
                  opacity="0.8"/>
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
      popupAnchor: [0, -18],
    });
  };

  return {
    getCapacityColor,
    createShelterIcon,
  };
};
