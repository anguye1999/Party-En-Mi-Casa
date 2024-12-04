// This is some boilerplate I haven't tested it

import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

export const createWebSocketRouter = (server, jwtSecret) => {
  const wss = new WebSocketServer({ server });

  // Store active connections
  const clients = new Map();

  wss.on("connection", async (ws, req) => {
    try {
      // Get token from query parameter
      // Might need to change localhost
      const url = new URL(req.url, "ws://localhost");
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(1008, "Authorization required");
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, jwtSecret);
      const userId = decoded.userId;

      // Store connection with userId
      clients.set(ws, {
        userId,
        roomCode: null,
      });

      console.log(`Client connected: ${userId}`);

      // Handle incoming messages
      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data);

          switch (message.type) {
            case "join_room":
              const roomCode = message.roomCode;
              const clientInfo = clients.get(ws);
              clientInfo.roomCode = roomCode;

              // Broadcast to others in room
              broadcastToRoom(
                roomCode,
                {
                  type: "user_joined",
                  userId: clientInfo.userId,
                  roomCode,
                },
                ws,
              ); // Exclude sender
              break;

            case "leave_room":
              const client = clients.get(ws);
              if (client.roomCode) {
                broadcastToRoom(
                  client.roomCode,
                  {
                    type: "user_left",
                    userId: client.userId,
                    roomCode: client.roomCode,
                  },
                  ws,
                );
                client.roomCode = null;
              }
              break;

            default:
              // Broadcast message to room if user is in one
              const currentClient = clients.get(ws);
              if (currentClient.roomCode) {
                broadcastToRoom(
                  currentClient.roomCode,
                  {
                    ...message,
                    userId: currentClient.userId,
                  },
                  ws,
                );
              }
          }
        } catch (err) {
          console.error("Error handling message:", err);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            }),
          );
        }
      });

      // Handle client disconnect
      ws.on("close", () => {
        const client = clients.get(ws);
        if (client && client.roomCode) {
          broadcastToRoom(
            client.roomCode,
            {
              type: "user_left",
              userId: client.userId,
              roomCode: client.roomCode,
            },
            ws,
          );
        }
        clients.delete(ws);
        console.log(`Client disconnected: ${userId}`);
      });
    } catch (err) {
      console.error("WebSocket authentication error:", err);
      ws.close(1008, "Authentication failed");
    }
  });

  // Utility function to broadcast to all clients in a room
  const broadcastToRoom = (roomCode, message, excludeWs = null) => {
    clients.forEach((client, ws) => {
      if (ws !== excludeWs && client.roomCode === roomCode) {
        ws.send(JSON.stringify(message));
      }
    });
  };

  return wss;
};
