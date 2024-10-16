import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ResultsRoom.css';

const ResultsRoom = () => {
  const { code } = useParams(); 
  const navigate = useNavigate(); 

  const handleBack = () => navigate(-1); 
  const handleChooseGame = () => navigate('/'); 
  const handleNewGame = () => navigate(`/room/${code}/game-uno`);

  return (
    <div className="results-room">
      <header className="results-header">
        <div className="results-title">Game Uno</div>
        <div className="results-code">Room Code: {code}</div>
      </header>

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
      <footer className="footer-results">
        <button className="footer-button back-button" onClick={handleBack}>Back</button>
        <button className="footer-button choose-game-button" onClick={handleChooseGame}>Choose Game</button>
        <button className="footer-button new-game-button" onClick={handleNewGame}>New Game</button>
      </footer>
    </div>
  );
};

export default ResultsRoom;
