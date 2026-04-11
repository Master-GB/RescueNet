import mongoose from 'mongoose';

const emergencyMessageSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    senderName: {
      type: String,
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['Citizen', 'NGO', 'Volunteer', 'Admin', 'System'],
      default: 'Citizen',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const EmergencyMessage = mongoose.model('EmergencyMessage', emergencyMessageSchema);

export default EmergencyMessage;
