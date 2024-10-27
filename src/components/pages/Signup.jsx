import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (username.length < 4 || username.length > 16) {
      setError('Username must be 1-16 characters.');
      return;
    }
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,32}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be 6-32 characters and include 1 lowercase, 1 uppercase, 1 number, and 1 special character.');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return;
    }
  
    // Convert username and email to lowercase before submitting
    const lowercasedUsername = username.toLowerCase();
    const lowercasedEmail = email.toLowerCase();
  
    fetch('http://localhost:3001/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: lowercasedUsername, email: lowercasedEmail, password }),
    })
      .then(response => {
        if (response.ok) {
          console.log('Signup successful');
          navigate('/login');
        } else {
          throw new Error('Signup failed');
        }
      })
      .catch(error => {
        console.error('Error during signup:', error);
        setError('Signup failed. Please try again.');
      });
  };  

  return (
    <div className="signup-container">
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create Account</button>
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
