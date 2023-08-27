const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Mock database
let pins = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes

// Get all pins
app.get('/pins', (req, res) => {
  res.json(pins);
});

// Add a new pin
app.post('/pins', (req, res) => {
  pins.push(req.body);
  res.json({ success: true });
});

// Update a pin
app.put('/pins/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (pins[id]) {
    pins[id] = req.body;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Pin not found' });
  }
});

// Delete a pin
app.delete('/pins/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (pins[id]) {
    pins.splice(id, 1);
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Pin not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
