import express from "express";
import authMiddleware from "../middleware/auth.js";
import redis from "../redis.js";
import User from "../models/user.js";
const router = express.Router();

// Create a room if logged in
router.post("/create-room", authMiddleware, async (req, res) => {
  // optional get some settings if we want
  // const { capacity, settings = {} } = req.body;

  // also check if user has already made a room
  // maybe see if req.userId is associated with a room in redis

  try {
    // Generate a random 4-character room code
    // Need to check if the room code already exists
    const roomCode = generateRoomCode();

    // Get the creator's user info
    const user = await User.findById(req.userId);

    // Create room data structure
    const roomData = {
      code: roomCode,
      fiesteros: [{
        userId: req.userId,
        username: user.username,
        profilePicture: user.profilePicture
      }]
    };

    // Store room data in Redis
    await redis.set(`room:${roomCode}`, JSON.stringify(roomData));

    // expire the room after 20 min
    await redis.expire(`room:${roomCode}`, 1200);

    // return response
    res.json({ roomCode });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Failed to create room" });
  }
});

// Helper function to generate room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Endpoint to join a room
router.post("/room/:roomCode/join", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();

    // Check if room exists
    const roomExists = await redis.exists(`room:${roomCode}`);
    if (!roomExists) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get current room data
    const roomData = JSON.parse(await redis.get(`room:${roomCode}`));

    // Get the joining user's info
    const user = await User.findById(req.userId);

    // Check if user is already in the room
    const isUserInRoom = roomData.fiesteros.some(
      fiestero => fiestero.userId === req.userId
    );

    if (!isUserInRoom) {
      // Add user to fiesteros array
      roomData.fiesteros.push({
        userId: req.userId,
        username: user.username,
        profilePicture: user.profilePicture
      });

      // Update room data in Redis
      await redis.set(`room:${roomCode}`, JSON.stringify(roomData));
    }

    res.json({ message: "Room joined successfully" });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "Failed to join room" });
  }
});

// Get room data
router.get("/room/:roomCode", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();

    // Check if room exists
    const roomExists = await redis.exists(`room:${roomCode}`);
    if (!roomExists) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get room data
    const roomData = JSON.parse(await redis.get(`room:${roomCode}`));

    // Return only necessary user data
    res.json({
      code: roomCode,
      fiesteros: roomData.fiesteros.map(fiestero => ({
        username: fiestero.username,
        profilePicture: fiestero.profilePicture
      }))
    });
  } catch (error) {
    console.error("Error getting room:", error);
    res.status(500).json({ message: "Failed to get room data" });
  }
});

// Leave room
router.post("/room/:roomCode/leave", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();

    // Check if room exists
    const roomExists = await redis.exists(`room:${roomCode}`);
    if (!roomExists) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get current room data
    const roomData = JSON.parse(await redis.get(`room:${roomCode}`));

    // Remove user from fiesteros array
    roomData.fiesteros = roomData.fiesteros.filter(
      fiestero => fiestero.userId !== req.userId
    );

    // If room is empty, delete it
    if (roomData.fiesteros.length === 0) {
      await redis.del(`room:${roomCode}`);
    } else {
      // Update room data
      await redis.set(`room:${roomCode}`, JSON.stringify(roomData));
    }

    res.json({ message: "Left room successfully" });
  } catch (error) {
    console.error("Error leaving room:", error);
    res.status(500).json({ message: "Failed to leave room" });
  }
});

export default router;