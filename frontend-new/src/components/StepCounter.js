import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const StepCounter = ({ token, onLogout }) => {
  const [steps, setSteps] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  // Function to fetch historical data
  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/steps', {
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
        await axios.post(
          'http://localhost:5000/api/steps',
          { step_count: steps },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Refresh history after saving
        fetchHistory();
      } catch (err) {
        console.error('Error saving steps:', err);
      }
    }
    setSteps(0);
  };

  return (
    <div className="step-counter-container">
      <button onClick={onLogout} className="logout-button">Logout</button>
      <div className="counter-display">
        <h2>Current Session Steps</h2>
        <p className="steps">{steps}</p>
      </div>
      <div className="controls">
        {!isCounting ? (
          <button onClick={handleStart} className="start-button">
            Start Counting
          </button>
        ) : (
          <button onClick={handleStopAndSave} className="stop-button">
            Stop & Save
          </button>
        )}
      </div>
      <div className="history">
        <h3>Your Step History</h3>
        {history.length > 0 ? (
          <ul>
            {history.map((session) => (
              <li key={session.id}>
                <span>{session.step_count} steps</span>
                <small>{new Date(session.end_time).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No step history yet. Start a session!</p>
        )}
      </div>
    </div>
  );
};

export default StepCounter;