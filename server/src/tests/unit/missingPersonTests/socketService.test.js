import { jest } from '@jest/globals';
import socketService from '../../../services/socketService.js';

describe('Socket.IO Service', () => {
  beforeEach(() => {
    // Reset socketService for each test
    socketService.io = null;
  });

  describe('Initialization', () => {
    test('should be defined', () => {
      expect(socketService).toBeDefined();
    });

    test('should have io property', () => {
      expect(socketService).toHaveProperty('io');
    });

    test('should initialize with io instance', () => {
      const mockIo = {
        emit: jest.fn(),
        engine: { clientsCount: 0 }
      };

      socketService.initialize(mockIo);
      expect(socketService.io).toBe(mockIo);
    });
  });

  describe('Broadcast Methods', () => {
    test('should have all broadcast methods', () => {
      expect(typeof socketService.broadcastNewReport).toBe('function');
      expect(typeof socketService.broadcastStatusUpdate).toBe('function');
      expect(typeof socketService.broadcastPersonFound).toBe('function');
      expect(typeof socketService.broadcastNewSighting).toBe('function');
      expect(typeof socketService.broadcastReportDeleted).toBe('function');
      expect(typeof socketService.broadcastStatisticsUpdate).toBe('function');
    });

    test('should handle broadcasts when io is not initialized gracefully', () => {
      socketService.io = null;
      
      // Should not throw errors
      expect(() => {
        socketService.broadcastNewReport({ fullName: 'Test' });
      }).not.toThrow();

      expect(() => {
        socketService.broadcastStatusUpdate({ fullName: 'Test', status: 'Found' });
      }).not.toThrow();
    });

    test('should broadcast new report when io is initialized', () => {
      const mockIo = {
        emit: jest.fn(),
        engine: { clientsCount: 1 }
      };

      socketService.initialize(mockIo);
      
      const reportData = {
        fullName: 'Test Person',
        age: 25,
        status: 'Active'
      };

      socketService.broadcastNewReport(reportData);

      expect(mockIo.emit).toHaveBeenCalledWith(
        'newMissingPerson',
        expect.objectContaining({
          type: 'NEW_REPORT',
          message: expect.stringContaining('Test Person'),
          data: reportData
        })
      );
    });

    test('should broadcast person found alert', () => {
      const mockIo = {
        emit: jest.fn(),
        engine: { clientsCount: 2 }
      };

      socketService.initialize(mockIo);
      
      const reportData = {
        fullName: 'Found Person',
        status: 'Found'
      };

      socketService.broadcastPersonFound(reportData);

      expect(mockIo.emit).toHaveBeenCalledWith(
        'personFound',
        expect.objectContaining({
          type: 'PERSON_FOUND',
          message: expect.stringContaining('Found Person')
        })
      );
    });

    test('should broadcast new sighting', () => {
      const mockIo = {
        emit: jest.fn()
      };

      socketService.initialize(mockIo);
      
      const reportData = { fullName: 'Test Person' };
      const sightingData = { 
        location: 'Test Location',
        description: 'Test sighting'
      };

      socketService.broadcastNewSighting(reportData, sightingData);

      expect(mockIo.emit).toHaveBeenCalledWith(
        'newSighting',
        expect.objectContaining({
          type: 'NEW_SIGHTING',
          data: expect.objectContaining({
            report: reportData,
            sighting: sightingData
          })
        })
      );
    });
  });

  describe('Helper Methods', () => {
    test('should return 0 for connected clients when io is null', () => {
      socketService.io = null;
      expect(socketService.getConnectedClientsCount()).toBe(0);
    });

    test('should return correct client count when io is initialized', () => {
      const mockIo = {
        engine: { clientsCount: 5 }
      };

      socketService.initialize(mockIo);
      expect(socketService.getConnectedClientsCount()).toBe(5);
    });

    test('should send to specific room', () => {
      const mockIo = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn()
        })
      };

      socketService.initialize(mockIo);
      socketService.sendToRoom('testRoom', 'testEvent', { data: 'test' });

      expect(mockIo.to).toHaveBeenCalledWith('testRoom');
    });
  });

  describe('Broadcast Statistics', () => {
    test('should broadcast statistics update', () => {
      const mockIo = {
        emit: jest.fn()
      };

      socketService.initialize(mockIo);
      
      const stats = {
        total: 10,
        active: 7,
        found: 2,
        closed: 1
      };

      socketService.broadcastStatisticsUpdate(stats);

      expect(mockIo.emit).toHaveBeenCalledWith(
        'statisticsUpdate',
        expect.objectContaining({
          type: 'STATISTICS_UPDATE',
          data: stats
        })
      );
    });
  });
});