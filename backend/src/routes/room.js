import express from "express";
import authMiddleware from "../middleware/auth.js";
import redis from "../redis.js";
import User from "../models/user.js";
import { fetchTriviaQuestions } from "../trivia.js";
import { GAME_CONSTANTS } from "../constants/gameConstants.js";

const router = express.Router();
const ROOM_PREFIX = "room:";
const ROOM_CODE_LENGTH = 4;
const ROOM_EXPIRY = 1200; // 20 minutes in seconds
const QUESTION_TIME_LIMIT = GAME_CONSTANTS.QUESTION_TIME_LIMIT;
const MAX_QUESTIONS = GAME_CONSTANTS.MAX_QUESTIONS;
const timers = new Map();

// Game state constants
export const GAME_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
};

export const EVENT_TYPES = {
  GAME_START: "game_start",
  NEXT_QUESTION: "next_question",
  TIME_UPDATE: "time_update",
  GAME_OVER: "game_over",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  ANSWER_SUBMITTED: "answer_submitted",
  ERROR: "error",
};

const startTimer = async (roomCode, roomData, broadcastToRoom) => {
  // Clear existing timer if any
  const existingTimer = timers.get(roomCode);
  if (existingTimer) {
    clearInterval(existingTimer);
  }

  const timer = setInterval(async () => {
    try {
      const currentRoomData = await getRoomData(roomCode);

      if (
        !currentRoomData.gameState ||
        currentRoomData.gameState.status !== GAME_STATUS.ACTIVE
      ) {
        clearInterval(timer);
        timers.delete(roomCode);
        return;
      }

      currentRoomData.gameState.timeRemaining--;

      // Broadcast time update
      await handleTimeUpdate(
        roomCode,
        currentRoomData,
        currentRoomData.gameState.timeRemaining,
        broadcastToRoom,
      );

      // Check if time is up
      if (currentRoomData.gameState.timeRemaining <= 0) {
        clearInterval(timer);
        timers.delete(roomCode);

        // Check if this was the last question
        if (
          currentRoomData.gameState.currentQuestion >=
          currentRoomData.gameState.questions.length - 1
        ) {
          await handleGameOver(roomCode, currentRoomData, broadcastToRoom);
        } else {
          // Move to next question and start new timer
          await handleNextQuestion(roomCode, currentRoomData, broadcastToRoom);
          startTimer(roomCode, currentRoomData, broadcastToRoom);
        }
      }
    } catch (error) {
      console.error("Error in timer:", error);
      clearInterval(timer);
      timers.delete(roomCode);
    }
  }, 1000);

  // Store timer reference
  timers.set(roomCode, timer);
  return timer;
};

// Helper functions
const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: ROOM_CODE_LENGTH }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

const getRoomKey = (roomCode) => `${ROOM_PREFIX}${roomCode}`;

const getInitialGameState = async (fiesteros) => {
  let questions = await fetchTriviaQuestions();
  questions = questions.slice(0, MAX_QUESTIONS);

  return {
    status: GAME_STATUS.ACTIVE,
    currentQuestion: 0,
    timeRemaining: QUESTION_TIME_LIMIT,
    totalQuestions: MAX_QUESTIONS,
    players: fiesteros.map((f) => ({
      userId: f.userId,
      username: f.username,
      score: 0,
      avatar: f.avatar,
      correctAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalResponseTime: 0,
      questionsAnswered: 0,
      avgResponseTime: 0,
    })),
    questions,
  };
};

// Room management functions
export const createRoom = async (userId, user) => {
  const roomCode = generateRoomCode();
  const roomData = {
    code: roomCode,
    gameState: null,
    fiesteros: [
      {
        userId,
        username: user.username,
        avatar: user.avatar,
      },
    ],
  };

  const roomKey = getRoomKey(roomCode);
  await redis.set(roomKey, JSON.stringify(roomData));
  await redis.expire(roomKey, ROOM_EXPIRY);

  return roomCode;
};

export const getRoomData = async (roomCode) => {
  const roomKey = getRoomKey(roomCode);
  const exists = await redis.exists(roomKey);
  if (!exists) {
    throw new Error("Room not found");
  }
  return JSON.parse(await redis.get(roomKey));
};

export const updateRoomData = async (roomCode, roomData) => {
  await redis.set(getRoomKey(roomCode), JSON.stringify(roomData));
};

// Game management functions
export const startGame = async (roomCode, broadcastToRoom) => {
  const roomData = await getRoomData(roomCode);
  roomData.gameState = await getInitialGameState(roomData.fiesteros);

  // Verify questions before proceeding
  if (
    !roomData.gameState.questions ||
    roomData.gameState.questions.length === 0
  ) {
    roomData.gameState.questions = getFallbackQuestions();
  }

  await updateRoomData(roomCode, roomData);

  broadcastToRoom(roomCode, {
    type: EVENT_TYPES.GAME_START,
    currentQuestion: roomData.gameState.questions[0],
    timeRemaining: QUESTION_TIME_LIMIT,
  });

  // Start the timer
  await startTimer(roomCode, roomData, broadcastToRoom);

  return roomData.gameState;
};

export const submitAnswer = async (roomCode, userId, answer) => {
  const roomData = await getRoomData(roomCode);

  if (!roomData.gameState?.status === GAME_STATUS.ACTIVE) {
    throw new Error("No active game");
  }

  const currentQuestion =
    roomData.gameState.questions[roomData.gameState.currentQuestion];
  const isCorrect = answer === currentQuestion.correctAnswer;

  if (isCorrect) {
    const playerIndex = roomData.gameState.players.findIndex(
      (p) => p.userId === userId,
    );
    if (playerIndex !== -1) {
      roomData.gameState.players[playerIndex].score += 100;
      await updateRoomData(roomCode, roomData);
    }
  }

  return {
    isCorrect,
    currentScore: roomData.gameState.players.find((p) => p.userId === userId)
      ?.score,
  };
};

export const handleTimeUpdate = async (
  roomCode,
  roomData,
  timeRemaining,
  broadcastToRoom,
) => {
  roomData.gameState.timeRemaining = timeRemaining;
  await updateRoomData(roomCode, roomData);
  broadcastToRoom(roomCode, {
    type: EVENT_TYPES.TIME_UPDATE,
    timeRemaining,
  });
};

export const handleNextQuestion = async (
  roomCode,
  roomData,
  broadcastToRoom,
) => {
  roomData.gameState.currentQuestion++;

  // Check for end of questions
  if (roomData.gameState.currentQuestion >= MAX_QUESTIONS) {
    await handleGameOver(roomCode, roomData, broadcastToRoom);
    return null;
  }

  roomData.gameState.timeRemaining = QUESTION_TIME_LIMIT;

  await updateRoomData(roomCode, roomData);
  broadcastToRoom(roomCode, {
    type: EVENT_TYPES.NEXT_QUESTION,
    currentQuestion:
      roomData.gameState.questions[roomData.gameState.currentQuestion],
    timeRemaining: QUESTION_TIME_LIMIT,
  });

  // Start new timer for next question
  await startTimer(roomCode, roomData, broadcastToRoom);

  return QUESTION_TIME_LIMIT;
};

export const handleGameOver = async (roomCode, roomData, broadcastToRoom) => {
  // Clear any existing timer
  const timer = timers.get(roomCode);
  if (timer) {
    clearInterval(timer);
    timers.delete(roomCode);
  }

  roomData.gameState.status = GAME_STATUS.COMPLETED;

  const sortedPlayers = [...roomData.gameState.players].sort(
    (a, b) => b.score - a.score,
  );

  await updateRoomData(roomCode, roomData);
  broadcastToRoom(roomCode, {
    type: EVENT_TYPES.GAME_OVER,
    finalScores: roomData.gameState.players,
  });
};

// HTTP Routes
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

router.get("/room/:roomCode", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const roomData = await getRoomData(roomCode);

    res.json({
      code: roomCode,
      fiesteros: roomData.fiesteros,
      gameState: roomData.gameState,
    });
  } catch (error) {
    console.error("Error getting room:", error);
    if (error.message === "Room not found") {
      res.status(404).json({ message: "Room not found" });
    } else {
      res.status(500).json({ message: "Failed to get room data" });
    }
  }
});

router.post("/room/:roomCode/join", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const roomData = await getRoomData(roomCode);
    const user = await User.findById(req.userId);

    const isUserInRoom = roomData.fiesteros.some(
      (f) => f.userId === req.userId,
    );
    if (!isUserInRoom) {
      roomData.fiesteros.push({
        userId: req.userId,
        username: user.username,
        avatar: user.avatar,
      });
      await updateRoomData(roomCode, roomData);
    }

    res.json({ message: "Room joined successfully" });
  } catch (error) {
    console.error("Error joining room:", error);
    if (error.message === "Room not found") {
      res.status(404).json({ message: "Room not found" });
    } else {
      res.status(500).json({ message: "Failed to join room" });
    }
  }
});

router.post("/room/:roomCode/start", authMiddleware, async (req, res) => {
  try {
    const roomCode = req.params.roomCode.toUpperCase();
    const roomData = await getRoomData(roomCode);

    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Reset game state
    roomData.gameState = await getInitialGameState(roomData.fiesteros);
    await updateRoomData(roomCode, roomData);

    // If you have a reference to the WebSocket broadcast function
    if (global.broadcastToRoom) {
      await startGame(roomCode, global.broadcastToRoom);
    }

    res.json({ message: "Game started successfully" });
  } catch (error) {
    console.error("Error starting game:", error);
    res.status(500).json({ message: "Failed to start game" });
  }
});

export default router;
