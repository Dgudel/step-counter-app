import React, { useState } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const onChange = e => {
    console.log('Form field changed:', e.target.name);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      console.log('Starting registration process...');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('Form data:', formData);
      
      const response = await api.post('/api/auth/register', formData);
      console.log('Registration response:', response);
      
      setSuccess('Registracija sėkminga! Prašome prisijungti.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        setError(err.response.data.msg || 'Registracija nepavyko');
      } else if (err.request) {
        console.error('No response received:', {
          request: err.request,
          message: err.message
        });
        setError('Nepavyko sujungti su serveriu. Prašome įsitikinkite, ar backend yra veikiantis.');
      } else {
        console.error('Error setting up request:', {
          message: err.message,
          stack: err.stack
        });
        setError('Įvyko neįtikėta klaida. Prašome bandyti dar kartą.');
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Registracija</h2>
      <form onSubmit={onSubmit}>
        <input 
          type="text" 
          name="username" 
          value={formData.username} 
          onChange={onChange} 
          placeholder="Vartotojo vardas" 
          required 
        />
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={onChange} 
          placeholder="Slaptažodis" 
          required 
        />
        <button type="submit">Registruotis</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <p>Jau turite paskyrą? <Link to="/login">Prisijungti</Link></p>
    </div>
  );
};

export default Register;