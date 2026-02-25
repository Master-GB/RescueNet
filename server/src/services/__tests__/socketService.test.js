import socketService from '../socketService.js';

describe('Socket.IO Service', () => {
  test('should initialize correctly', () => {
    expect(socketService).toBeDefined();
  });

  test('should have broadcast methods', () => {
    expect(typeof socketService.broadcastNewReport).toBe('function');
    expect(typeof socketService.broadcastStatusUpdate).toBe('function');
    expect(typeof socketService.broadcastPersonFound).toBe('function');
    expect(typeof socketService.broadcastNewSighting).toBe('function');
  });

  test('should handle missing io gracefully', () => {
    // Should not throw error when io is not initialized
    expect(() => {
      socketService.broadcastNewReport({});
    }).not.toThrow();
  });
});