import Session from "../models/Session.js";

const sessionSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected to session socket: ${socket.id}`);

    socket.on("joinGroup", ({ groupId }) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    socket.on("sessionStarted", async ({ groupId, text, duration }) => {
      io.to(groupId).emit("sessionStarted", { text, duration });

      let timeLeft = duration * 60;

      const timerInterval = setInterval(() => {
        timeLeft -= 1;
        io.to(groupId).emit("timerSync", { timeLeft });

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          io.to(groupId).emit("sessionEnded", { message: "Time is up!" });
          
          Session.updateMany(
            { groupId, status: "active" },
            { status: "completed" }
          ).exec();
        }
      }, 1000);
    });
    
    socket.on("submitResult", (data) => {
        socket.to(data.groupId).emit("newResult", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default sessionSocket;
