import { jest } from '@jest/globals';
import missingPersonService from '../../../services/missingPersonService.js';
import MissingPerson from '../../../models/MissingPerson.js';
import socketService from '../../../services/socketService.js';

// Mock the model and socket service
beforeAll(() => {
  // Mock MissingPerson model
  MissingPerson.find = jest.fn();
  MissingPerson.findById = jest.fn();
  MissingPerson.countDocuments = jest.fn();
  MissingPerson.aggregate = jest.fn();
  
  // Mock socketService methods
  socketService.broadcastNewReport = jest.fn();
  socketService.broadcastStatusUpdate = jest.fn();
  socketService.broadcastPersonFound = jest.fn();
  socketService.broadcastNewSighting = jest.fn();
  socketService.broadcastReportDeleted = jest.fn();
  socketService.broadcastStatisticsUpdate = jest.fn();
});

describe('Missing Person Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createReport', () => {
  test('should create report and broadcast', async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    
    // ✅ Mock the prototype's save method
    jest.spyOn(MissingPerson.prototype, 'save').mockImplementation(mockSave);

    const reportData = {
      reporterName: 'Reporter',
      fullName: 'Test Person',
      age: 25
    };

    const result = await missingPersonService.createReport(reportData);

    expect(mockSave).toHaveBeenCalled();
    expect(socketService.broadcastNewReport).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  test('should throw error on save failure', async () => {
    // ✅ Mock prototype save to reject
    jest.spyOn(MissingPerson.prototype, 'save')
      .mockRejectedValue(new Error('Database error'));

    await expect(
      missingPersonService.createReport({})
    ).rejects.toThrow('Error creating report');
  });
});

  describe('getAllReports', () => {
    test('should return reports with pagination', async () => {
      const mockReports = [
        { _id: '1', fullName: 'Person 1' },
        { _id: '2', fullName: 'Person 2' }
      ];

      MissingPerson.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockReports)
      });

      MissingPerson.countDocuments = jest.fn().mockResolvedValue(20);

      const result = await missingPersonService.getAllReports({}, { page: 1, limit: 10 });

      expect(result).toHaveProperty('reports');
      expect(result).toHaveProperty('pagination');
      expect(result.reports).toEqual(mockReports);
      expect(result.pagination.totalReports).toBe(20);
      expect(result.pagination.totalPages).toBe(2);
    });

    test('should apply filters correctly', async () => {
      MissingPerson.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      MissingPerson.countDocuments = jest.fn().mockResolvedValue(0);

      await missingPersonService.getAllReports({}, { 
        status: 'Active',
        priority: 'High',
        city: 'Colombo'
      });

      expect(MissingPerson.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          status: 'Active',
          priority: 'High'
        })
      );
    });
  });

  describe('getReportById', () => {
    test('should return report when found', async () => {
      const mockReport = {
        _id: '123',
        fullName: 'Test Person'
      };

      MissingPerson.findById = jest.fn().mockResolvedValue(mockReport);

      const result = await missingPersonService.getReportById('123');

      expect(result).toEqual(mockReport);
      expect(MissingPerson.findById).toHaveBeenCalledWith('123');
    });

    test('should throw error when report not found', async () => {
      MissingPerson.findById = jest.fn().mockResolvedValue(null);

      await expect(
        missingPersonService.getReportById('nonexistent')
      ).rejects.toThrow('Missing person report not found');
    });
  });

  describe('updateReport', () => {
    test('should update report and broadcast status update', async () => {
      const mockReport = {
        _id: '123',
        fullName: 'Test Person',
        status: 'Active',
        save: jest.fn().mockResolvedValue(true)
      };

      MissingPerson.findById = jest.fn().mockResolvedValue(mockReport);

      const updateData = { status: 'Found' };
      await missingPersonService.updateReport('123', updateData, 'user123');

      expect(mockReport.save).toHaveBeenCalled();
      expect(mockReport.status).toBe('Found');
      expect(socketService.broadcastPersonFound).toHaveBeenCalled();
    });

    test('should broadcast regular update when status not changed to Found', async () => {
      const mockReport = {
        _id: '123',
        status: 'Active',
        save: jest.fn().mockResolvedValue(true)
      };

      MissingPerson.findById = jest.fn().mockResolvedValue(mockReport);

      await missingPersonService.updateReport('123', { priority: 'High' }, 'user123');

      expect(socketService.broadcastStatusUpdate).toHaveBeenCalled();
      expect(socketService.broadcastPersonFound).not.toHaveBeenCalled();
    });
  });

  describe('deleteReport', () => {
    test('should soft delete report and broadcast', async () => {
      const mockReport = {
        _id: '123',
        isActive: true,
        save: jest.fn().mockResolvedValue(true)
      };

      MissingPerson.findById = jest.fn().mockResolvedValue(mockReport);

      await missingPersonService.deleteReport('123', 'user123');

      expect(mockReport.isActive).toBe(false);
      expect(mockReport.save).toHaveBeenCalled();
      expect(socketService.broadcastReportDeleted).toHaveBeenCalledWith('123');
    });
  });

  describe('addSighting', () => {
    test('should add sighting and broadcast', async () => {
      const mockReport = {
        _id: '123',
        sightings: [],
        save: jest.fn().mockResolvedValue(true)
      };

      MissingPerson.findById = jest.fn().mockResolvedValue(mockReport);

      const sightingData = {
        reportedBy: 'Witness',
        location: 'Test Location',
        description: 'Saw the person'
      };

      await missingPersonService.addSighting('123', sightingData);

      expect(mockReport.sightings).toHaveLength(1);
      expect(mockReport.save).toHaveBeenCalled();
      expect(socketService.broadcastNewSighting).toHaveBeenCalled();
    });
  });

  describe('searchByLocation', () => {
    test('should search reports near coordinates', async () => {
      const mockReports = [
        { _id: '1', fullName: 'Nearby Person 1' },
        { _id: '2', fullName: 'Nearby Person 2' }
      ];

      MissingPerson.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockReports)
      });

      const result = await missingPersonService.searchByLocation(79.8612, 6.9271, 10);

      expect(MissingPerson.find).toHaveBeenCalledWith(
        expect.objectContaining({
          geoLocation: expect.objectContaining({
            $near: expect.any(Object)
          }),
          isActive: true,
          status: 'Active'
        })
      );

      expect(result).toEqual(mockReports);
    });
  });

  describe('getStatistics', () => {
    test('should return statistics with correct structure', async () => {
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
      expect(stats.closed).toBe(1);
      expect(socketService.broadcastStatisticsUpdate).toHaveBeenCalledWith(stats);
    });

    test('should handle empty priority data', async () => {
      MissingPerson.countDocuments = jest.fn()
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(1);

      MissingPerson.aggregate = jest.fn().mockResolvedValue([]);

      const stats = await missingPersonService.getStatistics();

      expect(stats.byPriority).toEqual({});
    });
  });
});