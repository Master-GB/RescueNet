import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    // ===== LINK TO USER MODEL =====
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",  // References your existing User model
      required: true,
      unique: true  // One user can only have one NGO profile
    },
    
    // ===== NGO-SPECIFIC DETAILS (Admin fills these) =====
    organizationName: { type: String, required: true },
    registrationNumber: { type: String, unique: true }, // Official NGO reg number
    
    type: {
      type: String,
      enum: ["food-bank", "medical", "shelter", "rescue", "relief", "other"],
      required: true
    },
    
    contactPerson: { type: String, required: true },
    officialEmail: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String
    },
    
    capabilities: {
      type: [String], 
      default: [] // ["flood-relief", "medical-aid", "food-distribution"]
    },
    
    serviceArea: {
      type: [String],  // ["Colombo", "Gampaha", "Kandy"]
      default: []
    },
    
    resources: {
      volunteers: { type: Number, default: 0 },
      vehicles: { type: Number, default: 0 },
      medicalStaff: { type: Number, default: 0 },
      otherResources: String
    },
    
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "unavailable", "offline"],
      default: "unavailable"  // Until admin approves
    },
    
    // ===== APPROVAL WORKFLOW =====
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"  // Admin who approved
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    
    // ===== DOCUMENTS (Optional) =====
    documents: [{
      type: { type: String }, // "registration-certificate", "tax-id", etc.
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // ===== PERFORMANCE TRACKING =====
    assignedRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpRequest"  // Tracks all help requests assigned to this NGO
    }],
    completedTasks: { type: Number, default: 0 },
    averageResponseTime: { type: Number }, // in minutes
    rating: { type: Number, default: 0, min: 0, max: 5 },
    
    isActive: { type: Boolean, default: true },
    notes: { type: String }  // Admin notes
  },
  { timestamps: true }
);

// Index for faster lookups
organizationSchema.index({ userId: 1 });
organizationSchema.index({ approvalStatus: 1 });
organizationSchema.index({ availabilityStatus: 1 });

export default mongoose.model("Organization", organizationSchema);