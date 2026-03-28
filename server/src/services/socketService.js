class SocketService {
  constructor() {
    this.io = null;
  }

  // Initialize Socket.IO instance
  initialize(io) {
    this.io = io;
    console.log('✅ Socket.IO service initialized');
  }

  /**
   * OUTGOING: Broadcast new missing person report to all connected clients
   * @param {Object} reportData - Missing person report
   */
  broadcastNewReport(reportData) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    console.log(`📡 Broadcasting new missing person report: ${reportData.fullName}`);
    
    this.io.emit('newMissingPerson', {
      type: 'NEW_REPORT',
      message: `New missing person reported: ${reportData.fullName}`,
      data: reportData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * OUTGOING: Broadcast status update to all connected clients
   * @param {Object} reportData - Updated report
   */
  broadcastStatusUpdate(reportData) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    console.log(`📡 Broadcasting status update: ${reportData.fullName} - ${reportData.status}`);
    
    this.io.emit('statusUpdate', {
      type: 'STATUS_UPDATE',
      message: `Status updated for ${reportData.fullName}: ${reportData.status}`,
      data: reportData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * OUTGOING: Broadcast when person is found
   * @param {Object} reportData - Found person report
   */
  broadcastPersonFound(reportData) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    console.log(`🎉 Broadcasting person found: ${reportData.fullName}`);
    
    this.io.emit('personFound', {
      type: 'PERSON_FOUND',
      message: `✅ GOOD NEWS: ${reportData.fullName} has been found safe!`,
      data: reportData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * OUTGOING: Broadcast new sighting to all connected clients
   * @param {Object} reportData - Missing person report
   * @param {Object} sightingData - New sighting information
   */
  broadcastNewSighting(reportData, sightingData) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    console.log(`👁️ Broadcasting new sighting for: ${reportData.fullName}`);
    
    this.io.emit('newSighting', {
      type: 'NEW_SIGHTING',
      message: `New sighting reported for ${reportData.fullName}`,
      data: {
        report: reportData,
        sighting: sightingData
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * OUTGOING: Broadcast report deletion to all connected clients
   * @param {string} reportId - Deleted report ID
   */
  broadcastReportDeleted(reportId) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    console.log(`🗑️ Broadcasting report deletion: ${reportId}`);
    
    this.io.emit('reportDeleted', {
      type: 'REPORT_DELETED',
      message: 'A missing person report has been removed',
      data: { reportId },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * OUTGOING: Broadcast statistics update
   * @param {Object} stats - Updated statistics
   */
  broadcastStatisticsUpdate(stats) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    console.log('📊 Broadcasting statistics update');
    
    this.io.emit('statisticsUpdate', {
      type: 'STATISTICS_UPDATE',
      data: stats,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send notification to specific user/room
   * @param {string} room - Room name or user ID
   * @param {string} event - Event name
   * @param {Object} data - Data to send
   */
  sendToRoom(room, event, data) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    this.io.to(room).emit(event, data);
  }

  /**
   * Get number of connected clients
   * @returns {number} - Number of connected clients
   */
  getConnectedClientsCount() {
    if (!this.io) {
      return 0;
    }
    return this.io.engine.clientsCount;
  }
}

export default new SocketService();