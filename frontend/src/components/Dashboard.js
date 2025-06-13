import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const Dashboard = ({ token }) => {
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        console.log('Fetching user stats...');
        const response = await api.get('/api/stats/users');
        console.log('Received user stats:', response.data);
        
        if (Array.isArray(response.data)) {
          setUserStats(response.data);
        } else {
          console.error('Received non-array data:', response.data);
          setError('Netinkamas duomenų formatas');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Nepavyko užkrauti duomenų');
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [token]);

  if (loading) return <div className="loading">Kraunama...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h2>Maldos žingsnių švieslentė</h2>
      <div className="dashboard-actions">
        <Link to="/" className="back-button">Grįžti į žingsnių skaičiuotuvą</Link>
      </div>
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Vardas</th>
              <th>Iš viso žingsnių</th>
            </tr>
          </thead>
          <tbody>
            {userStats && userStats.length > 0 ? (
              userStats.map((stat) => (
                <tr key={stat.user_id}>
                  <td>{stat.username}</td>
                  <td>{Number(stat.total_steps).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">Nėra duomenų</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard; 