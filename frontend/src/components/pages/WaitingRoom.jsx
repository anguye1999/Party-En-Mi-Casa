import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import Footer from "../Footer";
import Header from "../Header";
import "../../styles/WaitingRoom.css";

const WaitingRoom = () => {
  const { code } = useParams();
  const [fiesteros, setFiesteros] = useState([]);
  const navigate = useNavigate();
  const [gameChoice, setGameChoice] = useState("");

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3002 /api/room/${code}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch room data');
        }
        
        const data = await response.json();
        setFiesteros(data.fiesteros);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    // Initial fetch
    fetchRoomData();

    // Set up polling to update room data every 5 seconds
    const pollInterval = setInterval(fetchRoomData, 5000);

    const storedGameChoice = localStorage.getItem("gameChoice");
    setGameChoice(storedGameChoice);

    // Cleanup polling on component unmount
    return () => clearInterval(pollInterval);
  }, [code]);

  const handleVamosClick = () => {
    if (gameChoice === "Game Uno") {
      navigate(`/room/${code}/gameuno`);
    } else {
      console.log("Vamos clicked, but no action taken for:", gameChoice);
    }
  };

  return (
    <div className="waiting-room">
      <Header title="Waiting Room" />
      <div className="waiting-room-container">
        <div className="code-box eight-bit-box">
          <h2>Code De Habitación</h2>
          <p className="room-code">{code}</p>
          <QRCodeCanvas
            className="QR-code"
            value={`http://localhost:3000/${code}`}
            size={200}
          />
        </div>
        <div className="fiesteros-box eight-bit-box">
          <h2>Fiesteros</h2>
          <ul className="fiesteros-list">
            {fiesteros.map((fiestero, index) => (
              <li key={index} className="fiestero-item">
                <div className="fiestero-avatar">
                  {fiestero.avatar ? (
                    <img
                      src={fiestero.avatar}
                      alt={`${fiestero.username}'s avatar`}
                      className="user-avatar"
                    />
                  ) : (
                    <img
                      src="/src/assets/char_icon.png"
                      alt="Default avatar"
                      className="user-avatar"
                    />
                  )}
                </div>
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
          onClick={handleVamosClick}
        >
          ¡VAMOS!
        </button>
      </Footer>
    </div>
  );
};

export default WaitingRoom;