import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

// Load environment variables as early as possible
dotenv.config();



import rootRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import sessionSocket from "./sockets/sessionSocket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://typingtestclientrepo-production.up.railway.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

// Manual cookie parser middleware (to avoid dependency issues with missing cookie-parser)
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      req.cookies[name.trim()] = rest.join("=").trim();
    });
  }
  next();
});

// Configure CORS with credentials support
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://typingtestclientrepo-production.up.railway.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Setup Socket.IO
sessionSocket(io);

// Root Router
app.use("/api", rootRouter);

app.get("/", (req, res) => {
  res.send("Express API is running with Cookie Auth...");
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("CRITICAL: MONGO_URI not found in environment variables!");
    return;
  }
  
  console.log("Attempting to connect to MongoDB...");
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail after 5 seconds instead of 30
    });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error; // Rethrow to be caught by the caller
  }
}

connectDB()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB. Server not started.");
    console.error(error);
    process.exit(1);
  });
