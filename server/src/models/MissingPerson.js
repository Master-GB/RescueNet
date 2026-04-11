import mongoose from 'mongoose';

const missingPersonSchema = new mongoose.Schema(
  {
    // Reporter Information
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reporterName: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true
    },
    reporterContact: {
      phone: {
        type: String,
        required: [true, 'Reporter phone number is required'],
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
      },
      email: {
        type: String,
        required: [true, 'Reporter email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
      }
    },

    // Missing Person Details
    fullName: {
      type: String,
      required: [true, 'Missing person name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [150, 'Please provide a valid age']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other'
      }
    },
    physicalDescription: {
      height: {
        type: String, // e.g., "5'8\"" or "173 cm"
        trim: true
      },
      weight: {
        type: String, // e.g., "70 kg" or "154 lbs"
        trim: true
      },
      hairColor: {
        type: String,
        trim: true
      },
      eyeColor: {
        type: String,
        trim: true
      },
      distinctiveMarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
      },
      clothing: {
        type: String,
        trim: true,
        maxlength: [500, 'Clothing description cannot exceed 500 characters']
      }
    },

    // Photo
    photoUrl: {
      type: String,
      default: null
    },

    // Last Seen Information
    lastSeenLocation: {
      address: {
        type: String,
        required: [true, 'Last seen address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
    },
      // GeoJSON point - kept separate from address fields
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],  // [longitude, latitude]
        default: undefined
      }
    },
    

    lastSeenDate: {
      type: Date,
      required: [true, 'Last seen date is required'],
      validate: {
        validator: function(value) {
          return value <= new Date();
        },
        message: 'Last seen date cannot be in the future'
      }
    },
    circumstances: {
      type: String,
      required: [true, 'Circumstances of disappearance are required'],
      trim: true,
      maxlength: [1000, 'Circumstances description cannot exceed 1000 characters']
    },

    // Status & Priority
    status: {
      type: String,
      enum: {
        values: ['Active', 'Found', 'Closed'],
        message: 'Status must be Active, Found, or Closed'
      },
      default: 'Active'
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Priority must be Low, Medium, High, or Critical'
      },
      default: 'Medium'
    },

    // Additional Information
    medicalConditions: {
      type: String,
      trim: true,
      maxlength: [500, 'Medical conditions description cannot exceed 500 characters']
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },

    // Sightings (array of reported sightings)
    sightings: [{
      reportedBy: String,
      location: String,
      dateTime: Date,
      description: String,
      verified: {
        type: Boolean,
        default: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Metadata
    caseNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
missingPersonSchema.index({ geoLocation: '2dsphere' });
missingPersonSchema.index({ status: 1, createdAt: -1 });
missingPersonSchema.index({ fullName: 'text', circumstances: 'text' }); // Text search

// Generate unique case number before saving
missingPersonSchema.pre('save', async function() {
  if (!this.caseNumber) {
    const count = await mongoose.model('MissingPerson').countDocuments();
    this.caseNumber = `MP-${Date.now()}-${count + 1}`;
  }
});

// Virtual for days missing
missingPersonSchema.virtual('daysMissing').get(function() {
  const now = new Date();
  const lastSeen = new Date(this.lastSeenDate);
  const diffTime = Math.abs(now - lastSeen);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

const MissingPerson = mongoose.model('MissingPerson', missingPersonSchema);

// Force index creation on startup (only in non-test environment)
if (process.env.NODE_ENV !== "test") {
  MissingPerson.createIndexes()
    .then(() => console.log(''))
    .catch(err => console.error('❌ Error creating indexes:', err));
}

export default MissingPerson;