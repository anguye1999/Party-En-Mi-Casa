import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header.jsx";
import "../../styles/Join.css";

const API_BASE_URL = "http://localhost:3002/api";

const Join = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    roomCode: "",
    errorMessage: "",
<<<<<<< HEAD
    successMessage: ""
  });

  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
=======
    successMessage: "",
  });

  const updateFormState = (updates) => {
    setFormState((prev) => ({ ...prev, ...updates }));
>>>>>>> pemc-helpme
  };

  const clearMessages = () => {
    updateFormState({ errorMessage: "", successMessage: "" });
  };

  const verifyRoom = async (token) => {
<<<<<<< HEAD
    const response = await fetch(`${API_BASE_URL}/room/${formState.roomCode}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Room not found. Please check the room code.");
      }
      const data = await response.json();
      throw new Error(data.message || "Failed to verify room");
=======
    try {
      const response = await fetch(
        `${API_BASE_URL}/room/${formState.roomCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const text = await response.text();

        if (response.status === 404) {
          throw new Error("Room not found. Please check the room code.");
        }
        throw new Error("Failed to verify room");
      }
    } catch (error) {
      throw error;
>>>>>>> pemc-helpme
    }
  };

  const joinRoom = async (token) => {
<<<<<<< HEAD
    const response = await fetch(`${API_BASE_URL}/room/${formState.roomCode}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to join room");
=======
    try {
      const response = await fetch(
        `${API_BASE_URL}/room/${formState.roomCode}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const text = await response.text();

        throw new Error("Failed to join room");
      }
    } catch (error) {
      console.error("Full error:", error);
      throw error;
>>>>>>> pemc-helpme
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

<<<<<<< HEAD
    const token = localStorage.getItem('token');
    if (!token) {
      updateFormState({ errorMessage: "Please log in to join a room" });
      navigate('/login');
=======
    const token = localStorage.getItem("token");
    if (!token) {
      updateFormState({ errorMessage: "Please log in to join a room" });
      navigate("/login");
>>>>>>> pemc-helpme
      return;
    }

    try {
      await verifyRoom(token);
      await joinRoom(token);
<<<<<<< HEAD
      
=======

>>>>>>> pemc-helpme
      updateFormState({ successMessage: "Joined room successfully!" });
      navigate(`/room/${formState.roomCode}`);
    } catch (error) {
      console.error("Error:", error);
<<<<<<< HEAD
      updateFormState({ 
        errorMessage: error.message || "Failed to join the room. Please check your connection." 
=======
      updateFormState({
        errorMessage:
          error.message ||
          "Failed to join the room. Please check your connection.",
>>>>>>> pemc-helpme
      });
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
=======
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
>>>>>>> pemc-helpme
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
            value={formState.roomCode}
<<<<<<< HEAD
            onChange={(e) => updateFormState({ 
              roomCode: e.target.value.toUpperCase() 
            })}
=======
            onChange={(e) =>
              updateFormState({
                roomCode: e.target.value.toUpperCase(),
              })
            }
>>>>>>> pemc-helpme
            required
            maxLength={4}
            placeholder="Enter room code"
            className="room-code-input"
          />
        </div>

        {formState.errorMessage && (
          <p className="error-message">{formState.errorMessage}</p>
        )}
        {formState.successMessage && (
          <p className="success-message">{formState.successMessage}</p>
        )}
<<<<<<< HEAD
        
=======

>>>>>>> pemc-helpme
        <button className="join-button" type="submit">
          Join Room
        </button>
      </form>
    </div>
  );
};

<<<<<<< HEAD
export default Join;
=======
export default Join;
>>>>>>> pemc-helpme
