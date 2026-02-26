import socketService from '../socketService.js';

describe('Socket.IO Service', () => {
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

    test('should handle broadcasts when io is not initialized', () => {
      const uninitializedService = { ...socketService, io: null };
      
      // Should not throw errors
      expect(() => {
        uninitializedService.broadcastNewReport({});
      }).not.toThrow();
    });

    test('should broadcast new report when io is initialized', () => {
      const mockIo = {
        emit: jest.fn()
      };

      socketService.initialize(mockIo);
      
      const reportData = {
        fullName: 'Test Person',
        age: 25
      };

      socketService.broadcastNewReport(reportData);

      expect(mockIo.emit).toHaveBeenCalledWith(
        'newMissingPerson',
        expect.objectContaining({
          type: 'NEW_REPORT',
          message: expect.stringContaining('Test Person')
        })
      );
    });
  });

  describe('Helper Methods', () => {
    test('should return 0 for connected clients when io is null', () => {
      const service = { ...socketService, io: null };
      expect(service.getConnectedClientsCount()).toBe(0);
    });

    test('should return correct client count when io is initialized', () => {
      const mockIo = {
        engine: { clientsCount: 5 }
      };

      socketService.initialize(mockIo);
      expect(socketService.getConnectedClientsCount()).toBe(5);
    });
  });
});