import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import Footer from './Footer.jsx';
import './WaitingRoom.css';

const WaitingRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleVamos = () => {
    console.log('VAMOS button clicked');
  };

  return (
    <div className="waiting-room">
      <header>
        <h1 className="waiting-room-title">Waiting Room</h1>
      </header>
      <div className="waiting-room-container">
        <div className="code-box eight-bit-box">
          <h2>Code De Habitación</h2>
          <p className="room-code">{code}</p>
          <QRCodeCanvas value={`http://partyenmi.casa/room/${code}`} size={200} />
        </div>
        <div className="fiesteros-box eight-bit-box">
          <h2>Fiesteros</h2>
        </div>
      </div>
      <Footer>
        <button className="footer-button back-button" onClick={handleBack}>Back</button>
        <button className="footer-button vamos-button" onClick={handleVamos}>¡VAMOS!</button>
      </Footer>
    </div>
  );
};

export default WaitingRoom;
