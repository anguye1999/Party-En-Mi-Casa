<<<<<<< HEAD
/**
 * SERVER
 *
 * Sets up a Node.js/Express server that can handle authentication requests and
 * connect to a MongoDB database.
 */

=======
>>>>>>> pemc-helpme
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { createWebSocketRouter } from "./routes/websockets.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/room.js";

const app = express();
<<<<<<< HEAD

// Enable CORS, parsing of JSON requests and authentication-related API requests.
app.use(cors());

// Increase payload size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
=======
const wsApp = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

>>>>>>> pemc-helpme
app.use(bodyParser.json());
app.use("/api", authRoutes);
app.use("/api", roomRoutes);

<<<<<<< HEAD
// Connect to MongoDB using URI from the environment variables.
=======
// Create separate servers
const httpServer = createServer(app);
const wsServer = createServer(wsApp);

// Connect to MongoDB
>>>>>>> pemc-helpme
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB: ", error));

<<<<<<< HEAD
// Start the websockets
const server = createServer(app);
const JWT_SECRET = process.env.JWT_SECRET;
const wss = createWebSocketRouter(server, JWT_SECRET);

// Start backend server and listen on API_PORT from the environment variables.
const API_PORT = process.env.API_PORT;
app.listen(API_PORT, () => {
  console.log(`Server is running on port ${API_PORT}`);
=======
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
>>>>>>> pemc-helpme
});
