import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StepCounter from './components/StepCounter';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  // A simple way to check for a token to handle protected routes
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Maldos žingsniai</h1>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={handleSetToken} /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/login" />} />
          <Route path="/" element={token ? <StepCounter token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;