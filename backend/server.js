const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string
const mongoURI = process.env.MONGO_URI || "mongodb+srv://ganeshkosuri:gani@cluster0.5bosrn1.mongodb.net/DecathlonApp?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB Atlas
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

// Define athlete schema
const athleteSchema = new mongoose.Schema({
  name: String,
  events: {
    '100m': Number,
    longJump: Number,
    shotPut: Number,
    highJump: Number,
    '400m': Number,
    '110mHurdles': Number,
    discusThrow: Number,
    poleVault: Number,
    javelinThrow: Number,
    '1500m': Number,
  },
  eventScores: {
    '100m': Number,
    longJump: Number,
    shotPut: Number,
    highJump: Number,
    '400m': Number,
    '110mHurdles': Number,
    discusThrow: Number,
    poleVault: Number,
    javelinThrow: Number,
    '1500m': Number,
  },
  totalScore: Number,
});

const Athlete = mongoose.model('Athlete', athleteSchema);

// Decathlon scoring formulas
const calculateScore = (event, performance) => {
  console.log(`Calculating score for ${event}:`, performance);

  const formulas = {
    // Running events (time in seconds)
    '100m': (t) => 25.4347 * Math.pow(18 - t, 1.81),
    '400m': (t) => 1.53775 * Math.pow(82 - t, 1.81),
    '110mHurdles': (t) => 5.74352 * Math.pow(28.5 - t, 1.92),
    '1500m': (t) => 0.03768 * Math.pow(480 - t, 1.85),

    // Jumping events (distance/height in meters)
    longJump: (d) => 0.14354 * Math.pow(d * 100 - 220, 1.4), // Convert meters to centimeters
    highJump: (h) => 0.8465 * Math.pow(h * 100 - 75, 1.42),  // Convert meters to centimeters
    poleVault: (h) => 0.2797 * Math.pow(h * 100 - 100, 1.35), // Convert meters to centimeters

    // Throwing events (distance in meters)
    shotPut: (d) => 51.39 * Math.pow(d - 1.5, 1.05),
    discusThrow: (d) => 12.91 * Math.pow(d - 4, 1.1),
    javelinThrow: (d) => 10.14 * Math.pow(d - 7, 1.08),
  };

  try {
    const score = formulas[event](performance);
    console.log(`Score for ${event}:`, score);
    return isNaN(score) ? 0 : score;
  } catch (err) {
    console.error(`Error calculating score for ${event}:`, err);
    return 0;
  }
};

// Add Athlete and Calculate Scores
app.post('/api/athletes', async (req, res) => {
  const { name, events } = req.body;

  console.log('Received request body:', { name, events });

  if (!name || !events || typeof events !== 'object') {
    return res.status(400).json({ error: 'Invalid request body. Name and events are required.' });
  }

  try {
    // Check if athlete already exists
    const existingAthlete = await Athlete.findOne({ name });
    if (existingAthlete) {
      return res.status(400).json({ error: 'An athlete with this name already exists.' });
    }

    // Validate and parse event results
    const validatedEvents = {};
    const eventScores = {};
    let totalScore = 0;

    for (const [event, result] of Object.entries(events)) {
      const parsedResult = parseFloat(result);
      if (isNaN(parsedResult)) {
        return res.status(400).json({ error: `Invalid result for event ${event}: ${result}. Expected a number.` });
      }
      validatedEvents[event] = parsedResult;

      // Calculate individual event score
      const score = calculateScore(event, parsedResult);
      eventScores[event] = Math.floor(score); // Round down to the nearest integer
      totalScore += eventScores[event]; // Add rounded score to total
    }

    // Save athlete to database
    const athlete = new Athlete({
      name,
      events: validatedEvents,
      eventScores,
      totalScore,
    });

    const savedAthlete = await athlete.save();

    // Return success message and athlete data
    return res.status(201).json({
      message: 'Athlete data saved successfully',
      athlete: savedAthlete,
    });
  } catch (err) {
    console.error('Error saving athlete data:', err.message);
    return res.status(500).json({ error: 'Failed to save athlete data', details: err.message });
  }
});
// Retrieve all athletes
app.get('/api/athletes', async (req, res) => {
  try {
    const athletes = await Athlete.find().sort({ totalScore: -1 }); // Sort by totalScore in descending order
    res.json(athletes);
  } catch (err) {
    console.error('Error retrieving athletes:', err.message);
    res.status(500).json({ error: 'Failed to retrieve athletes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});