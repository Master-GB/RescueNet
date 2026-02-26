import request from 'supertest';
import app from '../index.js';
import connectDB from '../config/db.js';
import mongoose from 'mongoose';

describe('Missing Person API Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/health', () => {
    test('should return health status with Socket.IO info', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
      expect(response.body).toHaveProperty('socketConnections');
    });
  });

  describe('GET /api/missing-persons/statistics', () => {
    test('should return statistics', async () => {
      const response = await request(app)
        .get('/api/missing-persons/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('found');
      expect(response.body.data).toHaveProperty('closed');
    });
  });

  describe('GET /api/socket/status', () => {
    test('should return Socket.IO status', async () => {
      const response = await request(app)
        .get('/api/socket/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('connectedClients');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.status).toBe('Active');
    });
  });

  describe('POST /api/missing-persons', () => {
    test('should create missing person report with required fields', async () => {
      const reportData = {
        reporterName: 'Test User',
        reporterContact: {
          phone: '0771234567',
          email: 'test@example.com'
        },
        fullName: 'Test Person',
        age: 25,
        gender: 'Male',
        lastSeenLocation: {
          address: 'Test Address',
          city: 'Colombo',
          coordinates: {
            type: 'Point',
            coordinates: [79.8612, 6.9271]
          }
        },
        lastSeenDate: '2026-02-10T10:00:00Z',
        circumstances: 'Test circumstances'
      };

      const response = await request(app)
        .post('/api/missing-persons')
        .send(reportData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('caseNumber');
      expect(response.body.data.fullName).toBe('Test Person');
    }, 15000);

    test('should return validation error for missing required fields', async () => {
      const invalidData = {
        reporterName: 'Test'
      };

      const response = await request(app)
        .post('/api/missing-persons')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/missing-persons', () => {
    test('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/missing-persons')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalReports');
    });
  });

  describe('POST /api/socket/test-broadcast', () => {
    test('should send test broadcast', async () => {
      const response = await request(app)
        .post('/api/socket/test-broadcast')
        .send({ message: 'Test message' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Test broadcast sent');
    });

    test('should return error without message', async () => {
      const response = await request(app)
        .post('/api/socket/test-broadcast')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
