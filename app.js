const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');

mongoose.set('id', false); // Disable id on all virtuals

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const eventRoute = require('./routes/eventRoutes');
const garbageRoute = require('./routes/garbageRoutes');
const userRoute = require('./routes/userRoutes');
const housingRoute = require('./routes/housingRoutes');
const messageRoute = require('./routes/messageRoutes');
const projectRoute = require('./routes/projectRoutes');
const paymentRoute = require('./routes/paymentRoutes');
const s3ImageRoute = require('./routes/s3ImageRoutes');
const viewRoute = require('./routes/viewRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'base.ejs');

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/', viewRoute);
app.use('/api/v1/events', eventRoute);
app.use('/api/v1/projects', projectRoute);
app.use('/api/v1/messages', messageRoute);
app.use('/api/v1/garbages', garbageRoute);
app.use('/api/v1/housings', housingRoute);
app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/images', s3ImageRoute);
app.use('/api/v1/users', userRoute);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
