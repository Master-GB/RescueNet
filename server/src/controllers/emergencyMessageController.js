import EmergencyMessage from '../models/EmergencyMessage.js';

export const getChatHistory = async (req, res) => {
  try {
    const { serviceType } = req.params;

    if (!serviceType) {
      return res.status(400).json({ success: false, message: 'Service type is required' });
    }

    // Fetch the most recent 100 messages for this service/room
    const messages = await EmergencyMessage.find({ serviceType })
      .sort({ createdAt: -1 })
      .limit(100)
      // .populate('senderId', 'firstName lastName') // we already store senderName and senderRole direct
      .exec();

    // Since we sorted by -1 for fetching the most recent, reverse them to show chronologically
    const chronologicalMessages = messages.reverse();

    res.status(200).json({ success: true, count: chronologicalMessages.length, messages: chronologicalMessages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: 'Server error fetching chat history' });
  }
};
