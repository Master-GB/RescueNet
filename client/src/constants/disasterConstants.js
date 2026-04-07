export const DISASTER_TYPES = [
  { key: 'EARTHQUAKE', label: 'Earthquake', color: 'amber' },
  { key: 'FIRE', label: 'Fire', color: 'orange' },
  { key: 'FLOOD', label: 'Flood', color: 'blue' },
  { key: 'TSUNAMI', label: 'Tsunami', color: 'cyan' },
  { key: 'CYCLONE', label: 'Cyclone', color: 'violet' },
  { key: 'STORM', label: 'Storm', color: 'indigo' },
  { key: 'VOLCANO', label: 'Volcano', color: 'red' },
  { key: 'DROUGHT', label: 'Drought', color: 'yellow' },
  { key: 'WILDFIRE', label: 'Wildfire', color: 'rose' },
];

export const DEFAULT_BBOX = {
  minLng: 79.5,
  minLat: 5.7,
  maxLng: 82.1,
  maxLat: 10.0,
};

export const DEFAULT_CENTER = {
  lat: 7.8731,
  lng: 80.7718,
};

export const DEFAULT_ZOOM = 7;

export const STORAGE_KEYS = {
  subscriptions: 'disasterSubscriptions',
};
