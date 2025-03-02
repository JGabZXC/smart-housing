const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const Project = require('./models/projectModel');

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

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: process.env.S3_REGION,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/test', async (req, res) => {
  res.status(200).render('test.ejs');
});

app.get('/test/api', async (req, res) => {
  const imageCovers = await Project.find({
    imageCover: { $exists: true },
  }).select('imageCover');

  const imageCoverWithUrls = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const imageCover of imageCovers) {
    const getObjectParams = {
      Bucket: process.env.S3_NAME,
      Key: imageCover.imageCover,
    };
    const command = new GetObjectCommand(getObjectParams);
    // eslint-disable-next-line no-await-in-loop
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Conver Mongoose document to plain JavaScript object
    const imageCoverObj = imageCover.toObject();
    imageCoverObj.imageUrl = url;
    imageCoverWithUrls.push(imageCoverObj);
  }

  res.json(imageCoverWithUrls);
});

app.use('/api/v1/events', eventRoute);
app.use('/api/v1/projects', projectRoute);
app.use('/api/v1/messages', messageRoute);
app.use('/api/v1/garbages', garbageRoute);
app.use('/api/v1/housings', housingRoute);
app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/users', userRoute);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
