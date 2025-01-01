<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { GAME_CONSTANTS } from "../../constants/gameConstants.js";
import "../../styles/ResultsRoom.css";

const API_BASE_URL = "http://localhost:3002/api";

const ResultsRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [error, setError] = useState(null);
  const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/room/${code}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }

        const data = await response.json();
        if (data.gameState && data.gameState.players) {
          const sortedScores = [...data.gameState.players].sort(
            (a, b) => b.score - a.score,
          );
          setScores(sortedScores);
        }
      } catch (error) {
        setError("Failed to load results");
        console.error(error);
      }
    };

    fetchResults();
  }, [code]);

  const handleBack = () => navigate(`/room/${code}`);
  const handleChooseGame = () => navigate("/home");

  const handleNewGame = async () => {
    try {
      setIsStartingGame(true);
      const token = localStorage.getItem("token");

      // Start new game via API
      const response = await fetch(`${API_BASE_URL}/room/${code}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to start new game");
      }

      // Navigate back to game
      navigate(`/room/${code}/gameuno`);
    } catch (error) {
      setError("Failed to start new game");
      console.error(error);
    } finally {
      setIsStartingGame(false);
    }
  };

  const renderPerformanceStats = (player) => (
    <div className="performance-stats">
      <div className="stat-item">
        <span className="stat-label">Correct Answers:</span>
        <span className="stat-value">
          {player.correctAnswers || 0}/{GAME_CONSTANTS.MAX_QUESTIONS}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Best Streak:</span>
        <span className="stat-value">{player.bestStreak || 0}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Avg. Response Time:</span>
        <span className="stat-value">{player.avgResponseTime || 0}s</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${((player.correctAnswers || 0) / GAME_CONSTANTS.MAX_QUESTIONS) * 100}%`,
          }}
        />
      </div>
    </div>
  );
>>>>>>> pemc-helpme

  return (
    <div className="results-container">
      <Header title="Game Uno Results" />

      <div className="results-body">
        <div className="podium-section">
<<<<<<< HEAD
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
=======
          <div className="podium animate-podium">
            {scores.length > 1 && (
              <div className="second-place animate-place">
                <div className="avatar-container">
                  {scores[1]?.avatar && (
                    <img
                      src={scores[1].avatar}
                      alt="2nd place"
                      className="player-avatar"
                    />
                  )}
                </div>
                <div className="player-info">
                  <div className="place">2nd</div>
                </div>
              </div>
            )}
            {scores.length > 0 && (
              <div className="first-place animate-place">
                <div className="avatar-container">
                  {scores[0]?.avatar && (
                    <img
                      src={scores[0].avatar}
                      alt="1st place"
                      className="player-avatar crown"
                    />
                  )}
                </div>
                <div className="player-info">
                  <div className="place">1st</div>
                </div>
              </div>
            )}
            {scores.length > 2 && (
              <div className="third-place animate-place">
                <div className="avatar-container">
                  {scores[2]?.avatar && (
                    <img
                      src={scores[2].avatar}
                      alt="3rd place"
                      className="player-avatar"
                    />
                  )}
                </div>
                <div className="player-info">
                  <div className="place">3rd</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stats-toggle">
          <button
            className="toggle-button"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? "Show Leaderboard" : "Show Detailed Stats"}
          </button>
        </div>

        {showStats ? (
          <div className="detailed-stats eight-bit-box-two animate-fade-in">
            <h2>Detailed Statistics</h2>
            {scores.map((player, index) => (
              <div key={player.userId} className="player-stats">
                <div className="player-header">
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{player.username}</span>
                  <span className="total-score">{player.score} pts</span>
                </div>
                {renderPerformanceStats(player)}
              </div>
            ))}
          </div>
        ) : (
          <div className="leaderboard-box eight-bit-box-two animate-fade-in">
            <h2>Leaderboard</h2>
            <ul className="leaderboard">
              {scores.map((player, index) => (
                <li
                  key={player.userId}
                  className={`leaderboard-item animate-slide-in`}
                >
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{player.username}</span>
                  <span className="score">{player.score} pts</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Footer>
        <button
          className="footer-button back-button"
          onClick={handleBack}
          disabled={isStartingGame}
        >
>>>>>>> pemc-helpme
          Back
        </button>
        <button
          className="footer-button choose-game-button"
          onClick={handleChooseGame}
<<<<<<< HEAD
=======
          disabled={isStartingGame}
>>>>>>> pemc-helpme
        >
          Choose Game
        </button>
        <button
          className="footer-button new-game-button"
          onClick={handleNewGame}
<<<<<<< HEAD
        >
          New Game
        </button>
=======
          disabled={isStartingGame}
        >
          {isStartingGame ? "Starting..." : "New Game"}
        </button>
        {error && <div className="error-message">{error}</div>}
>>>>>>> pemc-helpme
      </Footer>
    </div>
  );
};

export default ResultsRoom;
