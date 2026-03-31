# Unit Testing for RescueNet

This directory contains comprehensive unit tests for the RescueNet disaster management system, focusing on testing individual components and functions in isolation.

## 🎯 Test Coverage

### Authentication Tests (`authTests/`)
- **User Registration** (`register.test.js`)
  - Email validation
  - Password strength validation
  - Role validation
  - Duplicate user handling
  - OTP generation and verification

- **User Login** (`login.test.js`)
  - Email/password authentication
  - Token generation
  - Account verification status
  - Invalid credentials handling
  - Session management

- **Password Reset** (`password-reset.test.js`)
  - OTP generation for password reset
  - OTP verification
  - Password update functionality
  - Token expiration handling
  - Security validation

- **Email Services** (`email.test.js`)
  - OTP email sending
  - Notification emails
  - Email template rendering
  - Failed email handling
  - Rate limiting

- **Token Management** (`token.test.js`)
  - JWT token generation
  - Token validation
  - Token expiration
  - Refresh token functionality
  - Blacklist handling

### Admin Tests (`admintests/`)
- **User Management** (`adminUserManagement.test.js`)
  - User verification (NGO/Volunteer)
  - User deletion
  - User role management
  - User status updates
  - Bulk operations

- **Dashboard Analytics** (`adminDashboard.test.js`)
  - User statistics
  - Help request metrics
  - Shelter utilization
  - Donation tracking
  - Performance analytics

### Campaign Tests (`campaigntests/`)
- **Campaign Creation** (`campaignCreation.test.js`)
  - Campaign validation
  - Goal setting
  - Bank details verification
  - Image upload handling
  - Campaign status management

- **Donation Processing** (`donationProcessing.test.js`)
  - Donation validation
  - Payment verification
  - Receipt generation
  - Refund handling
  - Tax receipt processing

- **Campaign Updates** (`campaignUpdates.test.js`)
  - Progress updates
  - Milestone tracking
  - Communication updates
  - Media uploads
  - Beneficiary stories

- **Campaign Analytics** (`campaignAnalytics.test.js`)
  - Donation trends
  - Donor demographics
  - Campaign performance
  - ROI calculations
  - Impact metrics

### Help Request Tests (`helpRequestTest/`)
- **Request Creation** (`helpRequest.test.js`)
  - Emergency validation
  - Location verification
  - Priority assessment
  - Attachment handling
  - Duplicate detection

### Location Controller Tests (`locationControllerTest/`)
- **Geolocation Services** (`location.test.js`)
  - Address geocoding
  - Reverse geocoding
  - Location validation
  - Distance calculations
  - Coordinate transformations

### Missing Person Tests (`missingPersonTests/`)
- **Report Management** (`missingPerson.test.js`)
  - Person registration
  - Photo upload
  - Last known location
  - Contact information
  - Status tracking

- **Search Operations** (`searchOperations.test.js`)
  - Matching algorithms
  - Search radius
  - Priority scoring
  - Notification sending
  - Found person handling

- **Database Operations** (`missingPersonDB.test.js`)
  - CRUD operations
  - Index optimization
  - Query performance
  - Data consistency
  - Backup procedures

### NGO Tests (`ngoTests/`)
- **NGO Management** (`ngoManagement.test.js`)
  - Registration validation
  - Document verification
  - Compliance checking
  - Status management
  - Performance tracking

### Shelter Tests (`shelterTests/`)
- **Shelter Management** (`shelter.test.js`)
  - Capacity management
  - Facility validation
  - Location verification
  - Availability tracking
  - Emergency protocols

### Task Management Tests (`taskmanagement/`)
- **Task Assignment** (`task.test.js`)
  - Task creation
  - Volunteer matching
  - Priority assignment
  - Progress tracking
  - Completion validation

### User Management Tests (`userManagementTests/`)
- **Profile Management** (`profile.test.js`)
  - Profile creation
  - Information updates
  - Privacy settings
  - Document management
  - Verification status

- **User Preferences** (`preferences.test.js`)
  - Notification settings
  - Language preferences
  - Accessibility options
  - Communication channels
  - Data sharing settings

- **User Activity** (`activity.test.js`)
  - Login tracking
  - Activity logging
  - Session management
  - Security monitoring
  - Audit trails

- **User Relationships** (`relationships.test.js`)
  - Connection requests
  - Trust networks
  - Emergency contacts
  - Family linking
  - Organization membership

## 🔧 Test Infrastructure

### Configuration
- **Config file**: `jest.unit.config.js`
- **Test environment**: Node.js
- **Test pattern**: `**/tests/unit/**/*.test.js`
- **Coverage**: Enabled with detailed reports
- **Reports**: HTML and JSON coverage reports

### Test Setup
- **Mock services**: All external dependencies mocked
- **Database**: In-memory MongoDB for isolation
- **Authentication**: Mock JWT handling
- **File uploads**: Mock multer middleware
- **Email**: Mock nodemailer service

### Test Utilities
- **Test helpers**: Common test utilities and fixtures
- **Mock factories**: Data generation for test scenarios
- **Assertion helpers**: Custom matchers and validators
- **Database helpers**: Test database setup and cleanup

## 🚀 Running Tests

### Prerequisites
```bash
npm install
```

### Run All Unit Tests
```bash
npm run test:unit
```

### Run Specific Test Suites
```bash
# Authentication tests only
npm run test:unit -- authTests/

# Admin tests only
npm run test:unit -- admintests/

# Campaign tests only
npm run test:unit -- campaigntests/

# Help request tests only
npm run test:unit -- helpRequestTest/

# Location controller tests only
npm run test:unit -- locationControllerTest/

# Missing person tests only
npm run test:unit -- missingPersonTests/

# NGO tests only
npm run test:unit -- ngoTests/

# Shelter tests only
npm run test:unit -- shelterTests/

# Task management tests only
npm run test:unit -- taskmanagement/

# User management tests only
npm run test:unit -- userManagementTests/
```

### Run with Coverage
```bash
npm run test:unit -- --coverage
```

### Run in Watch Mode
```bash
npm run test:unit -- --watch
```

### Run Specific Test Files
```bash
npm run test:unit -- authTests/register.test.js
npm run test:unit -- admintests/adminUserManagement.test.js
npm run test:unit -- campaigntests/campaignCreation.test.js
```

### Run Tests for Specific Modules
```bash
# Run only authentication related tests
npm run test:unit -- authTests/

# Run only admin related tests
npm run test:unit -- admintests/

# Run only campaign related tests
npm run test:unit -- campaigntests/

# Run only help request tests
npm run test:unit -- helpRequestTest/

# Run only location controller tests
npm run test:unit -- locationControllerTest/

# Run only missing person tests
npm run test:unit -- missingPersonTests/

# Run only NGO tests
npm run test:unit -- ngoTests/

# Run only shelter tests
npm run test:unit -- shelterTests/

# Run only task management tests
npm run test:unit -- taskmanagement/

# Run only user management tests
npm run test:unit -- userManagementTests/
```

## 📊 Test Configuration

### Jest Configuration
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/config/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js']
};
```

### Coverage Reports
- **HTML Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **LCOV Report**: `coverage/lcov.info`
- **Text Summary**: Console output

## 🔍 Test Data

### Fixtures
- **User fixtures**: Sample user data for different roles
- **Shelter fixtures**: Emergency shelter test data
- **Campaign fixtures**: Sample campaign data
- **Help request fixtures**: Emergency request scenarios

### Mock Data
- **External APIs**: Mock responses for third-party services
- **Database**: Mock database operations for isolation
- **File system**: Mock file operations for uploads
- **Email**: Mock email service responses

## 🎯 Test Scenarios

### Authentication Flow
1. **User Registration**
   - Validate email format and uniqueness
   - Enforce password strength requirements
   - Generate and send verification OTP
   - Handle registration edge cases

2. **User Login**
   - Authenticate with email/password
   - Generate JWT tokens
   - Handle account verification status
   - Manage session persistence

3. **Password Reset**
   - Generate secure reset tokens
   - Validate token expiration
   - Update password securely
   - Notify user of changes

### Admin Operations
1. **User Management**
   - Verify NGO/Volunteer applications
   - Manage user roles and permissions
   - Handle user deletion and suspension
   - Generate user reports

2. **Dashboard Analytics**
   - Calculate user statistics
   - Track help request metrics
   - Monitor shelter utilization
   - Generate performance reports

### Campaign Management
1. **Campaign Lifecycle**
   - Create and validate campaigns
   - Process donations securely
   - Update campaign progress
   - Generate impact reports

## 🔧 Debugging

### Debug Mode
```bash
npm run test:unit -- --verbose
```

### Breakpoints
Add `debugger;` statements in test files and run:
```bash
npm run test:unit -- --inspect-brk
```

### Test Logs
- **Database operations**: MongoDB query logs
- **Authentication**: Token generation and validation
- **External services**: Mock API call logs
- **Error handling**: Detailed error traces

## 📈 Performance Considerations

### Test Execution Time
- **Individual tests**: < 2 seconds
- **Test suites**: < 30 seconds
- **Full suite**: < 5 minutes

### Memory Usage
- **In-memory database**: ~30MB
- **Mock services**: ~15MB
- **Test framework**: ~20MB

### Optimization Tips
- Use selective test running during development
- Implement test parallelization where possible
- Optimize mock data generation
- Use efficient database cleanup

## 🚨 Important Notes

### Test Isolation
- Each test runs in complete isolation
- Mocks are reset between tests
- Database is cleaned after each test
- No shared state between tests

### Mock Strategy
- All external dependencies are mocked
- Mock responses are consistent and predictable
- Error scenarios are thoroughly tested
- Performance is not a concern in unit tests

### Coverage Requirements
- Minimum 80% code coverage required
- Critical paths must have 100% coverage
- Edge cases and error paths included
- Integration with coverage reporting tools

## 🎉 Success Criteria

Unit tests are successful when:
- ✅ All individual functions work correctly
- ✅ Edge cases are handled properly
- ✅ Error scenarios are covered
- ✅ Code coverage meets requirements
- ✅ Tests run quickly and reliably
- ✅ Mock services behave consistently

## 📝 Adding New Unit Tests

### Test File Template
```javascript
const { describe, it, beforeEach, afterEach } = require('@jest/globals');
const { expect } = require('@jest/globals');
const { mockData, clearMocks } = require('../utils/testHelpers');

describe('ComponentName', () => {
  let component;

  beforeEach(() => {
    // Setup before each test
    component = new ComponentName();
  });

  afterEach(() => {
    // Cleanup after each test
    clearMocks();
  });

  it('should perform expected behavior', () => {
    // Test implementation
    expect(component.method()).toBe(expectedResult);
  });

  it('should handle edge cases', () => {
    // Edge case testing
    expect(component.method(edgeCaseInput)).toBe(expectedEdgeResult);
  });

  it('should throw error for invalid input', () => {
    // Error handling testing
    expect(() => component.method(invalidInput)).toThrow();
  });
});
```

### Mock Service Template
```javascript
const mockService = {
  method: jest.fn(),
  errorMethod: jest.fn().mockRejectedValue(new Error('Test error'))
};

module.exports = mockService;
```

## 🔗 Related Documentation

- [Integration Tests](../integration/README.md)
- [API Tests](../apiTest/README.md)
- [Performance Tests](../performanceTest/README.md)
- [Project Documentation](../../../README.md)
- [Testing Guidelines](../TESTING_GUIDELINES.md)
