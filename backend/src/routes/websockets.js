import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { 
  getRoomData,
  startGame
} from "./room.js";

const HEARTBEAT_INTERVAL = 30000;

export const createWebSocketRouter = (server, jwtSecret) => {
  const clients = new Map();

  const broadcastToRoom = (roomCode, message, excludeWs = null) => {
    clients.forEach((client, ws) => {
      if (ws.readyState === ws.OPEN && ws !== excludeWs && client.roomCode === roomCode) {
        ws.send(JSON.stringify(message));
      }
    });
  };

  const heartbeat = () => {
    clients.forEach((client, ws) => {
      if (!client.isAlive) {
        clients.delete(ws);
        ws.terminate();
        return;
      }
      client.isAlive = false;
      ws.ping();
    });
  };

  const wss = new WebSocketServer({ 
    server,
    verifyClient: (info, callback) => {
      try {
        // Parse token from query string
        const token = new URLSearchParams(info.req.url.split('?')[1]).get('token');
        if (!token) {
          callback(false, 401, 'Unauthorized');
          return;
        }

        const decoded = jwt.verify(token, jwtSecret);
        info.req.userId = decoded.userId;
        callback(true);
      } catch (err) {
        console.error('WebSocket authentication error:', err);
        callback(false, 401, 'Unauthorized');
      }
    }
  });

  // Log when server is created
  console.log('WebSocket server created on path: /game');

  const interval = setInterval(heartbeat, HEARTBEAT_INTERVAL);

  wss.on("connection", async (ws, req) => {
    const userId = req.userId;
    
    // Initialize client
    clients.set(ws, {
      userId,
      roomCode: null,
      isAlive: true
    });

    console.log(`Client connected: ${userId}`);

    // Handle pong messages
    ws.on("pong", () => {
      const client = clients.get(ws);
      if (client) {
        client.isAlive = true;
      }
    });

    // Handle incoming messages
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data);
        const client = clients.get(ws);

        switch (message.type) {
          case "join_room": {
            const roomCode = message.roomCode.toUpperCase();
            try {
              const roomData = await getRoomData(roomCode);
              client.roomCode = roomCode;

              // Send room state to joined user
              ws.send(JSON.stringify({
                type: "room_state",
                roomData
              }));

              // Notify others
              broadcastToRoom(roomCode, {
                type: "user_joined",
                userId: client.userId
              }, ws);
            } catch (error) {
              console.error('Error joining room:', error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to join room"
              }));
            }
            break;
          }

          case "leave_room": {
            if (client.roomCode) {
              broadcastToRoom(client.roomCode, {
                type: "user_left",
                userId: client.userId
              }, ws);
              client.roomCode = null;
            }
            break;
          }

          case "start_game": {
            if (!client.roomCode) break;
            
            try {
              const gameState = await startGame(client.roomCode, broadcastToRoom);
              broadcastToRoom(client.roomCode, {
                type: "game_start",
                gameState
              });
            } catch (error) {
              console.error('Error starting game:', error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to start game"
              }));
            }
            break;
          }

          case "submit_answer": {
            if (!client.roomCode) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Not in a room"
              }));
              break;
            }
            
            try {
              // Handle answer submission
              broadcastToRoom(client.roomCode, {
                type: "answer_submitted",
                userId: client.userId,
                answer: message.answer
              });
            } catch (error) {
              console.error('Error submitting answer:', error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to submit answer"
              }));
            }
            break;
          }

          default:
            ws.send(JSON.stringify({
              type: "error",
              message: "Unknown message type"
            }));
        }
      } catch (err) {
        console.error("Error handling message:", err);
        ws.send(JSON.stringify({
          type: "error",
          message: "Invalid message format"
        }));
      }
    });

    // Handle client disconnect
    ws.on("close", () => {
      const client = clients.get(ws);
      if (client?.roomCode) {
        broadcastToRoom(client.roomCode, {
          type: "user_left",
          userId: client.userId
        }, ws);
      }
      clients.delete(ws);
      console.log(`Client disconnected: ${userId}`);
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      const client = clients.get(ws);
      if (client?.roomCode) {
        broadcastToRoom(client.roomCode, {
          type: "user_left",
          userId: client.userId
        }, ws);
      }
      clients.delete(ws);
    });
  });

  // Clean up on server close
  wss.on("close", () => {
    clearInterval(interval);
    clients.clear();
  });

  return wss;
};