# Integration Testing for RescueNet

This directory contains comprehensive integration tests for RescueNet disaster management system.

## 🎯 Test Coverage

### API Integration Tests
- **Health API** (`health.integration.test.js`)
  - Server health check endpoint
  - Basic connectivity validation

- **Authentication API** (`auth.integration.test.js`)
  - User registration and login
  - Token validation and protected routes
  - User profile management
  - Logout functionality

- **Shelter API** (`shelter.integration.test.js`)
  - Shelter creation, retrieval, update, and deletion
  - Nearby shelter search
  - Capacity and availability management
  - Location-based queries

- **Help Request API** (`help.integration.test.js`)
  - Emergency help request creation
  - Request status management
  - Image and voice message attachments
  - Request assignment and resolution

- **Geo Services API** (`geo.integration.test.js`)
  - Address geocoding
  - Reverse geocoding
  - Route planning and navigation
  - External service error handling

- **Disasters API** (`disasters.integration.test.js`)
  - Disaster data aggregation (USGS, FIRMS, GDACS)
  - Disaster map generation
  - Heatmap creation
  - Real-time disaster updates

- **Weather API** (`weather.integration.test.js`)
  - Current weather information
  - Multiple weather providers (Open-Meteo, OpenWeatherMap)
  - Unit conversion (metric/imperial)
  - Location-based weather queries

### Workflow Tests
- **Emergency Response Workflow** (`emergency-response.workflow.test.js`)
  - Complete end-to-end emergency scenario
  - Multi-user coordination (citizen, admin, volunteer)
  - Help request lifecycle
  - Shelter management integration
  - Disaster and weather information flow

- **Admin Management Workflow** (`admin-management.workflow.test.js`)
  - Admin user verification and management
  - Help request administration
  - Shelter oversight
  - NGO coordination
  - User deletion and permissions

- **NGO Coordination Workflow** (`ngo-coordination.workflow.test.js`)
  - Campaign creation and management
  - Donation processing and verification
  - Help request coordination
  - Resource distribution
  - Multi-NGO collaboration

- **Shelter Management Workflow** (`shelter-management.workflow.test.js`)
  - Shelter creation and verification
  - Capacity management workflows
  - Emergency response coordination
  - Multi-shelter networking
  - Quality control processes

- **User Registration Workflow** (`user-registration.workflow.test.js`)
  - Complete user registration flows
  - Multi-role registration (Citizen, Volunteer, NGO)
  - Email verification workflows
  - Profile creation and management
  - Password reset scenarios

### Real-time Communication Tests
- **Socket.io Integration** (`real-time-communication.test.js`)
  - Real-time location sharing
  - Emergency alert broadcasting
  - Multi-client communication
  - Connection management

## 🔗 Related Testing Documentation

### Complete Testing Suite Overview
RescueNet includes a comprehensive testing strategy with multiple testing layers:

#### **Unit Tests** (`../unit/README.md`)
- **Purpose**: Test individual functions and components in isolation
- **Coverage**: All business logic, utilities, and individual modules
- **Tools**: Jest with mocking
- **Commands**: `npm run test:unit`
- **Focus**: Code correctness, edge cases, error handling

#### **API Tests** (`../apiTest/README.md`)
- **Purpose**: Test HTTP endpoints and request/response validation
- **Coverage**: All REST API endpoints and external service integration
- **Tools**: Supertest, Jest, API mocking
- **Commands**: `npm run test:api`
- **Focus**: API contracts, data validation, error responses

#### **Integration Tests** (This directory)
- **Purpose**: Test complete workflows and multi-component interactions
- **Coverage**: End-to-end user scenarios and system integration
- **Tools**: Jest, in-memory database, service mocking
- **Commands**: `npm run test:integration`
- **Focus**: Workflow correctness, data flow, user experience

#### **Performance Tests** (`../performanceTest/README.md`)
- **Purpose**: Test system performance under various load conditions
- **Coverage**: Load testing, stress testing, spike testing
- **Tools**: Artillery, K6, monitoring tools
- **Commands**: `npm run perf:*`
- **Focus**: Performance benchmarks, scalability, resource usage

### Testing Pyramid

```
    /\
   /  \     Performance Tests (Load, Stress, Spike)
  /____\    
 /        \   Integration Tests (Workflows, E2E)
/__________\  
             Unit Tests (Functions, Components)
```

### Quick Test Commands Reference

```bash
# Run all test types
npm run test:unit          # Unit tests
npm run test:api           # API tests  
npm run test:integration    # Integration tests
npm run perf:auth:all      # Performance tests (auth)
npm run perf:shelter:all   # Performance tests (shelter)
npm run perf:disaster:all  # Performance tests (disaster)
npm run perf:geo:all       # Performance tests (geo)

# Run tests with coverage
npm run test:unit -- --coverage
npm run test:api -- --coverage
npm run test:integration -- --coverage

# Run tests in watch mode
npm run test:unit -- --watch
npm run test:api -- --watch
npm run test:integration -- --watch
```

### Test Execution Order

1. **Unit Tests**: Run first for fast feedback on code changes
2. **API Tests**: Run after unit tests pass to verify API contracts
3. **Integration Tests**: Run after API tests pass to verify workflows
4. **Performance Tests**: Run before deployment to verify performance

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:api
      - run: npm run test:integration
      - run: npm run perf:auth:basic
```

## 🔧 Test Infrastructure

### Setup Files
- **`setup/globalSetup.js`** - MongoDB Memory Server initialization
- **`setup/globalTeardown.js`** - Database cleanup
- **`setup/testEnv.js`** - Test server and utilities
- **`setup/mocks.js`** - External service mocks

### Database
- Uses **MongoDB Memory Server** for isolated testing
- Automatic database cleanup between tests
- Test data isolation and consistency

### External Service Mocking
All external API calls are mocked to ensure:
- **Offline test execution** - No internet dependency
- **Consistent test results** - No external API variability
- **Fast test execution** - No network latency
- **Rate limiting avoidance** - No external API limits

Mocked services include:
- Nominatim (geocoding)
- OSRM (routing)
- USGS (earthquake data)
- FIRMS (fire data)
- GDACS (disaster alerts)
- ReliefWeb (disaster reports)
- Open-Meteo/OpenWeatherMap (weather)
- Hugging Face (AI analysis)
- Email services

## 🚀 Running Tests

### Prerequisites
```bash
npm install
```

### Run All Integration Tests
```bash
npm run test:integration
```

### Run Specific Test Files
```bash
# Health check only
npm run test:integration -- health.integration.test.js

# Auth tests only
npm run test:integration -- auth.integration.test.js

# Workflow tests only
npm run test:integration -- emergency-response.workflow.test.js
```

### Run with Coverage
```bash
npm run test:integration -- --coverage
```

### Run in Watch Mode
```bash
npm run test:integration -- --watch
```

## 📊 Test Configuration

### Jest Configuration
- **Config file**: `jest.integration.config.js`
- **Test environment**: Node.js
- **Test pattern**: `**/tests/integration/**/*.test.js`
- **Coverage**: Disabled by default (can be enabled)
- **Reports**: JUnit XML output to `tests/reports/`

### Environment Variables
Tests run with these environment variables:
- `NODE_ENV=test`
- `DB_URI=memory-server-uri`
- `JWT_SECRET=test-secret`

## 🔍 Test Data

### Sample Users
- **Citizen**: `citizen@example.com`
- **Admin**: `admin@example.com`
- **Volunteer**: `volunteer@example.com`
- **NGO**: `ngo@example.com`

### Sample Locations
- **Colombo**: [79.8612, 6.9271]
- **Kandy**: [80.6337, 7.2906]
- **Galle**: [80.2170, 6.0535]

### Sample Data
- **Shelters**: Emergency shelters with capacity and facilities
- **Help Requests**: Various disaster types and urgency levels
- **Disaster Data**: Mock earthquake, fire, and flood data
- **Weather Data**: Current conditions and forecasts

## 🎯 Test Scenarios

### Emergency Response Workflow
1. **Citizen** creates emergency help request
2. **Admin** reviews and verifies request
3. **Volunteer** creates emergency shelter
4. **Citizen** finds nearby shelters
5. **Admin** monitors disaster information
6. **Admin** resolves help request

### Real-time Communication
1. **User** starts location sharing
2. **System** broadcasts location updates
3. **Emergency alerts** sent to all connected users
4. **Multi-client** coordination scenarios

### API Integration
1. **Authentication** flow validation
2. **Resource management** operations
3. **External service** integration points
4. **Error handling** and edge cases

## 🔧 Debugging

### Debug Mode
```bash
npm run test:integration -- --verbose
```

### Breakpoints
Add `debugger;` statements in test files and run:
```bash
npm run test:integration -- --inspect-brk
```

### Test Logs
Tests output detailed logs for:
- Database operations
- HTTP requests/responses
- Socket events
- Mock service calls

## 📈 Performance Considerations

### Test Execution Time
- **Individual tests**: < 5 seconds
- **Full suite**: < 60 seconds
- **Parallel execution**: Enabled by Jest

### Memory Usage
- **In-memory database**: ~50MB
- **Test server**: ~30MB
- **Mock services**: ~20MB

### Optimization Tips
- Tests run in parallel where possible
- Database cleanup is efficient
- Mock responses are lightweight
- No external network calls

## 🚨 Important Notes

### Test Isolation
- Each test runs in isolation
- Database cleared between tests
- Mocks reset before each test
- No shared state between tests

### Authentication Testing
- Users are automatically verified for testing
- JWT tokens use test secret
- Session management tested end-to-end

### External Services
- All external APIs are mocked
- No internet connection required
- Consistent mock responses
- Error scenarios tested

## 🎉 Success Criteria

Integration tests are successful when:
- ✅ All API endpoints respond correctly
- ✅ Workflows complete end-to-end
- ✅ Real-time communication works
- ✅ Database operations are consistent
- ✅ Error handling is robust
- ✅ Tests run offline
- ✅ Performance is acceptable

## 📝 Adding New Tests

### API Test Template
```javascript
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks } from "../setup/mocks.js";

describe("New API Integration", () => {
  let agent, server;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();
  });

  it("should handle new feature", async () => {
    // Test implementation
  });
});
```

### Workflow Test Template
```javascript
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks } from "../setup/mocks.js";

describe("New Workflow Integration", () => {
  let agent, server;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();
  });

  it("should complete new workflow", async () => {
    // Workflow implementation
  });
});
```

## 🔗 Related Documentation

- [Unit Tests](../unit/README.md)
- [API Tests](../apiTest/README.md)
- [Performance Tests](../performanceTest/README.md)
- [Project Documentation](../../../README.md)
