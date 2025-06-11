import React, { useState } from 'react';
import axios from 'axios';
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
      const res = await axios.post('http://localhost:5001/api/auth/login', formData);
      setToken(res.data.token);
      navigate('/');
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data.msg || 'Login failed');
      } else if (err.request) {
        // The request was made but no response was received
        setError('Unable to connect to the server. Please make sure the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
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