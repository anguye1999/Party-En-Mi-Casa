import express from "express";
import authMiddleware from "../middleware/auth.js";
import redis from "../redis.js";
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

    // some test redis stuff, need to figure out the actual implementation
    await redis.set("test_room", "joined the test room");
    await redis.set(roomCode, "joined the room");

    // console.log(req.userId); // this doesn't work

    // expire the room after 20 min
    // await redis.expire(`room:${roomId}`, 1200);

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
router.get("/room/:roomCode", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();

    // Check if room exists
    const roomExists = await redis.exists(`room:${roomCode}`);
    if (!roomExists) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room joined successfully" });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "Failed to join room" });
  }
});

export default router;
