import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Button from './Button.jsx';
import WaitingRoom from './WaitingRoom.jsx';
import Footer from './Footer.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/room/:code" element={<WaitingRoom />} />
      </Routes>
    </Router>
  );
}

function MainPage() {
  const navigate = useNavigate();

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleClick = async (gameChoice) => {
    const code = generateCode(); // Generate the room code
  
    console.log('Button clicked:', gameChoice);
    console.log('Generated room code:', code);
  
    try {
      // Send gameChoice and room code to the backend
      const response = await fetch('http://localhost:3001/api/choose-game', { // Adjust URL if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameChoice, roomCode: code }), // Post both gameChoice and roomCode
      });
  
      if (response.ok) {
        console.log('API response successful');
      } else {
        console.error('API response failed', response.status);
      }
    } catch (error) {
      console.error('Error while sending game choice and room code:', error);
    }
  
    // Navigate to the room with the generated code
    navigate(`/room/${code}`);
  };
  
  

  return (
    <div className="container">
      <header className="header">
        <h1>PARTYENMI.CASA</h1>
      </header>
      <main className="main-body">
        <Button label="Game Uno" className="button-yellow" onClick={() => handleClick('Game Uno')} />
        <Button label="Game Dos" className="button-pink" onClick={() => handleClick('Game Dos')} />
        <Button label="Game Tres" className="button-blue" onClick={() => handleClick('Game Tres')} />
      </main>
      <Footer>
        <p>partyenmi.casa created as course work for COSC617 at Towson University</p>
      </Footer>

    </div>
  );
}

export default App;
