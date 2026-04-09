// Missing Person Status (matches backend enum)
export const MISSING_PERSON_STATUS = [
  { value: 'Active', label: 'Missing', color: 'red' },
  { value: 'Found', label: 'Found', color: 'green' },
  { value: 'Closed', label: 'Closed', color: 'gray' }
];

// Priority Levels (matches backend enum)
export const PRIORITY_LEVELS = [
  { value: 'Low', label: 'Low Priority', color: 'blue' },
  { value: 'Medium', label: 'Medium Priority', color: 'yellow' },
  { value: 'High', label: 'High Priority', color: 'orange' },
  { value: 'Critical', label: 'Critical', color: 'red' }
];

// Gender Options (matches backend enum)
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', icon: 'M' },
  { value: 'Female', label: 'Female', icon: 'F' },
  { value: 'Other', label: 'Other', icon: 'O' }
];

// Age Groups
export const AGE_GROUPS = [
  { value: 'infant', label: 'Infant (0-2)', minAge: 0, maxAge: 2 },
  { value: 'child', label: 'Child (3-12)', minAge: 3, maxAge: 12 },
  { value: 'teenager', label: 'Teenager (13-17)', minAge: 13, maxAge: 17 },
  { value: 'adult', label: 'Adult (18-64)', minAge: 18, maxAge: 64 },
  { value: 'senior', label: 'Senior (65+)', minAge: 65, maxAge: 150 }
];

// Physical Attributes
export const PHYSICAL_ATTRIBUTES = [
  { key: 'height', label: 'Height', placeholder: 'e.g., 5\'8" or 173 cm' },
  { key: 'weight', label: 'Weight', placeholder: 'e.g., 70 kg or 154 lbs' },
  { key: 'hairColor', label: 'Hair Color', placeholder: 'e.g., Black, Brown, Blonde' },
  { key: 'eyeColor', label: 'Eye Color', placeholder: 'e.g., Brown, Blue, Green' }
];

// Special Marks/Distinguishing Features
export const SPECIAL_MARKS = [
  { key: 'tattoos', label: 'Tattoos' },
  { key: 'scars', label: 'Scars' },
  { key: 'birthmarks', label: 'Birthmarks' },
  { key: 'piercings', label: 'Piercings' },
  { key: 'glasses', label: 'Wears Glasses' },
  { key: 'facialHair', label: 'Facial Hair' },
  { key: 'limp', label: 'Limp' },
  { key: 'speech', label: 'Speech Impediment' }
];

// Clothing Description Categories
export const CLOTHING_CATEGORIES = [
  'shirt', 'pants', 'dress', 'shoes', 'jacket', 'hat', 'accessories'
];

// Last Seen Location Types
export const LAST_SEEN_LOCATIONS = [
  'Home', 'School', 'Work', 'Hospital', 'Public Place', 'Vehicle', 'Other'
];

// Time Ranges for Filtering
export const TIME_RANGES = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' }
];

// Search and Sort Options
export const SEARCH_SORT_OPTIONS = [
  { value: '-createdAt', label: 'Most Recent' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'priority', label: 'Priority Level' },
  { value: 'fullName', label: 'Name (A-Z)' },
  { value: '-fullName', label: 'Name (Z-A)' },
  { value: 'lastSeenDate', label: 'Last Seen Date' },
  { value: '-lastSeenDate', label: 'Last Seen Date (Newest)' }
];

// Validation Rules
export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-\.']+$/
  },
  age: {
    required: true,
    min: 0,
    max: 150
  },
  phone: {
    required: true,
    pattern: /^[0-9]{10}$/,
    message: 'Please provide a valid 10-digit phone number'
  },
  email: {
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    message: 'Please provide a valid email address'
  }
};

// Image Configuration
export const IMAGE_CONFIG = {
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES: 3,
  PLACEHOLDER_URL: '/images/placeholder-person.jpg'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_REPORT: 'new_report',
  STATUS_UPDATE: 'status_update',
  SIGHTING: 'sighting',
  FOUND: 'found',
  CLOSED: 'closed'
};

// Emergency Contact Types
export const EMERGENCY_CONTACT_TYPES = [
  'Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'
];

// Storage Keys
export const STORAGE_KEYS = {
  missingPersonFilters: 'rescueNet_missingPersonFilters',
  savedMissingPersons: 'rescueNet_savedMissingPersons',
  searchHistory: 'rescueNet_missingPersonSearchHistory',
  notifications: 'rescueNet_missingPersonNotifications'
};

// Default Filters
export const DEFAULT_FILTERS = {
  status: '',
  priority: '',
  gender: '',
  ageGroup: '',
  dateRange: '',
  dateFrom: '',
  dateTo: '',
  sortBy: '-createdAt',
  hasPhoto: false,
  urgentOnly: false
};

// API Endpoints
export const API_ENDPOINTS = {
  MISSING_PERSONS: '/api/missing-persons',
  MISSING_PERSON: '/api/missing-persons/:id',
  STATISTICS: '/api/missing-persons/statistics',
  SEARCH_LOCATION: '/api/missing-persons/search-location',
  SIGHTINGS: '/api/missing-persons/:id/sightings'
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 7.8731, lng: 80.7718 }, // Sri Lanka center
  DEFAULT_ZOOM: 8,
  CLUSTER_MAX_ZOOM: 15,
  SEARCH_RADIUS: 10 // km
};

// Export all constants as a single object for easy importing
export const MISSING_PERSON_CONSTANTS = {
  STATUS: MISSING_PERSON_STATUS,
  PRIORITY: PRIORITY_LEVELS,
  GENDER: GENDER_OPTIONS,
  AGE_GROUPS,
  PHYSICAL_ATTRIBUTES,
  SPECIAL_MARKS,
  CLOTHING_CATEGORIES,
  LOCATIONS: LAST_SEEN_LOCATIONS,
  TIME_RANGES,
  SORT_OPTIONS: SEARCH_SORT_OPTIONS,
  VALIDATION: VALIDATION_RULES,
  IMAGE: IMAGE_CONFIG,
  NOTIFICATIONS: NOTIFICATION_TYPES,
  CONTACT_TYPES: EMERGENCY_CONTACT_TYPES,
  STORAGE: STORAGE_KEYS,
  FILTERS: DEFAULT_FILTERS,
  API: API_ENDPOINTS,
  MAP: MAP_CONFIG
};

export const EMERGENCY_CONTACTS = {
  POLICE: '119',
  CHILDLINE: '1929',
  DISASTER_MANAGEMENT: '1170',
  HOSPITAL: '110',
};
