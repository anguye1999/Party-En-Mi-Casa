import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import Footer from '../Footer';
import Header from '../Header'; // Import your Header component
import '../../styles/WaitingRoom.css';

const WaitingRoom = () => {
  const { code } = useParams();
  const [fiesteros, setFiesteros] = useState([]);
  const navigate = useNavigate();
  const [gameChoice, setGameChoice] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3001/api/room/${code}`)
      .then(response => response.json())
      .then(data => setFiesteros(data.fiesteros))
      .catch(error => console.error('Error fetching room data:', error));

    const storedGameChoice = localStorage.getItem('gameChoice');
    setGameChoice(storedGameChoice);
  }, [code]);

  const handleVamosClick = () => {
    if (gameChoice === 'Game Uno') {
      navigate(`/room/${code}/gameuno`);
    } else {
      console.log('Vamos clicked, but no action taken for:', gameChoice);
    }
  };

  return (
    <div className="waiting-room">
      <Header title="Waiting Room" />
      <div className="waiting-room-container">
        <div className="code-box eight-bit-box">
          <h2>Code De Habitación</h2>
          <p className="room-code">{code}</p>
          <QRCodeCanvas className="QR-code" value={`http://partyenmi.casa/join`} size={200} />
        </div>
        <div className="fiesteros-box eight-bit-box">
          <h2>Fiesteros</h2>
          <ul>
            {fiesteros.map((user, index) => (
              <li key={index}>
              <img src="/src/assets/char_icon.png" alt="icon" className="list-icon" />
              {user}
            </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer>
        <button className="footer-button back-button" onClick={() => navigate('/home')}>Back</button>
        <button className="footer-button vamos-button" onClick={handleVamosClick}>¡VAMOS!</button>
      </Footer>
    </div>
  );
};

export default WaitingRoom;
