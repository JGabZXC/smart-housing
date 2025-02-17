const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const eventRoute = require('./routes/eventRoutes');
const garbageRoute = require('./routes/garbageRoutes');

const app = express();

app.use(express.json());

app.use('/api/v1/events', eventRoute);
app.use('/api/v1/garbages', garbageRoute);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
