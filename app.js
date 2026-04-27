import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import rootRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import sessionSocket from "./sockets/sessionSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

app.use(express.json());

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to MongoDB!");
    } else {
      console.log("MONGO_URI not found in env. Database not connected.");
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error}`);
  }
};

connectDB();

// Setup Socket.IO
sessionSocket(io);

// Root Router
app.use("/api", rootRouter);

app.get("/", (req, res) => {
  res.send("Express API is running...");
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
