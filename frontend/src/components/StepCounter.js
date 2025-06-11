import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StepCounter = ({ token, onLogout }) => {
  const [steps, setSteps] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  // Function to fetch historical data
  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/steps', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Handle the step counting interval
  useEffect(() => {
    if (isCounting) {
      intervalRef.current = setInterval(() => {
        setSteps((prevSteps) => prevSteps + 1);
      }, 1000); // This simulates 1 step per second
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCounting]);

  const handleStart = () => {
    setSteps(0); // Reset for new session
    setIsCounting(true);
  };

  const handleStopAndSave = async () => {
    setIsCounting(false);
    if (steps > 0) {
      try {
        console.log('Sending steps to server:', steps);
        const response = await axios.post(
          'http://localhost:5001/api/steps',
          { step_count: steps },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Server response:', response.data);
        // Refresh history after saving
        fetchHistory();
      } catch (err) {
        console.error('Error saving steps:', err);
        console.error('Error details:', err.response?.data);
      }
    }
    setSteps(0);
  };

  return (
    <div className="step-counter-container">
      <div className="top-buttons">
        <button onClick={onLogout} className="logout-button">Atsijungti</button>
        <Link to="/dashboard" className="dashboard-button">Statistika</Link>
      </div>
      <div className="counter-display">
        <h2>Žingsnių skaičius</h2>
        <p className="steps">{steps}</p>
      </div>
      <div className="controls">
        {!isCounting ? (
          <button onClick={handleStart} className="start-button">
            Pradėti skaičiuoti
          </button>
        ) : (
          <button onClick={handleStopAndSave} className="stop-button">
            Sustabdyti ir išsaugoti
          </button>
        )}
      </div>
      <div className="history">
        <h3>Jūsų žingsnių istorija</h3>
        {history.length > 0 ? (
          <ul>
            {history.map((session) => (
              <li key={session.id}>
                <span>{session.step_count} žingsnių</span>
                <small>{new Date(session.end_time).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>Dar nėra žingsnių istorijos. Pradėkite sesiją!</p>
        )}
      </div>
    </div>
  );
};

export default StepCounter;