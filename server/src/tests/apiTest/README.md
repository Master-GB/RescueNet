# API Testing for RescueNet

This directory contains comprehensive API endpoint tests for the RescueNet disaster management system, focusing on HTTP request/response validation and integration testing.

## 🎯 Test Coverage

### Disaster Tests (`disasterTests/`)
- **Disaster Data API** (`disasterApi.test.js`)
  - Earthquake data retrieval (USGS)
  - Fire data aggregation (FIRMS)
  - Disaster alerts (GDACS)
  - Relief reports (ReliefWeb)
  - Data filtering and pagination

### Geo Services Tests (`geoTests/`)
- **Geocoding API** (`geocoding.test.js`)
  - Address to coordinates conversion
  - Reverse geocoding
  - Location validation
  - Error handling for invalid addresses
  - Rate limiting behavior

- **Routing API** (`routing.test.js`)
  - Route calculation between points
  - Distance and duration estimation
  - Alternative route options
  - Traffic consideration
  - Multi-waypoint routing

### Weather Tests (`weatherTest/`)
- **Weather API** (`weatherApi.test.js`)
  - Current weather retrieval
  - Multiple provider support (Open-Meteo, OpenWeatherMap)
  - Unit conversion (metric/imperial)
  - Location-based weather queries
  - Error handling for service failures

## 🔧 Test Infrastructure

### Configuration
- **Config file**: `jest.api.config.js`
- **Test environment**: Node.js
- **Test pattern**: `**/tests/apiTest/**/*.test.js`
- **Coverage**: Enabled for API routes
- **Reports**: Detailed API response validation

### Test Setup
- **HTTP Client**: Supertest for HTTP assertions
- **Mock Services**: External API mocking
- **Database**: Test database with seeded data
- **Authentication**: Mock JWT middleware
- **File Upload**: Mock multer for file handling

### Test Utilities
- **API Helpers**: Common HTTP request utilities
- **Response Validators**: Custom assertion helpers
- **Mock Factories**: API request/response generators
- **Database Seeding**: Test data setup utilities

## 🚀 Running Tests

### Prerequisites
```bash
npm install
```

### Run All API Tests
```bash
npm run test:api
```

### Run Specific Test Suites
```bash
# Disaster API tests only
npm run test:api -- disasterTests/

# Geo services tests only
npm run test:api -- geoTests/

# Weather API tests only
npm run test:api -- weatherTest/
```

### Run with Coverage
```bash
npm run test:api -- --coverage
```

### Run in Watch Mode
```bash
npm run test:api -- --watch
```

### Run Specific Test Files
```bash
# Run disaster API tests
npm run test:api -- disasterTests/disasterApi.test.js

# Run geocoding tests
npm run test:api -- geoTests/geocoding.test.js

# Run routing tests
npm run test:api -- geoTests/routing.test.js

# Run weather API tests
npm run test:api -- weatherTest/weatherApi.test.js
```

### Run Tests for Specific API Categories
```bash
# Run only disaster related API tests
npm run test:api -- disasterTests/

# Run only geo services API tests
npm run test:api -- geoTests/

# Run only weather API tests
npm run test:api -- weatherTest/
```

### Debug Mode for API Tests
```bash
# Run with verbose output
npm run test:api -- --verbose

# Run with debugger
npm run test:api -- --inspect-brk

# Run with specific test pattern
npm run test:api -- --testNamePattern="Disaster"
```

## 📊 Test Configuration

### Jest Configuration
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/apiTest/**/*.test.js'],
  collectCoverageFrom: [
    'src/routes/**/*.js',
    'src/controllers/**/*.js',
    'src/middleware/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/apiTest/setup.js']
};
```

### HTTP Client Configuration
- **Base URL**: `http://localhost:3000`
- **Timeout**: 30 seconds
- **Retry Logic**: 3 retries with exponential backoff
- **Headers**: Content-Type and Authorization handling

## 🔍 Test Data

### API Request Samples
- **Disaster Requests**: Various disaster type queries
- **Geo Requests**: Address and coordinate samples
- **Weather Requests**: Location and unit variations
- **Authentication**: Valid and invalid token samples

### Mock Responses
- **USGS API**: Earthquake data responses
- **FIRMS API**: Fire data responses
- **GDACS API**: Disaster alert responses
- **Open-Meteo**: Weather data responses
- **Nominatim**: Geocoding responses
- **OSRM**: Routing responses

## 🎯 Test Scenarios

### Disaster API Testing
1. **Earthquake Data Retrieval**
   - Fetch recent earthquakes
   - Filter by magnitude and location
   - Validate data structure
   - Handle API rate limits
   - Test error scenarios

2. **Fire Data Aggregation**
   - Retrieve active fire incidents
   - Filter by region and severity
   - Validate coordinate data
   - Handle missing data
   - Test pagination

3. **Disaster Alerts**
   - Fetch current disaster alerts
   - Filter by alert level
   - Validate alert metadata
   - Test subscription endpoints
   - Handle webhook notifications

### Geo Services Testing
1. **Geocoding Operations**
   - Convert addresses to coordinates
   - Handle ambiguous addresses
   - Test international formats
   - Validate coordinate accuracy
   - Handle service failures

2. **Routing Calculations**
   - Calculate optimal routes
   - Handle multiple waypoints
   - Consider traffic conditions
   - Validate distance/duration
   - Test alternative routes

### Weather API Testing
1. **Current Weather Data**
   - Fetch weather by location
   - Test different providers
   - Validate data structure
   - Handle unit conversions
   - Test error scenarios

2. **Provider Switching**
   - Test fallback between providers
   - Validate data consistency
   - Handle provider-specific features
   - Test configuration changes
   - Monitor performance impact

## 🔧 Debugging

### Debug Mode
```bash
npm run test:api -- --verbose
```

### HTTP Request Logging
```bash
DEBUG=axios* npm run test:api
```

### Response Inspection
```javascript
// In test files
console.log('Response:', response.status, response.body);
console.log('Headers:', response.headers);
```

### API Endpoint Testing
```bash
# Test individual endpoints
curl -X GET http://localhost:3000/api/disasters/earthquakes
curl -X POST http://localhost:3000/api/weather/current -d '{"location":"Colombo"}'
```

## 📈 Performance Considerations

### Response Time Expectations
- **Disaster data**: < 2 seconds
- **Geocoding**: < 1 second
- **Weather data**: < 1.5 seconds
- **Routing**: < 3 seconds

### Rate Limiting
- **USGS API**: 100 requests/minute
- **FIRMS API**: 1000 requests/day
- **Open-Meteo**: 10000 requests/day
- **Nominatim**: 1 request/second

### Caching Strategy
- **Disaster data**: 5-minute cache
- **Weather data**: 15-minute cache
- **Geocoding**: 24-hour cache
- **Routing**: No cache (real-time)

## 🚨 Important Notes

### API Key Management
- All external API keys are environment variables
- Test keys are different from production keys
- Rate limiting is respected in tests
- Fallback mechanisms are tested

### Error Handling
- HTTP status codes are properly validated
- Error responses follow consistent format
- Retry logic is tested for transient failures
- Graceful degradation is verified

### Data Validation
- Request payloads are validated
- Response structures are verified
- Data types and formats are checked
- Boundary conditions are tested

## 🎉 Success Criteria

API tests are successful when:
- ✅ All endpoints respond with correct status codes
- ✅ Request/response validation works properly
- ✅ Error handling is robust and consistent
- ✅ Rate limiting is respected
- ✅ External service failures are handled gracefully
- ✅ Performance meets expectations
- ✅ Security measures are effective

## 📝 Adding New API Tests

### API Test Template
```javascript
const request = require('supertest');
const app = require('../../../app');
const { setupTestData, cleanupTestData } = require('../utils/testHelpers');

describe('New API Endpoint', () => {
  let authToken;

  beforeAll(async () => {
    await setupTestData();
    // Get auth token for protected routes
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/new-endpoint', () => {
    it('should return data successfully', async () => {
      const response = await request(app)
        .get('/api/new-endpoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should handle missing authentication', async () => {
      const response = await request(app)
        .get('/api/new-endpoint');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/new-endpoint?invalid=param')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/new-endpoint', () => {
    it('should create new resource', async () => {
      const newResource = {
        name: 'Test Resource',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/new-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newResource);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newResource.name);
    });

    it('should validate required fields', async () => {
      const invalidResource = {
        description: 'Missing required name field'
      };

      const response = await request(app)
        .post('/api/new-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidResource);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name is required');
    });
  });
});
```

### Mock Service Template
```javascript
const nock = require('nock');

const mockExternalAPI = (response, status = 200) => {
  return nock('https://api.example.com')
    .get('/endpoint')
    .query({ param: 'value' })
    .reply(status, response);
};

module.exports = { mockExternalAPI };
```

## 🔗 Related Documentation

- [Unit Tests](../unit/README.md)
- [Integration Tests](../integration/README.md)
- [Performance Tests](../performanceTest/README.md)
- [Project Documentation](../../../README.md)
- [API Documentation](../../../docs/API.md)
