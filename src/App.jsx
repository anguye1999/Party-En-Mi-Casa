import React, { useState } from 'react';
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
  const [loading, setLoading] = useState(false);  // State to track loading
  const navigate = useNavigate();

  const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleClick = (gameChoice) => {
    const code = generateCode(); // Generate the room code

    console.log('Button clicked:', gameChoice);
    console.log('Generated room code:', code);

    // Navigate immediately to the waiting room
    navigate(`/room/${code}`);

    // Set loading state if needed (optional, but good for UX)
    setLoading(true);

    // Make the API call in the background after navigation
    fetch('http://localhost:3001/api/choose-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameChoice, roomCode: code }),
    })
      .then(response => {
        if (response.ok) {
          console.log('API response successful');
        } else {
          console.error('API response failed', response.status);
        }
      })
      .catch(error => console.error('Error while sending game choice and room code:', error))
      .finally(() => setLoading(false));  // Reset loading state
  };

  return (
    <div className="container">
      <header className="header">
        <h1>PARTYENMI.CASA</h1>
      </header>
      <main className="main-body">
        {loading ? ( // Show loading state while waiting for the API call
          <div>Loading...</div>
        ) : (
          <>
            <Button label="Game Uno" className="button-yellow" onClick={() => handleClick('Game Uno')} />
            <Button label="Game Dos" className="button-pink" onClick={() => handleClick('Game Dos')} />
            <Button label="Game Tres" className="button-blue" onClick={() => handleClick('Game Tres')} />
          </>
        )}
      </main>
      <Footer>
        <p>partyenmi.casa created as course work for COSC617 at Towson University</p>
      </Footer>
    </div>
  );
}

export default App;
