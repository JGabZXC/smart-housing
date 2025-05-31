const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');


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
const eventResidentRoute = require('./routes/eventResidentRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'base.ejs');

app.use(cookieParser());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'js.stripe.com', 'ws://127.0.0.1:56122'], // ws://127.0.0.1:56122 for parcel
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'js.stripe.com',
        'cdn.jsdelivr.net',
      ],
      imgSrc: [
        "'self'",
        'smarthousing-capstone.s3.ap-southeast-2.amazonaws.com',
        'data:',
        'www.w3.org',
      ],
    },
  }),
); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL query injection

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request
const messageOptions = {
  status: 'fail',
  message: 'Too many requests, please try again in an hour',
};


const limiter = rateLimit({
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Limit each IP to 100 requests per hour
  windowMs: 60 * 60 * 1000, // 1 hour,
  message: messageOptions,
});

app.use('/api', limiter);

app.use('/', viewRoute);
app.use('/api/v1/events', eventRoute);
app.use('/api/v1/eventsresident', eventResidentRoute);
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
