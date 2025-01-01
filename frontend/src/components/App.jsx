import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../styles/App.css";
import MusicPlayer from "./MusicPlayer.jsx";
import Home from "./pages/Home.jsx";
import WaitingRoom from "./pages/WaitingRoom.jsx";
import GameUno from "./pages/GameUno.jsx";
import ResultsRoom from "./pages/ResultsRoom.jsx";
import Join from "./pages/Join.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";

function App() {
  return (
    <Router>
      <div className="app-container">
        <MusicPlayer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/room/:code" element={<WaitingRoom />} />
          <Route path="/room/:code/gameuno" element={<GameUno />} />
          <Route path="/room/:code/results" element={<ResultsRoom />} />
          <Route path="/join" element={<Join />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
