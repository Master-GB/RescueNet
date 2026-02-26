# Testing Documentation

## Overview
Comprehensive testing for the Missing Person module including Socket.IO real-time functionality.

## Test Types

### 1. Unit Tests
**Location:** `src/services/__tests__/`

**Socket.IO Service Tests:**
- Service initialization
- Broadcast method existence
- Error handling when io not initialized
- Correct event emission
- Client count tracking

**Missing Person Service Tests:**
- Statistics aggregation
- Socket.IO integration
- Error handling

### 2. Integration Tests
**Location:** `src/__tests__/`

**API Endpoint Tests:**
- Health check with Socket.IO status
- CRUD operations
- Socket.IO status endpoint
- Test broadcast functionality
- Validation testing
- Error responses

## Running Tests

### Run all tests:
```bash
npm test
```

### Run with coverage:
```bash
npm run test:coverage
```

### Run in watch mode:
```bash
npm run test:watch
```

### Run specific test file:
```bash
npm test -- socketService.test.js
```

## Test Results

**Expected Output:**
```
PASS  src/services/__tests__/socketService.test.js
PASS  src/services/__tests__/missingPersonService.test.js
PASS  src/__tests__/api.integration.test.js

Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
Time:        5.234 s
```

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Statements | >80% | ~85% |
| Branches | >75% | ~80% |
| Functions | >80% | ~85% |
| Lines | >80% | ~85% |

## Test Categories

### Socket.IO Tests (NEW)
- ✅ Service initialization
- ✅ Broadcast methods
- ✅ Client count tracking
- ✅ Error handling
- ✅ Event emission

### API Tests
- ✅ Health check
- ✅ CRUD operations
- ✅ Validation
- ✅ Pagination
- ✅ Statistics

### Real-Time Tests
- ✅ Socket.IO status
- ✅ Test broadcast
- ✅ Integration with services

## Manual Testing

### Socket.IO Real-Time Testing:
1. Start server: `npm run dev`
2. Open test-client.html
3. Run Postman tests
4. Verify real-time updates in test client

### Expected Behavior:
- Creating report → Test client shows "NEW REPORT"
- Updating to "Found" → Test client shows "PERSON FOUND"
- Adding sighting → Test client shows "NEW SIGHTING"
- Test broadcast → Test client receives message

## Troubleshooting Tests

**If tests fail:**
1. Ensure MongoDB is running
2. Check environment variables
3. Verify Socket.IO is initialized
4. Clear Jest cache: `npx jest --clearCache`

**Common Issues:**
- Timeout errors → Increase testTimeout in jest.config.js
- Module not found → Check import paths
- Connection errors → Verify MongoDB connection string

## Test Coverage Report

Generate detailed coverage:
```bash
npm run test:coverage
```

Open coverage report:
```bash
# Windows
start coverage/lcov-report/index.html

# Open manually from: server/coverage/lcov-report/index.html
```

## Continuous Integration

Tests should pass before:
- Committing code
- Pushing to GitHub
- Creating pull requests
- Deploying to production

## Writing New Tests

**Template for new service test:**
```javascript
import myService from '../myService.js';

describe('My Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myService.doSomething(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Test Data

Use realistic test data:
- Valid Sri Lankan phone numbers
- Realistic coordinates for Colombo area
- Proper date formats
- Complete required fields

## Performance Testing

**Socket.IO Performance:**
- Test with multiple concurrent connections
- Verify broadcast latency
- Check memory usage with many clients