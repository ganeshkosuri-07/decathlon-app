import React, { useState } from 'react';
import axios from 'axios';
import './InputForm.css'; // Import CSS for styling

const InputForm = () => {
  const [name, setName] = useState('');
  const [events, setEvents] = useState({
    '100m': '',
    longJump: '',
    shotPut: '',
    highJump: '',
    '400m': '',
    '110mHurdles': '',
    discusThrow: '',
    poleVault: '',
    javelinThrow: '',
    '1500m': '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If the input is empty, set it to an empty string
    if (value === '') {
      setEvents({ ...events, [name]: '' });
      setErrors({ ...errors, [name]: '' });
    }
    // If the input is a valid number, update the state
    else if (!isNaN(parseFloat(value))) {
      setEvents({ ...events, [name]: parseFloat(value) });
      setErrors({ ...errors, [name]: '' });
    }
    // If the input is invalid, set an error
    else {
      setErrors({ ...errors, [name]: 'Invalid input' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for invalid inputs
    const hasErrors = Object.values(errors).some((error) => error !== '');
    if (hasErrors) {
      setSuccessMessage('');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/athletes', {
        name,
        events,
      });

      // Display success message
      setSuccessMessage(`Athlete saved successfully! Total Score: ${response.data.athlete.totalScore}`);

      // Reset form state
      setName('');
      setEvents({
        '100m': '',
        longJump: '',
        shotPut: '',
        highJump: '',
        '400m': '',
        '110mHurdles': '',
        discusThrow: '',
        poleVault: '',
        javelinThrow: '',
        '1500m': '',
      });
      setErrors({});
    } catch (error) {
      setSuccessMessage('');
      alert(error.response?.data?.error || 'Failed to save athlete. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <div className="header-container">
        <h1>Decathlon Score Calculator</h1>
      </div>
      <h2>Enter Athlete Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {Object.entries(events).map(([event, result]) => (
          <div key={event} className="form-group">
         <label>
            {event} (
              {["100m", "400m", "110mHurdles", "1500m"].includes(event) ? "seconds" : "meters"}):{" "}
        </label>

            <input
              type="number"
              name={event}
              value={result}
              onChange={handleInputChange}
              onWheel={(e) => e.target.blur()} // Prevent scrolling from changing values
              onKeyDown={(e) => {
                if (e.key === 'e' || e.key === 'E') {
                  e.preventDefault(); // Block the "e" key
                }
              }}
              required
              className={errors[event] ? 'invalid-input' : ''}
            />
            {errors[event] && <span className="error-message">{errors[event]}</span>}
          </div>
        ))}
        <button type="submit">Save Athlete</button>
      </form>
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default InputForm;