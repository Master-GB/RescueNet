import missingPersonService from '../../services/missingPersonService.js';
import MissingPerson from '../../models/MissingPerson.js';
import socketService from '../../services/socketService.js';

// Mock the model and socket service
jest.mock('../../models/MissingPerson.js');
jest.mock('../socketService.js');

describe('Missing Person Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatistics', () => {
    test('should return statistics with correct structure', async () => {
      // Mock database responses
      MissingPerson.countDocuments = jest.fn()
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(7)  // active
        .mockResolvedValueOnce(2); // found

      MissingPerson.aggregate = jest.fn().mockResolvedValue([
        { _id: 'High', count: 5 },
        { _id: 'Medium', count: 3 },
        { _id: 'Low', count: 2 }
      ]);

      const stats = await missingPersonService.getStatistics();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('found');
      expect(stats).toHaveProperty('closed');
      expect(stats).toHaveProperty('byPriority');
      expect(stats.total).toBe(10);
      expect(stats.active).toBe(7);
      expect(stats.found).toBe(2);
      expect(stats.closed).toBe(1); // 10 - 7 - 2
    });

    test('should broadcast statistics update', async () => {
      MissingPerson.countDocuments = jest.fn()
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(1);

      MissingPerson.aggregate = jest.fn().mockResolvedValue([]);

      await missingPersonService.getStatistics();

      expect(socketService.broadcastStatisticsUpdate).toHaveBeenCalled();
    });
  });

  describe('Service Integration with Socket.IO', () => {
    test('should have socket service imported', () => {
      expect(socketService).toBeDefined();
    });
  });
});