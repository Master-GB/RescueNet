# Performance Testing for RescueNet

This directory contains comprehensive performance tests for the RescueNet disaster management system, focusing on load testing, stress testing, and performance benchmarking.

## 🎯 Test Coverage

### Auth Performance Tests (`authTest/`)
- **Login Performance** (`login-performance.yml`)
  - Concurrent user login scenarios
  - Authentication throughput testing
  - Token generation performance
  - Session management load
  - Password hashing performance

- **Registration Performance** (`registration-performance.yml`)
  - New user registration load
  - Email verification performance
  - Database write performance
  - Concurrent registration handling
  - OTP generation performance

- **Token Validation** (`token-validation.yml`)
  - JWT verification performance
  - Concurrent token validation
  - Blacklist checking performance
  - Refresh token performance
  - Session timeout handling

- **Password Reset** (`password-reset.yml`)
  - Reset request performance
  - OTP validation performance
  - Password update performance
  - Concurrent reset handling
  - Security measure performance

### Disaster Analysis Tests (`disasterAnalyzeTest/`)
- **Data Aggregation** (`disaster-aggregation.yml`)
  - Multiple data source processing
  - Real-time data streaming
  - Large dataset processing
  - Concurrent API calls
  - Data transformation performance

- **Heatmap Generation** (`heatmap-generation.yml`)
  - Geographic data processing
  - Heat intensity calculations
  - Map rendering performance
  - Large coordinate datasets
  - Real-time heatmap updates

- **Alert Processing** (`alert-processing.yml`)
  - Alert filtering performance
  - Notification throughput
  - Multi-channel alerting
  - Priority queue performance
  - Alert aggregation performance

- **Stress Test** (`stress-test.yml`)
  - High-load disaster scenarios
  - System resource utilization
  - Memory usage monitoring
  - CPU performance under load
  - Database connection pooling

### Geo Services Performance Tests (`geoTest/`)
- **Geocoding Performance** (`geocoding-performance.yml`)
  - Address lookup throughput
  - Concurrent geocoding requests
  - Large batch processing
  - Cache hit/miss performance
  - External API response times

- **Routing Performance** (`routing-performance.yml`)
  - Route calculation speed
  - Multi-waypoint routing
  - Concurrent route requests
  - Traffic data processing
  - Alternative route generation

- **Location Search** (`location-search.yml`)
  - Nearby location queries
  - Spatial index performance
  - Large dataset searching
  - Filter combination performance
  - Real-time location updates

- **Distance Calculations** (`distance-calculations.yml`)
  - Haversine formula performance
  - Bulk distance calculations
  - Polygon containment tests
  - Spatial query optimization
  - Index-based lookups

### Shelter Performance Tests (`shelterTest/`)
- **Shelter Search** (`shelter-search.yml`)
  - Location-based shelter queries
  - Filter combination performance
  - Real-time availability checks
  - Large shelter database queries
  - Concurrent user searches

- **Capacity Management** (`capacity-management.yml`)
  - Real-time capacity updates
  - Concurrent occupancy changes
  - Availability calculation speed
  - Database transaction performance
  - Cache synchronization

- **Shelter Booking** (`shelter-booking.yml`)
  - Booking throughput testing
  - Concurrent reservation handling
  - Conflict resolution performance
  - Booking cancellation speed
  - Waitlist management

- **Emergency Allocation** (`emergency-allocation.yml`)
  - Mass allocation scenarios
  - Priority-based assignment
  - Resource optimization
  - Real-time allocation updates
  - Load balancing performance

- **Data Synchronization** (`data-sync.yml`)
  - Multi-node synchronization
  - Real-time updates propagation
  - Conflict resolution speed
  - Data consistency checks
  - Network partition handling

- **Analytics Processing** (`analytics-processing.yml`)
  - Usage statistics calculation
  - Performance metric aggregation
  - Report generation speed
  - Historical data analysis
  - Real-time dashboard updates

## 🔧 Test Infrastructure

### Tools and Frameworks
- **Artillery**: Load testing and performance monitoring
- **K6**: Modern load testing with JavaScript scripting
- **Apache Bench (ab)**: Simple HTTP benchmarking
- **JMeter**: Comprehensive performance testing suite
- **Gatling**: High-performance load testing

### Monitoring and Metrics
- **Response Time**: Average, median, 95th percentile
- **Throughput**: Requests per second (RPS)
- **Error Rate**: Failed request percentage
- **Resource Usage**: CPU, memory, disk I/O
- **Database Performance**: Query times, connection pools

### Test Environments
- **Local**: Development machine testing
- **Staging**: Pre-production environment
- **Production**: Live environment monitoring
- **Docker**: Containerized testing
- **Cloud**: Cloud-based load testing

## 🚀 Running Tests

### Prerequisites
```bash
npm install
# Install performance testing tools
npm install -g artillery
```

### Run All Performance Tests
```bash
# Run all auth performance tests
npm run perf:auth:all

# Run all shelter performance tests
npm run perf:shelter:all

# Run all disaster analysis performance tests
npm run perf:disaster:all

# Run all geo services performance tests
npm run perf:geo:all
```

### Run Specific Test Categories
```bash
# Authentication Performance Tests
npm run perf:auth:basic      # Basic load test for auth
npm run perf:auth:stress      # Stress test for auth
npm run perf:auth:spike       # Spike test for auth

# Shelter Performance Tests
npm run perf:shelter:basic    # Basic load test for shelters
npm run perf:shelter:stress    # Stress test for shelters
npm run perf:shelter:spike     # Spike test for shelters

# Disaster Analysis Performance Tests
npm run perf:disaster:basic             # Basic load test for disaster analysis
npm run perf:disaster:stress-optimized   # Optimized stress test
npm run perf:disaster:spike              # Spike test for disaster analysis

# Geo Services Performance Tests
npm run perf:geo:basic        # Basic load test for geo services
npm run perf:geo:stress        # Stress test for geo services
npm run perf:geo:spike         # Spike test for geo services
```

### Run Individual Test Files
```bash
# Run specific artillery test files
artillery run authTest/basic-load.yml
artillery run authTest/stress-test.yml
artillery run authTest/spike-test.yml

artillery run shelterTest/basic-load.yml
artillery run shelterTest/stress-test.yml
artillery run shelterTest/spike-test.yml

artillery run disasterAnalyzeTest/basic-load.yml
artillery run disasterAnalyzeTest/stress-test-optimized.yml
artillery run disasterAnalyzeTest/spike-test.yml

artillery run geoTest/basic-load.yml
artillery run geoTest/stress-test.yml
artillery run geoTest/spike-test.yml
```

### Setup Test Data
```bash
# Create admin user for shelter tests
npm run ready-admin
```

### Generate Performance Reports
```bash
# Generate HTML reports for artillery tests
artillery run --output report.json shelterTest/basic-load.yml
artillery report report.json

# Generate reports with timestamps
artillery run --output report-$(date +%Y%m%d-%H%M%S).json authTest/basic-load.yml
artillery report report-$(date +%Y%m%d-%H%M%S).json
```

### Run Tests with Custom Configuration
```bash
# Run with custom duration and load
artillery run --config custom-config.yml authTest/basic-load.yml

# Run with environment variables
NODE_ENV=test artillery run shelterTest/basic-load.yml

# Run with multiple targets
artillery run multi-target-config.yml
```

### Monitor Performance During Tests
```bash
# Monitor system resources
htop                          # CPU and memory usage
iotop                          # Disk I/O
iftop                          # Network usage

# Monitor application logs
tail -f logs/performance.log     # Application logs
tail -f logs/access.log         # Access logs

# Monitor database performance
mongostat                       # MongoDB statistics
mongotop                        # MongoDB operation profiling
```

### Docker-based Performance Testing
```bash
# Run performance tests in Docker containers
docker-compose -f docker-compose.test.yml up
docker-compose -f docker-compose.test.yml run artillery

# Clean up after tests
docker-compose -f docker-compose.test.yml down -v
```

## 📊 Test Configuration

### Artillery Configuration
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  payload:
    path: "test-data.csv"
    fields:
      - "email"
      - "password"
```

### K6 Configuration
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};
```

### Monitoring Setup
- **Application Metrics**: New Relic, DataDog
- **Infrastructure**: Prometheus, Grafana
- **Database**: MongoDB Atlas monitoring
- **Network**: Wireshark, tcpdump
- **Load Balancer**: Nginx, HAProxy stats

## 🔍 Test Scenarios

### Authentication Performance
1. **Login Load Testing**
   - 1000 concurrent users logging in
   - Measure response time under load
   - Test JWT generation performance
   - Monitor database query performance
   - Verify session management

2. **Registration Throughput**
   - 100 new registrations per minute
   - Email verification performance
   - Duplicate detection speed
   - Database write performance
   - OTP generation rate

### Disaster Analysis Performance
1. **Real-time Data Processing**
   - Process 1000 disaster events/second
   - Multiple data source aggregation
   - Alert generation performance
   - Heatmap update speed
   - Memory usage monitoring

2. **Large Dataset Processing**
   - Process 1M historical records
   - Batch processing performance
   - Memory optimization testing
   - Database query optimization
   - Report generation speed

### Geo Services Performance
1. **Geocoding Load Testing**
   - 500 concurrent geocoding requests
   - External API rate limiting
   - Cache performance testing
   - Fallback mechanism testing
   - Response time distribution

2. **Routing Optimization**
   - Calculate 1000 routes simultaneously
   - Multi-waypoint routing performance
   - Traffic data processing speed
   - Alternative route generation
   - Resource utilization monitoring

### Shelter Management Performance
1. **Search and Filter Performance**
   - 1000 concurrent shelter searches
   - Complex filter combinations
   - Spatial query optimization
   - Real-time availability checks
   - Cache hit/miss ratios

2. **Booking System Load Testing**
   - 500 simultaneous shelter bookings
   - Conflict resolution performance
   - Transaction processing speed
   - Database locking behavior
   - Concurrent access handling

## 📈 Performance Benchmarks

### Response Time Targets
- **Authentication**: < 200ms (95th percentile)
- **Disaster Data**: < 500ms (95th percentile)
- **Geocoding**: < 1000ms (95th percentile)
- **Shelter Search**: < 300ms (95th percentile)
- **Booking Operations**: < 400ms (95th percentile)

### Throughput Targets
- **Login**: 100 requests/second
- **Registration**: 50 requests/second
- **Disaster Queries**: 200 requests/second
- **Shelter Searches**: 300 requests/second
- **Bookings**: 100 requests/second

### Resource Limits
- **CPU Usage**: < 80% under normal load
- **Memory Usage**: < 2GB under peak load
- **Database Connections**: < 100 concurrent
- **Disk I/O**: < 80% utilization
- **Network Bandwidth**: < 1Gbps sustained

## 🔧 Debugging

### Performance Profiling
```bash
# Node.js profiling
node --prof app.js
node --prof-process isolate-*.log > processed.txt

# Memory profiling
node --inspect app.js
# Use Chrome DevTools for memory analysis
```

### Database Query Analysis
```javascript
// Enable MongoDB query profiler
db.setProfilingLevel(2);
// Analyze slow queries
db.system.profile.find().sort({millis: -1}).limit(5);
```

### Network Monitoring
```bash
# Monitor network connections
netstat -an | grep :3000
# Monitor bandwidth usage
iftop -i eth0
```

### Application Logs
```bash
# Enable debug logging
DEBUG=app:* npm start
# Monitor log files
tail -f logs/performance.log
```

## 📈 Performance Optimization

### Database Optimization
- **Indexing**: Proper index creation for queries
- **Connection Pooling**: Optimize connection limits
- **Query Optimization**: Reduce N+1 query problems
- **Caching**: Implement Redis caching layer
- **Sharding**: Consider database sharding for scale

### Application Optimization
- **Code Profiling**: Identify performance bottlenecks
- **Memory Management**: Optimize memory usage
- **Async Operations**: Proper async/await usage
- **Load Balancing**: Distribute load across instances
- **CDN Integration**: Use CDN for static assets

### Infrastructure Optimization
- **Horizontal Scaling**: Add more instances
- **Vertical Scaling**: Increase instance resources
- **Container Orchestration**: Use Kubernetes
- **Auto-scaling**: Implement automatic scaling
- **Geographic Distribution**: Multi-region deployment

## 🚨 Important Notes

### Test Environment Isolation
- Performance tests run in dedicated environment
- Database is isolated from production data
- External services are mocked or rate-limited
- Network conditions are simulated

### Load Testing Ethics
- Never test against production without permission
- Respect rate limits of external APIs
- Use test data that doesn't expose PII
- Coordinate with infrastructure team
- Monitor system health during tests

### Continuous Monitoring
- Performance metrics are collected 24/7
- Automated alerts for performance degradation
- Regular performance regression testing
- Historical performance trend analysis
- Capacity planning based on metrics

## 🎉 Success Criteria

Performance tests are successful when:
- ✅ Response times meet target benchmarks
- ✅ System handles expected user load
- ✅ Error rates remain below acceptable thresholds
- ✅ Resource utilization is within limits
- ✅ System scales appropriately under load
- ✅ Performance doesn't degrade over time
- ✅ Monitoring and alerting systems work

## 📝 Adding New Performance Tests

### Artillery Test Template
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
  processor: "./test-processor.js"

scenarios:
  - name: "New Endpoint Load Test"
    weight: 100
    flow:
      - get:
          url: "/api/new-endpoint"
          capture:
            - json: "$.data"
              as: "responseData"
      - think: 1
```

### K6 Test Template
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const response = http.post('http://localhost:3000/api/new-endpoint', {
    name: 'Test User',
    email: 'test@example.com'
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### Custom Performance Test
```javascript
const { performance } = require('perf_hooks');

function measurePerformance(testFunction) {
  const start = performance.now();
  const result = testFunction();
  const end = performance.now();
  
  return {
    result,
    duration: end - start
  };
}

module.exports = { measurePerformance };
```

## 🔗 Related Documentation

- [Unit Tests](../unit/README.md)
- [Integration Tests](../integration/README.md)
- [API Tests](../apiTest/README.md)
- [Project Documentation](../../../README.md)
- [Performance Guidelines](../../../docs/PERFORMANCE.md)
