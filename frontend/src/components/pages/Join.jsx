import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header.jsx";
import PixelArtConverter from "../PixelArtConverter.jsx";
import "../../styles/Join.css";

const Join = () => {
  const [roomCode, setRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pixelArtImage, setPixelArtImage] = useState(null);
  const navigate = useNavigate();
  
  // Handle the pixel art conversion
  const handleImageConverted = (convertedImage) => {
    setPixelArtImage(convertedImage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage("Please log in to join a room");
        navigate('/login');
        return;
      }

      // First verify the room exists
      const checkRoomResponse = await fetch(`http://localhost:3002/api/room/${roomCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!checkRoomResponse.ok) {
        if (checkRoomResponse.status === 404) {
          setErrorMessage("Room not found. Please check the room code.");
        } else {
          const data = await checkRoomResponse.json();
          setErrorMessage(data.message || "Failed to verify room");
        }
        return;
      }

      // Join the room
      const joinResponse = await fetch(`http://localhost:3002/api/room/${roomCode}/join`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!joinResponse.ok) {
        const data = await joinResponse.json();
        setErrorMessage(data.message || "Failed to join room");
        return;
      }

      // If joining was successful, navigate to the waiting room
      setSuccessMessage("Joined room successfully!");
      navigate(`/room/${roomCode}`);
      
    } catch (error) {
      setErrorMessage("Failed to join the room. Please check your connection.");
      console.error("Error:", error);
    }
  };

  // If user is not logged in, redirect to login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="join-container">
      <Header title="Join a Room" />
      <form onSubmit={handleSubmit} className="join-form">
        <div className="form-group">
          <label>Room Code:</label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            required
            maxLength={4}
            placeholder="Enter room code"
            className="room-code-input"
          />
        </div>
        
        <div className="form-group">
          <label>Your Avatar:</label>
          <PixelArtConverter onImageConverted={handleImageConverted} />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        
        <button className="join-button" type="submit">
          Join Room
        </button>
      </form>
    </div>
  );
};

export default Join;