import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import Footer from "../Footer";
import Header from "../Header";
<<<<<<< HEAD
import "../../styles/WaitingRoom.css";

const API_BASE_URL = "http://localhost:3002/api";
const CLIENT_URL = "http://localhost:3000";
const POLLING_INTERVAL = 5000;
const QR_CODE_SIZE = 200;

=======
import { GAMES } from "../../constants";
import "../../styles/WaitingRoom.css";

const API_BASE_URL = "http://localhost:3002/api";
const WS_BASE_URL = "ws://localhost:3001";
const CLIENT_URL = "http://localhost:3000";
const QR_CODE_SIZE = 200;

const EVENT_TYPES = {
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  GAME_START: "game_start",
  ROOM_STATE: "room_state",
};

>>>>>>> pemc-helpme
const WaitingRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [fiesteros, setFiesteros] = useState([]);
<<<<<<< HEAD
  const [gameChoice, setGameChoice] = useState("");
  const [error, setError] = useState("");

  const fetchRoomData = async () => {
=======
  const [gameChoice, setGameChoice] = useState(() =>
    localStorage.getItem("gameChoice"),
  );
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);

  const fetchInitialRoomData = async () => {
>>>>>>> pemc-helpme
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/room/${code}`, {
        headers: {
<<<<<<< HEAD
          'Authorization': `Bearer ${token}`
        }
      });
      
=======
          Authorization: `Bearer ${token}`,
        },
      });

>>>>>>> pemc-helpme
      if (!response.ok) {
        if (response.status === 404) {
          setError("Room not found");
          navigate("/home");
          return;
        }
<<<<<<< HEAD
        throw new Error('Failed to fetch room data');
      }
      
=======
        throw new Error("Failed to fetch room data");
      }

>>>>>>> pemc-helpme
      const data = await response.json();
      setFiesteros(data.fiesteros);
    } catch (error) {
      console.error("Error fetching room data:", error);
      setError("Failed to load room data");
    }
  };

<<<<<<< HEAD
  const startGame = async () => {
    try {
      const token = localStorage.getItem("token");
      const startResponse = await fetch(`${API_BASE_URL}/room/${code}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!startResponse.ok) {
        throw new Error('Failed to start game');
      }
  
      if (gameChoice === "Game Uno") {
        navigate(`/room/${code}/gameuno`);
      } else {
        console.log("Vamos clicked, but no action taken for:", gameChoice);
      }
    } catch (error) {
      console.error("Error starting game:", error);
      setError("Failed to start game");
=======
  const startGame = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "start_game",
          roomCode: code,
        }),
      );
    } else {
      setError("Connection lost. Please refresh the page.");
    }
  };

  // Handle game events
  const handleGameEvent = (data) => {
    switch (data.type) {
      case EVENT_TYPES.ROOM_STATE:
        setFiesteros(data.roomData.fiesteros);
        break;

      case EVENT_TYPES.USER_JOINED:
        setFiesteros((prev) => {
          if (!prev.some((f) => f.username === data.username)) {
            return [
              ...prev,
              {
                username: data.username,
                avatar: data.avatar,
              },
            ];
          }
          return prev;
        });
        break;

      case EVENT_TYPES.USER_LEFT:
        setFiesteros((prev) => prev.filter((f) => f.userId !== data.userId));
        break;

      case EVENT_TYPES.GAME_START:
        console.log("Game start event received");
        const currentGameChoice = localStorage.getItem("gameChoice");
        console.log("Current gameChoice from localStorage:", currentGameChoice);
        if (currentGameChoice === GAMES.UNO) {
          navigate(`/room/${code}/gameuno`);
        } else {
          console.log("Unrecognized game choice:", currentGameChoice);
        }
        break;
>>>>>>> pemc-helpme
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

<<<<<<< HEAD
    fetchRoomData();
    const pollInterval = setInterval(fetchRoomData, POLLING_INTERVAL);
    setGameChoice(localStorage.getItem("gameChoice"));

    return () => clearInterval(pollInterval);
=======
    // Fetch initial room data
    fetchInitialRoomData();

    const storedChoice = localStorage.getItem("gameChoice");
    console.log("Stored game choice:", storedChoice);
    setGameChoice(storedChoice);

    // Setup WebSocket connection
    console.log("Connecting to WebSocket...");
    const ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected, joining room:", code);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomCode: code,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleGameEvent(data);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Please refresh the page.");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setError("Connection lost. Please refresh the page.");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "leave_room",
          }),
        );
        ws.close();
      }
    };
>>>>>>> pemc-helpme
  }, [code, navigate]);

  const renderAvatar = (fiestero) => (
    <div className="fiestero-avatar">
      <img
        src={fiestero.avatar || "/src/assets/char_icon.png"}
        alt={`${fiestero.username}'s avatar`}
        className="user-avatar"
      />
    </div>
  );

  return (
    <div className="waiting-room">
      <Header title="Waiting Room" />
      {error && <div className="error-message">{error}</div>}
      <div className="waiting-room-container">
        <div className="code-box eight-bit-box">
          <h2>Code De Habitación</h2>
          <p className="room-code">{code}</p>
          <QRCodeCanvas
            className="QR-code"
            value={`${CLIENT_URL}/join/${code}`}
            size={QR_CODE_SIZE}
          />
        </div>
        <div className="fiesteros-box eight-bit-box">
          <h2>Fiesteros</h2>
          <ul className="fiesteros-list">
            {fiesteros.map((fiestero, index) => (
              <li key={index} className="fiestero-item">
                {renderAvatar(fiestero)}
                <span className="fiestero-username">{fiestero.username}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer>
        <button
          className="footer-button back-button"
          onClick={() => navigate("/home")}
        >
          Back
        </button>
        <button
          className="footer-button vamos-button"
          onClick={startGame}
          disabled={fiesteros.length < 1}
        >
          ¡VAMOS!
        </button>
      </Footer>
    </div>
  );
};

<<<<<<< HEAD
export default WaitingRoom;
=======
export default WaitingRoom;
>>>>>>> pemc-helpme
