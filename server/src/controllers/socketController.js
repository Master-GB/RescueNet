import socketService from '../services/socketService.js';

class SocketController {
  /**
   * Get Socket.IO connection status
   */
  getStatus(req, res) {
    try {
      const connectedClients = socketService.getConnectedClientsCount();

      res.status(200).json({
        success: true,
        message: 'Socket.IO is active',
        data: {
          connectedClients,
          status: 'Active',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Test broadcasting a message to all clients
   */
  testBroadcast(req, res) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Get io from app
      const io = req.app.get('io');
      
      io.emit('testMessage', {
        type: 'TEST',
        message: message,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Test broadcast sent',
        sentTo: socketService.getConnectedClientsCount() + ' clients'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new SocketController();