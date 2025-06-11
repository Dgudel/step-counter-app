import React, { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting to login...');
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('Request data:', formData);
      
      const res = await api.post('/api/auth/login', formData);
      console.log('Login response:', res.data);
      
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', err.response.data);
        setError(err.response.data.msg || 'Login failed');
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('Unable to connect to the server. Please make sure the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', err.message);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Prisijungimas</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="username" value={formData.username} onChange={onChange} placeholder="Vartotojo vardas" required />
        <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Slaptažodis" required />
        <button type="submit">Prisijungti</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>Neturite paskyros? <Link to="/register">Registruotis</Link></p>
    </div>
  );
};

export default Login;