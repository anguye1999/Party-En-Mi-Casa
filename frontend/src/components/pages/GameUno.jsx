import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "../../styles/GameUno.css";

const API_BASE_URL = "http://localhost:3002/api";
const ROOM_API_URL = "http://localhost:3001/api";
const BOUNCE_DURATION = 1000;
const INITIAL_BOUNCE_STATE = [false, false, false, false];

const EVENT_TYPES = {
  GAME_START: 'GAME_START',
  NEXT_QUESTION: 'NEXT_QUESTION',
  TIME_UPDATE: 'TIME_UPDATE',
  GAME_OVER: 'GAME_OVER'
};

const GameUno = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [bounce, setBounce] = useState(INITIAL_BOUNCE_STATE);
  const [fiesteros, setFiesteros] = useState([]);
  const [question, setQuestion] = useState("Waiting for game to start...");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRoomData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${ROOM_API_URL}/room/${code}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room data");
      }

      const data = await response.json();
      setFiesteros(data.fiesteros);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load game room data. Please try again.");
    }
  };

  const handleGameEvent = (data) => {
    switch (data.type) {
      case EVENT_TYPES.GAME_START:
      case EVENT_TYPES.NEXT_QUESTION:
        setQuestion(data.payload.currentQuestion.question);
        setAnswers(data.payload.currentQuestion.answers);
        setTimeRemaining(data.payload.timeRemaining);
        setSelectedAnswer(null);
        setBounce(INITIAL_BOUNCE_STATE);
        break;

      case EVENT_TYPES.TIME_UPDATE:
        setTimeRemaining(data.payload.timeRemaining);
        break;

      case EVENT_TYPES.GAME_OVER:
        setGameOver(true);
        setScores(data.payload.finalScores);
        navigate(`/room/${code}/results`);
        break;

      default:
        break;
    }
  };

  const submitAnswer = async (index) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/room/${code}/answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer: index })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleAnswerSelect = async (index) => {
    if (selectedAnswer !== null || timeRemaining <= 0) return;

    const newBounce = [...bounce];
    newBounce[index] = true;
    setBounce(newBounce);
    setSelectedAnswer(index);
    await submitAnswer(index);
  };

  useEffect(() => {
    fetchRoomData();
  }, [code]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const eventSource = new EventSource(
      `${API_BASE_URL}/room/${code}/events?token=${token}`
    );

    eventSource.onmessage = (event) => {
      handleGameEvent(JSON.parse(event.data));
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [code, navigate]);

  useEffect(() => {
    if (bounce.some(b => b)) {
      const timer = setTimeout(() => {
        setBounce(INITIAL_BOUNCE_STATE);
      }, BOUNCE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [bounce]);

  return (
    <div className="gameuno-container">
      <Header title="Game Uno" />
      <div className="timer">Time Remaining: {timeRemaining}s</div>

      <section className="question-section">
        <p>{question}</p>
      </section>

      <div className="grid-section">
        {answers.map((answer, index) => (
          <div
            key={index}
            className={`grid-item ${bounce[index] ? "bounce" : ""} ${
              selectedAnswer === index ? "selected" : ""
            } ${timeRemaining <= 0 ? "disabled" : ""}`}
            onClick={() => handleAnswerSelect(index)}
          >
            {answer}
          </div>
        ))}
      </div>

      <Footer>
        <div className="fiesteros-list">
          {fiesteros.map((fiestero, index) => (
            <div key={index} className="fiestero-item">
              {fiestero.avatar && (
                <img 
                  src={fiestero.avatar} 
                  alt={`${fiestero.username}'s avatar`} 
                  className="fiestero-avatar"
                />
              )}
              <span>{fiestero.username}</span>
            </div>
          ))}
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </Footer>
    </div>
  );
};

export default GameUno;