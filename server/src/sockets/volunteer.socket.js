const TEAM_CHAT_HISTORY_LIMIT = 100;
const teamChatMessagesByRoom = new Map();

const sanitizeText = (value, maxLength = 1200) => {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
};

const getRoomMessages = (room) => {
  if (!teamChatMessagesByRoom.has(room)) {
    teamChatMessagesByRoom.set(room, []);
  }
  return teamChatMessagesByRoom.get(room);
};

export function registerVolunteerSocket(io) {
  io.on("connection", (socket) => {
    socket.on("volunteer:chat:join", ({ room = "volunteer-team-global", userId, userName } = {}) => {
      const safeRoom = sanitizeText(room, 80) || "volunteer-team-global";
      socket.join(safeRoom);
      socket.data.userId = sanitizeText(userId, 80);
      socket.data.userName = sanitizeText(userName, 80) || "Volunteer";

      socket.emit("volunteer:chat:history", {
        room: safeRoom,
        messages: getRoomMessages(safeRoom),
      });

      socket.to(safeRoom).emit("volunteer:chat:system", {
        id: `${Date.now()}-${Math.random()}`,
        type: "system",
        text: `${socket.data.userName} joined the chat`,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("volunteer:chat:message", ({ room = "volunteer-team-global", text } = {}) => {
      const safeRoom = sanitizeText(room, 80) || "volunteer-team-global";
      const safeText = sanitizeText(text, 1000);
      if (!safeText) return;

      const message = {
        id: `${Date.now()}-${Math.random()}`,
        type: "message",
        room: safeRoom,
        text: safeText,
        sender: {
          userId: socket.data.userId || "",
          name: socket.data.userName || "Volunteer",
        },
        createdAt: new Date().toISOString(),
      };

      const roomMessages = getRoomMessages(safeRoom);
      roomMessages.push(message);
      if (roomMessages.length > TEAM_CHAT_HISTORY_LIMIT) {
        roomMessages.splice(0, roomMessages.length - TEAM_CHAT_HISTORY_LIMIT);
      }

      io.to(safeRoom).emit("volunteer:chat:new", message);
    });

    socket.on("disconnect", () => {
      const userName = socket.data.userName || "Volunteer";
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit("volunteer:chat:system", {
            id: `${Date.now()}-${Math.random()}`,
            type: "system",
            text: `${userName} left the chat`,
            createdAt: new Date().toISOString(),
          });
        }
      });
    });
  });
}
