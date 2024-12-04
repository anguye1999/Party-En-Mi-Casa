import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

const API_BASE_URL = "http://localhost:3002/api";
const ENDPOINTS = {
  user: `${API_BASE_URL}/user`
};

const fetchUserData = async (token) => {
  const response = await fetch(ENDPOINTS.user, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  return await response.json();
};

const Header = ({ title }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUser(storedUsername);
    }

    const loadUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await fetchUserData(token);
        setUser(data.username);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser("");
    navigate("/login");
  };

  const handleJoin = () => {
    navigate("/join");
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  return (
    <header className="header">
      <div className="header-left" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img 
          src="/src/assets/char_icon.png" 
          alt="Logo" 
          className="header-icon"
        />
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="user-greeting">
        {user && <span className="user-name">Hello, {user}</span>}
        <button className="join-room-button" onClick={handleJoin}>
          Join
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;