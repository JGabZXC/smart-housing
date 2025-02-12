const express = require('express');

const eventRoute = require('./routes/eventRoutes');

const app = express();

app.use(express.json());

app.use('/api/v1/events', eventRoute);

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
