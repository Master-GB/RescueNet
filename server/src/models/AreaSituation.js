import mongoose from 'mongoose';

const areaSituationSchema = new mongoose.Schema({
  // Basic Information
  status: {
    type: String,
    enum: ['safe', 'warning', 'danger', 'monitor'],
    required: true,
    default: 'safe'
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Severity and Authority
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
    default: 'low'
  },
  authority: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  // Geographic Information
  affectedAreas: [{
    type: String,
    maxlength: 100
  }],
  region: {
    type: String,
    maxlength: 100
  },
  
  // Actions and Instructions
  recommendedActions: [{
    type: String,
    maxlength: 200
  }],
  emergencyInstructions: {
    type: String,
    maxlength: 1000
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  
  // Timestamps
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  
}, {
  timestamps: true
});

// Index for efficient queries
areaSituationSchema.index({ status: 1, isActive: 1 });
areaSituationSchema.index({ region: 1 });
areaSituationSchema.index({ validFrom: -1 });

// Virtual for checking if situation is currently valid
areaSituationSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         (!this.validUntil || this.validUntil > now) && 
         this.validFrom <= now;
});

// Static method to get situations within radius of location
areaSituationSchema.statics.getActiveSituationsNearLocation = function(lat, lon, radiusKm = 20) {
  const earthRadiusKm = 6371; // Earth's radius in kilometers
  
  return this.find({ isActive: true })
    .populate('createdBy', 'name email')
    .populate('lastUpdatedBy', 'name email')
    .sort({ validFrom: -1 })
    .then(situations => {
      // Filter situations by affected areas that match user's region
      const nearbySituations = situations.filter(situation => {
        // If no affected areas specified, include it (general alert)
        if (!situation.affectedAreas || situation.affectedAreas.length === 0) {
          return true;
        }
        
        // Check if any affected area matches common regions
        // This is a simplified approach - in production you'd use actual coordinates
        const userRegion = this.getUserRegion(lat, lon);
        return situation.affectedAreas.some(area => 
          this.isAreaNearby(area, userRegion, radiusKm)
        );
      });
      
      // Add distance information based on proximity
      return nearbySituations.map((situation, index) => ({
        ...situation.toObject(),
        distance: this.calculateMockDistance(lat, lon, situation.region, index)
      }));
    });
};

// Helper method to get user's region based on coordinates
areaSituationSchema.statics.getUserRegion = function(lat, lon) {
  // Simplified region detection for Sri Lanka
  if (lat >= 6.5 && lat <= 7.5 && lon >= 79.5 && lon <= 80.5) {
    return 'Colombo';
  } else if (lat >= 6.8 && lat <= 7.2 && lon >= 79.8 && lon <= 80.2) {
    return 'Western Province';
  } else if (lat >= 7.0 && lat <= 8.0 && lon >= 80.0 && lon <= 81.0) {
    return 'North Western Province';
  } else if (lat >= 6.0 && lat <= 7.0 && lon >= 80.5 && lon <= 81.5) {
    return 'North Central Province';
  } else if (lat >= 6.0 && lat <= 7.5 && lon >= 79.0 && lon <= 80.0) {
    return 'Southern Province';
  } else if (lat >= 7.0 && lat <= 8.5 && lon >= 80.5 && lon <= 82.0) {
    return 'Eastern Province';
  } else if (lat >= 6.5 && lat <= 8.0 && lon >= 80.0 && lon <= 81.0) {
    return 'Central Province';
  } else if (lat >= 8.0 && lat <= 9.5 && lon >= 79.5 && lon <= 80.5) {
    return 'Uva Province';
  } else if (lat >= 7.5 && lat <= 9.0 && lon >= 80.0 && lon <= 81.5) {
    return 'Sabaragamuwa Province';
  }
  return 'Unknown';
};

// Helper method to check if area is nearby
areaSituationSchema.statics.isAreaNearby = function(area, userRegion, radiusKm) {
  // Direct match
  if (area.toLowerCase().includes(userRegion.toLowerCase())) {
    return true;
  }
  
  // Check for district/province matches
  const nearbyRegions = this.getNearbyRegions(userRegion);
  return nearbyRegions.some(nearby => 
    area.toLowerCase().includes(nearby.toLowerCase())
  );
};

// Helper method to get nearby regions
areaSituationSchema.statics.getNearbyRegions = function(region) {
  const regionMap = {
    'Colombo': ['Colombo', 'Western Province', 'Gampaha', 'Kalutara'],
    'Western Province': ['Colombo', 'Gampaha', 'Kalutara', 'Western Province'],
    'Southern Province': ['Galle', 'Matara', 'Hambantota', 'Southern Province'],
    'North Central Province': ['Anuradhapura', 'Polonnaruwa', 'North Central Province'],
    'Eastern Province': ['Batticaloa', 'Trincomalee', 'Ampara', 'Eastern Province'],
    'Central Province': ['Kandy', 'Nuwara Eliya', 'Matale', 'Central Province'],
    'Uva Province': ['Badulla', 'Monaragala', 'Uva Province'],
    'Sabaragamuwa Province': ['Ratnapura', 'Kegalle', 'Sabaragamuwa Province'],
    'North Western Province': ['Kurunegala', 'Puttalam', 'North Western Province']
  };
  
  return regionMap[region] || [region];
};

// Helper method to calculate mock distance
areaSituationSchema.statics.calculateMockDistance = function(lat, lon, situationRegion, index) {
  // Return realistic mock distances based on region proximity
  const distances = [2.5, 8.7, 15.3, 22.1, 28.9];
  return distances[index % distances.length];
};

// Static method to get current active situation
areaSituationSchema.statics.getCurrentSituation = function(region = null) {
  const query = { isActive: true };
  
  if (region) {
    query.region = region;
  }
  
  return this.findOne(query)
    .populate('createdBy', 'name email')
    .populate('lastUpdatedBy', 'name email')
    .sort({ validFrom: -1 });
};

// Static method to get situation history
areaSituationSchema.statics.getSituationHistory = function(region = null, limit = 10) {
  const query = {};
  
  if (region) {
    query.region = region;
  }
  
  return this.find(query)
    .populate('createdBy', 'name email')
    .populate('lastUpdatedBy', 'name email')
    .sort({ validFrom: -1 })
    .limit(limit);
};

const AreaSituation = mongoose.model('AreaSituation', areaSituationSchema);

export default AreaSituation;
