import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.username);
        } else {
          console.error('Failed to fetch user name:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    fetchUserName();
  }, []);

  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <div className="user-greeting">
        {user && <span className="user-name">Hello, {user}</span>}
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
