import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button.jsx";
import Footer from "../Footer.jsx";
import Header from "../Header.jsx";
import { GAMES } from "../../constants";
import "../../styles/Home.css";

const API_BASE_URL = "http://localhost:3002/api";

const GAME_BUTTONS = [
  { label: GAMES.UNO, className: "button-yellow" },
  { label: GAMES.DOS, className: "button-pink" },
  { label: GAMES.TRES, className: "button-blue" }
];

const Home = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async (token) => {
    const response = await fetch(`${API_BASE_URL}/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to create room");
    }

    return response.json();
  };

  const handleClick = async (gameChoice) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No token found, redirecting to login");
      navigate("/login");
      return;
    }
  
    if (gameChoice === GAMES.DOS || gameChoice === GAMES.TRES) {
      navigate("/coming-soon");
      return;
    }
  
    setLoading(true);
  
    try {
      const { roomCode } = await createRoom(token);
      console.log("Button clicked:", gameChoice);
      localStorage.setItem("gameChoice", gameChoice);
      console.log("Stored game choice:", localStorage.getItem("gameChoice"));
      navigate(`/room/${roomCode}`);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Header title="PARTYENMI.CASA" />

      <main className="main-body">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {GAME_BUTTONS.map(({ label, className }) => (
              <Button
                key={label}
                label={label}
                className={className}
                onClick={() => handleClick(label)}
              />
            ))}
          </>
        )}
      </main>

      <Footer>
        <p style={{ paddingLeft: "2rem" }}>
          partyenmi.casa created as course work for COSC617 at Towson University
        </p>
      </Footer>
    </div>
  );
};

export default Home;