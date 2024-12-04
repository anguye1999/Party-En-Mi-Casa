import express from "express";
import authMiddleware from "../middleware/auth.js";
import redis from "../redis.js";
import User from "../models/user.js";

const router = express.Router();
const ROOM_PREFIX = "room:";
const ROOM_CODE_LENGTH = 4;
const ROOM_EXPIRY = 1200; // 20 minutes in seconds
const QUESTION_TIME_LIMIT = 30;

// Game state constants
const GAME_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

const EVENT_TYPES = {
  GAME_START: 'GAME_START',
  NEXT_QUESTION: 'NEXT_QUESTION',
  TIME_UPDATE: 'TIME_UPDATE',
  GAME_OVER: 'GAME_OVER'
};

// Helper functions
const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: ROOM_CODE_LENGTH }, 
    () => chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

const getRoomKey = (roomCode) => `${ROOM_PREFIX}${roomCode}`;

const getInitialGameState = (fiesteros) => ({
  status: GAME_STATUS.ACTIVE,
  currentQuestion: 0,
  timeRemaining: QUESTION_TIME_LIMIT,
  players: fiesteros.map(f => ({
    userId: f.userId,
    username: f.username,
    score: 0,
    avatar: f.avatar
  })),
  questions: [
    {
      question: "Sample question 1?",
      answers: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
      correctAnswer: 0,
      timeLimit: QUESTION_TIME_LIMIT
    }
    // Add more questions as needed
  ]
});

const publishGameEvent = async (roomCode, type, payload) => {
  await redis.publish(`${getRoomKey(roomCode)}:events`, 
    JSON.stringify({ type, payload })
  );
};

// Room management functions
const createRoom = async (userId, user) => {
  const roomCode = generateRoomCode();
  const roomData = {
    code: roomCode,
    gameState: null,
    fiesteros: [{
      userId,
      username: user.username,
      avatar: user.avatar
    }]
  };

  const roomKey = getRoomKey(roomCode);
  await redis.set(roomKey, JSON.stringify(roomData));
  await redis.expire(roomKey, ROOM_EXPIRY);

  return roomCode;
};

const getRoomData = async (roomCode) => {
  const roomKey = getRoomKey(roomCode);
  const exists = await redis.exists(roomKey);
  if (!exists) {
    throw new Error("Room not found");
  }
  return JSON.parse(await redis.get(roomKey));
};

const updateRoomData = async (roomCode, roomData) => {
  await redis.set(getRoomKey(roomCode), JSON.stringify(roomData));
};

// Game timer management
const startGameTimer = async (roomCode) => {
  const roomKey = getRoomKey(roomCode);
  let timeRemaining = QUESTION_TIME_LIMIT;

  const timer = setInterval(async () => {
    try {
      const roomData = await getRoomData(roomCode);
      if (!roomData?.gameState) {
        clearInterval(timer);
        return;
      }

      timeRemaining--;

      if (timeRemaining <= 0) {
        await handleTimeUp(roomCode, roomData, timer);
      } else {
        await handleTimeUpdate(roomCode, roomData, timeRemaining);
      }
    } catch (error) {
      console.error("Error in game timer:", error);
      clearInterval(timer);
    }
  }, 1000);
};

const handleTimeUp = async (roomCode, roomData, timer) => {
  clearInterval(timer);
  
  if (roomData.gameState.currentQuestion < roomData.gameState.questions.length - 1) {
    await handleNextQuestion(roomCode, roomData);
  } else {
    await handleGameOver(roomCode, roomData);
  }
};

const handleTimeUpdate = async (roomCode, roomData, timeRemaining) => {
  roomData.gameState.timeRemaining = timeRemaining;
  await updateRoomData(roomCode, roomData);
  await publishGameEvent(roomCode, EVENT_TYPES.TIME_UPDATE, { timeRemaining });
};

const handleNextQuestion = async (roomCode, roomData) => {
  roomData.gameState.currentQuestion++;
  roomData.gameState.timeRemaining = QUESTION_TIME_LIMIT;
  
  await updateRoomData(roomCode, roomData);
  await publishGameEvent(roomCode, EVENT_TYPES.NEXT_QUESTION, {
    currentQuestion: roomData.gameState.questions[roomData.gameState.currentQuestion],
    timeRemaining: QUESTION_TIME_LIMIT
  });

  startGameTimer(roomCode);
};

const handleGameOver = async (roomCode, roomData) => {
  roomData.gameState.status = GAME_STATUS.COMPLETED;
  await updateRoomData(roomCode, roomData);
  await publishGameEvent(roomCode, EVENT_TYPES.GAME_OVER, {
    finalScores: roomData.gameState.players
  });
};

// Route handlers
router.post("/create-room", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const roomCode = await createRoom(req.userId, user);
    res.json({ roomCode });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Failed to create room" });
  }
});

router.post("/room/:roomCode/start", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const roomData = await getRoomData(roomCode);
    
    roomData.gameState = getInitialGameState(roomData.fiesteros);
    await updateRoomData(roomCode, roomData);

    await publishGameEvent(roomCode, EVENT_TYPES.GAME_START, {
      currentQuestion: roomData.gameState.questions[0],
      timeRemaining: QUESTION_TIME_LIMIT
    });

    startGameTimer(roomCode);
    res.json({ message: "Game started successfully" });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Failed to start game" });
  }
});

router.post("/room/:roomCode/answer", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const roomData = await getRoomData(roomCode);
    
    if (!roomData.gameState?.status === GAME_STATUS.ACTIVE) {
      return res.status(400).json({ message: "No active game" });
    }

    const currentQuestion = roomData.gameState.questions[roomData.gameState.currentQuestion];
    if (req.body.answer === currentQuestion.correctAnswer) {
      const playerIndex = roomData.gameState.players.findIndex(p => p.userId === req.userId);
      if (playerIndex !== -1) {
        roomData.gameState.players[playerIndex].score += 100;
        await updateRoomData(roomCode, roomData);
      }
    }

    res.json({ message: "Answer submitted successfully" });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ message: "Failed to submit answer" });
  }
});

router.post("/room/:roomCode/join", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const roomData = await getRoomData(roomCode);
    const user = await User.findById(req.userId);

    const isUserInRoom = roomData.fiesteros.some(f => f.userId === req.userId);
    if (!isUserInRoom) {
      roomData.fiesteros.push({
        userId: req.userId,
        username: user.username,
        avatar: user.avatar
      });
      await updateRoomData(roomCode, roomData);
    }

    res.json({ message: "Room joined successfully" });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "Failed to join room" });
  }
});

router.get("/room/:roomCode", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const roomData = await getRoomData(roomCode);

    res.json({
      code: roomCode,
      fiesteros: roomData.fiesteros.map(({ username, avatar }) => ({
        username,
        avatar
      }))
    });
  } catch (error) {
    console.error("Error getting room:", error);
    res.status(500).json({ message: "Failed to get room data" });
  }
});

router.get("/room/:roomCode/events", authMiddleware, async (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase();
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const subscriber = redis.duplicate();
  await subscriber.subscribe(`${getRoomKey(roomCode)}:events`);

  res.write('data: {"type":"connected"}\n\n');

  subscriber.on('message', (channel, message) => {
    res.write(`data: ${message}\n\n`);
  });

  req.on('close', async () => {
    await subscriber.unsubscribe();
    await subscriber.quit();
  });
});

export default router;