import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "../../styles/ResultsRoom.css";

const ResultsRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const handleBack = () => navigate(`/room/${code}`);
  const handleChooseGame = () => navigate("/home");
  const handleNewGame = () => navigate(`/room/${code}/gameuno`);

  return (
    <div className="results-container">
      <Header title="Game Uno Results" />

      <div className="results-body">
        <div className="podium-section">
          <div className="podium">
            <div className="second-place">2nd</div>
            <div className="first-place">1st</div>
            <div className="third-place">3rd</div>
          </div>
        </div>

        <div className="leaderboard-box eight-bit-box-two">
          <h2>Leaderboard</h2>
          <ul className="leaderboard">
            <li>Player A - 50 points</li>
            <li>Player B - 40 points</li>
            <li>Player C - 30 points</li>
          </ul>
        </div>
      </div>

      <Footer>
        <button className="footer-button back-button" onClick={handleBack}>
          Back
        </button>
        <button
          className="footer-button choose-game-button"
          onClick={handleChooseGame}
        >
          Choose Game
        </button>
        <button
          className="footer-button new-game-button"
          onClick={handleNewGame}
        >
          New Game
        </button>
      </Footer>
    </div>
  );
};

export default ResultsRoom;
