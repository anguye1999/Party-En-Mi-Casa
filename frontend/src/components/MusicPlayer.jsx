import React, { useState, useRef } from 'react';
import { IoMdVolumeHigh, IoMdVolumeOff } from "react-icons/io";
import '../styles/MusicPlayer.css';

const MusicPlayer = () => {
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(new Audio('/background-music.mp3'));

  const toggleMute = () => {
    const audio = audioRef.current;
    
    if (isMuted) {
      audio.volume = 0.3;
      audio.loop = true;
      audio.play()
        .catch(e => console.error('Audio playback failed:', e));
    } else {
      audio.pause();
    }
    
    setIsMuted(!isMuted);
  };

  return (
    <button 
      className="music-toggle"
      onClick={toggleMute}
      aria-label={isMuted ? "Play music" : "Pause music"}
    >
      {isMuted ? <IoMdVolumeOff size={24} /> : <IoMdVolumeHigh size={24} />}
    </button>
  );
};

export default MusicPlayer;