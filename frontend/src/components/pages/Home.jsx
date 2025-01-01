import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button.jsx";
import Footer from "../Footer.jsx";
import Header from "../Header.jsx";
<<<<<<< HEAD
=======
import { GAMES } from "../../constants";
>>>>>>> pemc-helpme
import "../../styles/Home.css";

const API_BASE_URL = "http://localhost:3002/api";

const GAME_BUTTONS = [
<<<<<<< HEAD
  { label: "Game Uno", className: "button-yellow" },
  { label: "Game Dos", className: "button-pink" },
  { label: "Game Tres", className: "button-blue" }
=======
  { label: GAMES.UNO, className: "button-yellow" },
  { label: GAMES.DOS, className: "button-pink" },
  { label: GAMES.TRES, className: "button-blue" },
>>>>>>> pemc-helpme
];

const Home = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async (token) => {
    const response = await fetch(`${API_BASE_URL}/create-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
<<<<<<< HEAD
        Authorization: `Bearer ${token}`
      }
=======
        Authorization: `Bearer ${token}`,
      },
>>>>>>> pemc-helpme
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

<<<<<<< HEAD
=======
    if (gameChoice === GAMES.DOS || gameChoice === GAMES.TRES) {
      navigate("/coming-soon");
      return;
    }

>>>>>>> pemc-helpme
    setLoading(true);

    try {
      const { roomCode } = await createRoom(token);
      console.log("Button clicked:", gameChoice);
<<<<<<< HEAD
      console.log("Generated room code:", roomCode);
      
      localStorage.setItem("gameChoice", gameChoice);
=======
      localStorage.setItem("gameChoice", gameChoice);
      console.log("Stored game choice:", localStorage.getItem("gameChoice"));
>>>>>>> pemc-helpme
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

<<<<<<< HEAD
export default Home;
=======
export default Home;
>>>>>>> pemc-helpme
