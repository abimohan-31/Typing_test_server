import Session from "../models/Session.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join Group
    socket.on("joinGroup", ({ groupId, userId }) => {
      socket.join(groupId);
      console.log(`User ${userId} joined group ${groupId}`);
    });

    // Start Session
    socket.on("startSession", async ({ groupId, text, duration }) => {
      // Broadcast test data to group
      io.to(groupId).emit("sessionStarted", { text, duration });

      let timeLeft = duration * 60; // duration in minutes to seconds

      // Sync timer
      const timerInterval = setInterval(() => {
        timeLeft -= 1;
        io.to(groupId).emit("timerSync", { timeLeft });

        // Auto end session
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          io.to(groupId).emit("sessionEnded", { message: "Time is up!" });
          
          Session.updateMany({ groupId, isActive: true }, { isActive: false }).exec();
        }
      }, 1000);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;
