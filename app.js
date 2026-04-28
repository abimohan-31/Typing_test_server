import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
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

app.use(cors());
app.use(express.json());

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI not found in env. Refusing to start without DB.");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");
}

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

connectDB()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB. Server not started.");
    console.error(error);
    process.exitCode = 1;
  });
