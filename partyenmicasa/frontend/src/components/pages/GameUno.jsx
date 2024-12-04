import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "../../styles/GameUno.css";

const GameUno = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [bounce, setBounce] = useState([false, false, false, false]);
  const [fiesteros, setFiesteros] = useState([]);

  const question = "Question?";
  const answers = ["A", "B", "C", "D"];

  useEffect(() => {
    fetch(`http://localhost:3001/api/room/${code}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch room data");
        }
        return response.json();
      })
      .then((data) => {
        setFiesteros(data.fiesteros);
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("Failed to load game room data. Please try again.");
      });
  }, [code]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBounce([false, false, false, false]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [bounce]);

  const handleBounce = (index) => {
    const newBounce = [...bounce];
    newBounce[index] = true;
    setBounce(newBounce);

    navigate(`/room/${code}/results`);
  };

  return (
    <div className="gameuno-container">
      <Header title="Game Uno" />

      <section className="question-section">
        <p>{question}</p>
      </section>

      <div className="grid-section">
        {answers.map((answer, index) => (
          <div
            key={index}
            className={`grid-item ${bounce[index] ? "bounce" : ""}`}
            onClick={() => handleBounce(index)}
          >
            {answer}
          </div>
        ))}
      </div>

      <Footer>
        {fiesteros.map((fiestero, index) => (
          <span key={index}>{fiestero}</span>
        ))}
        <button
          className="footer-button back-button"
          onClick={() => navigate("/home")}
        >
          Back
        </button>
      </Footer>
    </div>
  );
};

export default GameUno;
