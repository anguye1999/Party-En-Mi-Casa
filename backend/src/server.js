import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { createWebSocketRouter } from "./routes/websockets.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/room.js";

const app = express();
const wsApp = express();

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(bodyParser.json());
app.use("/api", authRoutes);
app.use("/api", roomRoutes);

// Create separate servers
const httpServer = createServer(app);
const wsServer = createServer(wsApp);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB: ", error));

// Initialize WebSocket server on its own port
const JWT_SECRET = process.env.JWT_SECRET;
const wss = createWebSocketRouter(wsServer, JWT_SECRET);

// Start HTTP server on 3002
const API_PORT = process.env.API_PORT || 3002;
httpServer.listen(API_PORT, () => {
  console.log(`HTTP Server running on port ${API_PORT}`);
});

// Start WebSocket server on 3001
const WS_PORT = process.env.WS_PORT || 3001;
wsServer.listen(WS_PORT, () => {
  console.log(`WebSocket Server running on port ${WS_PORT}`);
});