import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiTimerFlashLine } from "react-icons/ri";
import { FaCheck, FaTimes} from "react-icons/fa";
import Header from "../Header";
import Footer from "../Footer";
import "../../styles/GameUno.css";

const WS_BASE_URL = "ws://localhost:3001";
const API_BASE_URL = "http://localhost:3002/api";
const BOUNCE_DURATION = 1000;
const INITIAL_BOUNCE_STATE = [false, false, false, false];

const EVENT_TYPES = {
  GAME_START: "game_start",
  NEXT_QUESTION: "next_question",
  TIME_UPDATE: "time_update",
  GAME_OVER: "game_over",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  ANSWER_SUBMITTED: "answer_submitted",
  ROOM_STATE: "room_state"
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
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isTimerLow, setIsTimerLow] = useState(false);
  const [game_over, setGameOver] = useState(false);
  const [scores, setScores] = useState([]);

  // Handle game events
  const handleGameEvent = (data) => {
    console.log("Handling game event:", data);
    
    switch (data.type) {
      case EVENT_TYPES.ROOM_STATE:
        console.log("ROOM_STATE event:", data);
        if (data.roomData.gameState) {
          const { gameState } = data.roomData;
          setQuestion(gameState.questions[gameState.currentQuestion].question);
          setAnswers(gameState.questions[gameState.currentQuestion].answers);
          setTimeRemaining(gameState.timeRemaining);
          setScores(gameState.players);
        }
        setFiesteros(data.roomData.fiesteros);
        break;

      case EVENT_TYPES.GAME_START:
        console.log("GAME_START event:", data);
        setQuestion(data.currentQuestion.question);
        setAnswers(data.currentQuestion.answers);
        setTimeRemaining(data.timeRemaining);
        setSelectedAnswer(null);
        setBounce(INITIAL_BOUNCE_STATE);
        setGameOver(false);
        break;

      case EVENT_TYPES.NEXT_QUESTION:
        console.log("NEXT_QUESTION event:", data);
        setQuestion(data.currentQuestion.question);
        setAnswers(data.currentQuestion.answers);
        setTimeRemaining(data.timeRemaining);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setShowResult(false);
        setBounce(INITIAL_BOUNCE_STATE);
        break;

      case EVENT_TYPES.TIME_UPDATE:
        console.log("TIME_UPDATE event:", data);
        setTimeRemaining(data.timeRemaining);
        break;

      case EVENT_TYPES.GAME_OVER:
        console.log("GAME_OVER event:", data);
        setGameOver(true);
        setScores(data.finalScores);
        navigate(`/room/${code}/results`);
        break;

      case EVENT_TYPES.USER_JOINED:
        console.log("USER_JOINED event:", data);
        setFiesteros(prev => {
          if (!prev.some(f => f.username === data.username)) {
            return [...prev, { username: data.username, avatar: data.avatar }];
          }
          return prev;
        });
        break;

      case EVENT_TYPES.USER_LEFT:
        console.log("USER_LEFT event:", data);
        setFiesteros(prev => prev.filter(f => f.userId !== data.userId));
        break;

      case EVENT_TYPES.ANSWER_SUBMITTED:
        console.log("ANSWER_SUBMITTED event:", data);
        console.log(data.username)
        if (data.username === localStorage.getItem("username")) {
          console.log("isCorrect value: ", data.isCorrect);
          setIsCorrect(data.isCorrect);
          setShowResult(true);
        }
        break;

      default:
        console.warn("Unknown event type:", data.type);
        break;
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null || timeRemaining <= 0 || !socket) {
      return;
    }

    const newBounce = [...bounce];
    newBounce[index] = true;
    setBounce(newBounce);
    setSelectedAnswer(index);

    // Send answer through WebSocket
    socket.send(JSON.stringify({
      type: "submit_answer",
      answer: index
    }));

    setShowResult(true);
  };

  // WebSocket connection management
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    console.log("Connecting to WebSocket...");
    const ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected, joining room:", code);
      ws.send(JSON.stringify({
        type: "join_room",
        roomCode: code
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleGameEvent(data);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setErrorMessage("Connection error. Please refresh the page.");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setErrorMessage("Connection lost. Please refresh the page.");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "leave_room"
        }));
        ws.close();
      }
    };
  }, [code, navigate]);

  // Bounce effect reset
  useEffect(() => {
    if (bounce.some((b) => b)) {
      const timer = setTimeout(() => {
        setBounce(INITIAL_BOUNCE_STATE);
      }, BOUNCE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [bounce]);

  useEffect(() => {
    setIsTimerLow(timeRemaining <= 5);
  }, [timeRemaining]);

  return (
    <div className="gameuno-container">
      <Header title="Game Uno" />
      <div className="timer">
        {timeRemaining}s
        <RiTimerFlashLine 
          className={`timer-icon ${isTimerLow ? 'timer-warning' : ''}`}
          size={80}
        />
        </div>

      <section className="question-section">
        <p>{question}</p>
      </section>

      <div className="grid-section">
        {answers.map((answer, index) => (
          <div
          key={index}
          className={`grid-item 
            ${bounce[index] ? "bounce" : ""} 
            ${selectedAnswer === index ? "selected" : ""} 
            ${timeRemaining <= 0 || selectedAnswer !== null ? "disabled" : ""}
            ${selectedAnswer === index ? "selected-answer" : ""}`
          }
          onClick={() => handleAnswerSelect(index)}
        >
            {answer}
          </div>
        ))}
      </div>

      {showResult && isCorrect !== null && (
        <div className={`result-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? (
            <FaCheck className="result-icon correct" />
          ) : (
            <FaTimes className="result-icon incorrect" />
          )}
        </div>
      )}

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