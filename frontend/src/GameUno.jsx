import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./GameUno.css"; 

const GameUno = () => {
  const { code } = useParams(); 
  const navigate = useNavigate(); 

  const [bounce, setBounce] = useState([false, false, false, false]);

  const handleBounce = (index) => {
    const newBounce = [...bounce];
    newBounce[index] = true; // Activate bounce on clicked item
    setBounce(newBounce);

    setTimeout(() => {
      newBounce[index] = false;
      setBounce([...newBounce]);
    }, 1000);

    navigate(`/results/${code}`);
  };

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <div className="page">
      <header className="top-section">
        <div className="game-title">Game Uno</div>
        <div className="game-uno-code">Room Code: {code}</div>
      </header>

      <section className="question-section">
        <p>Question</p>
      </section>

      <div className="grid-section">
        {["A", "B", "C", "D"].map((item, index) => (
          <div
            key={index}
            className={`grid-item ${bounce[index] ? "bounce" : ""}`} 
            onClick={() => handleBounce(index)} 
          >
            {item}
          </div>
        ))}
      </div>

      <footer className="footer-uno">
        <button className="footer-button back-button" onClick={handleBack}>Back</button>
        <div className="high-score first">1st: Player A</div>
        <div className="high-score second">2nd: Player B</div>
        <div className="high-score third">3rd: Player C</div>
      </footer>
    </div>
  );
};

export default GameUno;
