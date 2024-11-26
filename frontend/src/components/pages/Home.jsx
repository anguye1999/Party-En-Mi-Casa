import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button.jsx';
import Footer from '../Footer.jsx';
import Header from '../Header.jsx';
import '../../styles/Home.css';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const handleClick = (gameChoice) => {
    const code = generateCode();
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }
  
    console.log('Button clicked:', gameChoice);
    console.log('Generated room code:', code);
    
    localStorage.setItem('gameChoice', gameChoice);

    navigate(`/room/${code}`);
  
    setLoading(true);
    
    fetch('http://localhost:3001/api/choose-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
      .finally(() => setLoading(false));
  };

  return (
    <div className="home-container">
      <Header title="PARTYENMI.CASA" />
      
      <main className="main-body">
        {loading ? (
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
};

export default Home;
