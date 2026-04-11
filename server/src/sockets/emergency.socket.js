import EmergencyMessage from '../models/EmergencyMessage.js';

export const registerEmergencySocket = (io) => {
  io.on("connection", (socket) => {
    
    // Join a specific emergency service room (e.g. 'medical', 'fire', 'police')
    socket.on("join_emergency_room", (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined emergency room: ${roomName}`);
    });

    // Leave a specific emergency service room
    socket.on("leave_emergency_room", (roomName) => {
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left emergency room: ${roomName}`);
    });

    // Handle incoming broadcast messages from a client in a specific room
    socket.on("citizen:send_message", async (data) => {
      try {
        console.log('Received payload:', data);
        
        // Destructure the actual fields sent by the frontend useEmergencyChat hook
        const { serviceType, text, sender } = data;

        // Persist message directly to the database mapping them correctly
        const newEmergencyMessage = await EmergencyMessage.create({
          serviceType,
          senderName: 'Anonymous Citizen', // Default since frontend hook doesn't currently provide user info
          senderRole: 'Citizen', 
          content: text // Map frontend 'text' to backend 'content'
        });

        console.log(`[${serviceType}] New emergency message created`);

        // Broadcast to all clients inside the designated room
        // Format the message consistent with the schema so it seamlessly renders clientside
        io.to(serviceType).emit("service:send_message", newEmergencyMessage);
      } catch (error) {
        console.error("Socket error persisting emergency message: ", error);
        // Optionally emit an error event back to sender
        socket.emit("emergency_message_error", { message: "Failed to send message" });
      }
    });
  });
};
