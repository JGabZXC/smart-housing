const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

mongoose.set('id', false); // Disable id on all virtuals

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const eventRoute = require('./routes/eventRoutes');
const garbageRoute = require('./routes/garbageRoutes');
const userRoute = require('./routes/userRoutes');
const messageRoute = require('./routes/messageRoutes');
const projectRoute = require('./routes/projectRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/events', eventRoute);
app.use('/api/v1/projects', projectRoute);
app.use('/api/v1/messages', messageRoute);
app.use('/api/v1/garbages', garbageRoute);
app.use('/api/v1/users', userRoute);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
