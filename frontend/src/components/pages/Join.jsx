import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header.jsx';
import PixelArtConverter from '../PixelArtConverter.jsx';
import '../../styles/Join.css';

const Join = () => {
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pixelArtImage, setPixelArtImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('roomCode', roomCode);
      formData.append('username', username);
      if (pixelArtImage) {
        const response = await fetch(pixelArtImage);
        const blob = await response.blob();
        formData.append('avatar', blob, 'avatar.png');
      }

      const response = await fetch('http://localhost:3001/api/join', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 404) {
        setErrorMessage('Room not found. Please check the room code.');
      } else if (response.status === 400) {
        const data = await response.json();
        setErrorMessage(data.message);
      } else if (response.status === 200) {
        setSuccessMessage('User added successfully!');
        navigate(`/room/${roomCode}`);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Failed to join the room. Please check your connection.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="join-container">
      <Header title="Join a Room" />
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room Code:</label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            required
            maxLength={4}
            placeholder="Enter room code"
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={16}
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label>Avatar Image:</label>
          <PixelArtConverter onImageConverted={setPixelArtImage} />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button className="join-button" type="submit">Join Room</button>
      </form>
    </div>
  );
};

export default Join;