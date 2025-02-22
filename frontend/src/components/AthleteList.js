import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AthleteList.css'; // Import CSS for styling

const AthleteList = () => {
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/athletes');
        setAthletes(response.data);
      } catch (error) {
        console.error('Error fetching athletes:', error);
        alert('Failed to fetch athletes. Please try again.');
      }
    };
    fetchAthletes();
  }, []);

  return (
    <div className="athlete-list-container">
      <h2>Athlete List</h2>
      <ul>
        {athletes.map((athlete) => (
          <li key={athlete._id} className="athlete-item">
            <strong>{athlete.name}</strong> - Total Score: {athlete.totalScore}
            <ul>
              {Object.entries(athlete.events).map(([event, result]) => (
                <li key={event}>
                  {event}: {result} ({event.includes('m') ? 'seconds' : event.includes('Jump') || event.includes('Vault') ? 'meters' : 'meters'}) - Score: {athlete.eventScores[event]}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AthleteList;