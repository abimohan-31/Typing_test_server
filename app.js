import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import rootRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import sessionSocket from "./sockets/sessionSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "DELETE"]
  }
});

// Use cookie-parser before routes
app.use(cookieParser());

// Configure CORS with credentials support
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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

    const allowNoDb = String(process.env.START_WITHOUT_DB || "")
      .trim()
      .toLowerCase();

    if (allowNoDb === "true" || allowNoDb === "1" || allowNoDb === "yes") {
      console.warn(
        "START_WITHOUT_DB enabled: starting server without MongoDB connection."
      );
      server.listen(PORT, () =>
        console.log(`Server is running on http://localhost:${PORT}`)
      );
      return;
    }

    process.exitCode = 1;
  });
