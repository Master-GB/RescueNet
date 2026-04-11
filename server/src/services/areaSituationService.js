import AreaSituation from '../models/AreaSituation.js';
import { io } from '../server.js';

class AreaSituationService {
  /**
   * Create new area situation and notify clients
   */
  static async createSituation(situationData, userId) {
    try {
      // Deactivate previous situations for the same region
      if (situationData.region) {
        await AreaSituation.updateMany(
          { 
            region: situationData.region,
            isActive: true 
          },
          { 
            isActive: false,
            lastUpdatedBy: userId
          }
        );
      }

      // Create new situation
      const situation = new AreaSituation({
        ...situationData,
        createdBy: userId,
        lastUpdatedBy: userId
      });

      await situation.save();
      await situation.populate('createdBy', 'name email');

      // Emit real-time update to connected clients
      this.emitSituationUpdate(situation);

      return situation;
    } catch (error) {
      console.error('Error in AreaSituationService.createSituation:', error);
      throw error;
    }
  }

  /**
   * Update existing situation and notify clients
   */
  static async updateSituation(id, updateData, userId) {
    try {
      const situation = await AreaSituation.findByIdAndUpdate(
        id,
        {
          ...updateData,
          lastUpdatedBy: userId
        },
        { new: true }
      ).populate('createdBy', 'name email');

      if (!situation) {
        throw new Error('Situation not found');
      }

      // Emit real-time update to connected clients
      this.emitSituationUpdate(situation);

      return situation;
    } catch (error) {
      console.error('Error in AreaSituationService.updateSituation:', error);
      throw error;
    }
  }

  /**
   * Deactivate situation and notify clients
   */
  static async deactivateSituation(id, userId) {
    try {
      const situation = await AreaSituation.findByIdAndUpdate(
        id,
        {
          isActive: false,
          lastUpdatedBy: userId
        },
        { new: true }
      );

      if (!situation) {
        throw new Error('Situation not found');
      }

      // Emit real-time update to connected clients
      this.emitSituationUpdate({
        ...situation.toObject(),
        isActive: false
      });

      return situation;
    } catch (error) {
      console.error('Error in AreaSituationService.deactivateSituation:', error);
      throw error;
    }
  }

  /**
   * Get current situation for a region
   */
  static async getCurrentSituation(region = null) {
    try {
      return await AreaSituation.getCurrentSituation(region);
    } catch (error) {
      console.error('Error in AreaSituationService.getCurrentSituation:', error);
      throw error;
    }
  }

  /**
   * Get situation history
   */
  static async getSituationHistory(region = null, limit = 10) {
    try {
      return await AreaSituation.getSituationHistory(region, limit);
    } catch (error) {
      console.error('Error in AreaSituationService.getSituationHistory:', error);
      throw error;
    }
  }

  /**
   * Get all active situations
   */
  static async getActiveSituations() {
    try {
      return await AreaSituation.find({ isActive: true })
        .populate('createdBy', 'name email')
        .populate('lastUpdatedBy', 'name email')
        .sort({ validFrom: -1 });
    } catch (error) {
      console.error('Error in AreaSituationService.getActiveSituations:', error);
      throw error;
    }
  }

  /**
   * Emit real-time situation update to connected clients
   */
  static emitSituationUpdate(situation) {
    try {
      if (io) {
        // Emit to all connected clients
        io.emit('area-situation-update', {
          id: situation._id,
          status: situation.status,
          title: situation.title,
          message: situation.message,
          severity: situation.severity,
          authority: situation.authority,
          affectedAreas: situation.affectedAreas,
          recommendedActions: situation.recommendedActions,
          emergencyInstructions: situation.emergencyInstructions,
          isActive: situation.isActive,
          region: situation.region,
          validFrom: situation.validFrom,
          validUntil: situation.validUntil,
          lastUpdated: situation.updatedAt,
          timestamp: new Date().toISOString()
        });

        console.log('Area situation update emitted to clients:', {
          id: situation._id,
          status: situation.status,
          title: situation.title
        });
      }
    } catch (error) {
      console.error('Error emitting situation update:', error);
    }
  }

  /**
   * Check if situation is still valid
   */
  static isSituationValid(situation) {
    const now = new Date();
    return situation.isActive && 
           (!situation.validUntil || situation.validUntil > now) && 
           situation.validFrom <= now;
  }

  /**
   * Get situation severity level (1-5 scale)
   */
  static getSeverityLevel(severity) {
    const levels = {
      'low': 1,
      'medium': 3,
      'high': 5
    };
    return levels[severity] || 1;
  }

  /**
   * Get situation color based on status
   */
  static getSituationColor(status) {
    const colors = {
      'safe': 'green',
      'warning': 'yellow',
      'danger': 'red',
      'monitor': 'blue'
    };
    return colors[status] || 'green';
  }

  /**
   * Auto-deactivate expired situations
   */
  static async deactivateExpiredSituations() {
    try {
      const now = new Date();
      const expiredSituations = await AreaSituation.find({
        isActive: true,
        validUntil: { $lt: now }
      });

      for (const situation of expiredSituations) {
        situation.isActive = false;
        await situation.save();
        
        // Emit update for deactivated situation
        this.emitSituationUpdate({
          ...situation.toObject(),
          isActive: false
        });
      }

      console.log(`Deactivated ${expiredSituations.length} expired situations`);
      return expiredSituations.length;
    } catch (error) {
      console.error('Error deactivating expired situations:', error);
      return 0;
    }
  }
}

export default AreaSituationService;
