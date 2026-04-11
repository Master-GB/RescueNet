// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Endpoints
const ENDPOINTS = {
  SHELTERS: '/shelters',
  NEARBY_SHELTERS: '/shelters/nearby',
  SHELTER_BY_ID: (id) => `/shelters/${id}`,
  ROUTE: '/geo/route',
  GEOCODE: '/geo/geocode',
  REVERSE_GEOCODE: '/geo/reverse-geocode',
  NGO_CAMPAIGNS: '/campaigns/my-campaigns',
  CREATE_CAMPAIGN: '/campaigns/create',
  UPDATE_CAMPAIGN: (id) => `/campaigns/update/${id}`,
  CANCEL_CAMPAIGN: (id) => `/campaigns/cancel/${id}`,
  CAMPAIGN_BY_ID: (id) => `/campaigns/${id}`,
};

// HTTP Methods
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

// Request Headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Status Codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export {
  API_BASE_URL,
  ENDPOINTS,
  HTTP_METHODS,
  DEFAULT_HEADERS,
  STATUS_CODES,
};
