const express = require('express');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

app.use(express.json());

app.use('/api/settings', settingsRoutes);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Malformed JSON body and any other error that reaches Express
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;