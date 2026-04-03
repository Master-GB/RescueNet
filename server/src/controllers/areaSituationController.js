import AreaSituation from '../models/AreaSituation.js';


export async function getCurrentSituation(req, res) {
  try {
    const { region, lat, lon, radius = 20 } = req.query;
    
    // Get current active situation(s)
    let situations;
    
    if (lat && lon) {
      // Get situations within radius of user's location
      situations = await AreaSituation.getActiveSituationsNearLocation(
        parseFloat(lat), 
        parseFloat(lon), 
        parseFloat(radius)
      );
    } else {
      // Fallback to region-based filtering
      situations = await AreaSituation.getCurrentSituation(region);
      situations = situations ? [situations] : [];
    }
    
    if (!situations || situations.length === 0) {
      // Return default safe situation if no active situations exist
      return res.json({
        situations: [{
          status: 'safe',
          title: 'Area Safe',
          message: 'No immediate threats detected. Normal conditions in your area.',
          severity: 'low',
          authority: 'Disaster Management Center',
          affectedAreas: [],
          recommendedActions: ['Continue normal activities', 'Stay informed'],
          lastUpdated: new Date().toISOString(),
          isValid: true,
          distance: null
        }]
      });
    }
    
    // Format response with distance information
    const response = {
      situations: situations.map(situation => ({
        id: situation._id,
        status: situation.status,
        title: situation.title,
        message: situation.message,
        severity: situation.severity,
        authority: situation.authority,
        affectedAreas: situation.affectedAreas,
        recommendedActions: situation.recommendedActions,
        emergencyInstructions: situation.emergencyInstructions,
        lastUpdated: situation.updatedAt.toISOString(),
        validFrom: situation.validFrom.toISOString(),
        validUntil: situation.validUntil ? situation.validUntil.toISOString() : null,
        isValid: situation.isValid,
        region: situation.region,
        distance: situation.distance || null
      }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting current situation:', error);
    res.status(500).json({
      message: 'Failed to fetch area situation',
      error: error.message
    });
  }
}

/**
 * GET /api/area/situation/history
 * Get situation history for admin
 * Query params: region, limit
 */
export async function getSituationHistory(req, res) {
  try {
    const { region, limit = 10 } = req.query;
    
    const situations = await AreaSituation.getSituationHistory(region, parseInt(limit));
    
    res.json({
      situations: situations.map(situation => ({
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
        createdBy: situation.createdBy,
        lastUpdatedBy: situation.lastUpdatedBy,
        createdAt: situation.createdAt,
        updatedAt: situation.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting situation history:', error);
    res.status(500).json({
      message: 'Failed to fetch situation history',
      error: error.message
    });
  }
}

/**
 * POST /api/area/situation
 * Create new area situation (admin only)
 */
export async function createSituation(req, res) {
  try {
    const {
      status,
      title,
      message,
      severity,
      authority,
      affectedAreas,
      recommendedActions,
      emergencyInstructions,
      region,
      validFrom,
      validUntil
    } = req.body;
    
    // Validate required fields
    if (!status || !title || !message || !severity || !authority) {
      return res.status(400).json({
        message: 'Missing required fields: status, title, message, severity, authority'
      });
    }
    
    // Create new situation
    const situation = new AreaSituation({
      status,
      title,
      message,
      severity,
      authority,
      affectedAreas: affectedAreas || [],
      recommendedActions: recommendedActions || [],
      emergencyInstructions,
      region,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id
    });
    
    await situation.save();
    
    // Populate user information
    await situation.populate('createdBy', 'name email');
    await situation.populate('lastUpdatedBy', 'name email');
    
    res.status(201).json({
      message: 'Area situation created successfully',
      situation: {
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
        createdBy: situation.createdBy,
        lastUpdatedBy: situation.lastUpdatedBy,
        createdAt: situation.createdAt,
        updatedAt: situation.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating situation:', error);
    res.status(500).json({
      message: 'Failed to create area situation',
      error: error.message
    });
  }
}

/**
 * PUT /api/area/situation/:id
 * Update existing situation (admin only)
 */
export async function updateSituation(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const situation = await AreaSituation.findById(id);
    
    if (!situation) {
      return res.status(404).json({
        message: 'Situation not found'
      });
    }
    
    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        situation[key] = updateData[key];
      }
    });
    
    situation.lastUpdatedBy = req.user.id;
    await situation.save();
    
    await situation.populate('createdBy', 'name email');
    await situation.populate('lastUpdatedBy', 'name email');
    
    res.json({
      message: 'Area situation updated successfully',
      situation: {
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
        createdBy: situation.createdBy,
        lastUpdatedBy: situation.lastUpdatedBy,
        createdAt: situation.createdAt,
        updatedAt: situation.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating situation:', error);
    res.status(500).json({
      message: 'Failed to update area situation',
      error: error.message
    });
  }
}

/**
 * DELETE /api/area/situation/:id
 * Deactivate situation (admin only)
 */
export async function deactivateSituation(req, res) {
  try {
    const { id } = req.params;
    
    const situation = await AreaSituation.findById(id);
    
    if (!situation) {
      return res.status(404).json({
        message: 'Situation not found'
      });
    }
    
    situation.isActive = false;
    situation.lastUpdatedBy = req.user.id;
    await situation.save();
    
    res.json({
      message: 'Area situation deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating situation:', error);
    res.status(500).json({
      message: 'Failed to deactivate area situation',
      error: error.message
    });
  }
}

/**
 * GET /api/area/situation/active
 * Get all active situations (admin only)
 */
export async function getActiveSituations(req, res) {
  try {
    const situations = await AreaSituation.find({ isActive: true })
      .populate('createdBy', 'name email')
      .populate('lastUpdatedBy', 'name email')
      .sort({ validFrom: -1 });
    
    res.json({
      situations: situations.map(situation => ({
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
        createdBy: situation.createdBy,
        lastUpdatedBy: situation.lastUpdatedBy,
        createdAt: situation.createdAt,
        updatedAt: situation.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error getting active situations:', error);
    res.status(500).json({
      message: 'Failed to fetch active situations',
      error: error.message
    });
  }
}
