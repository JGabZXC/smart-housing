const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../utils/s3Bucket');
const Event = require('../models/eventModel');
const handler = require('./handlerController');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadEventImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

exports.uploadS3 = catchAsync(async (req, res, next) => {
  if (req.files.imageCover) {
    const filename = `event-${req.files.imageCover[0].originalname.split('.')[0]}-${Date.now()}-cover.jpeg`;
    const params = {
      Bucket: process.env.S3_NAME,
      Key: filename,
      Body: req.files.imageCover[0].buffer,
      ContentType: req.files.imageCover[0].mimetype,
    };
    const command = new PutObjectCommand(params);

    await s3.send(command);
    req.body.imageCover = filename;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `event-${file.originalname.split('.')[0]}-${Date.now()}-${i + 1}.jpeg`;
        const params = {
          Bucket: process.env.S3_NAME,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(params);

        await s3.send(command);
        req.body.images.push(filename);
      }),
    );
  }

  next();
});

exports.getAllEvents = handler.getAll(Event);
exports.getEvent = handler.getOne(Event);
exports.createEvent = handler.createOne(Event);
exports.updateEvent = handler.updateOne(Event);
exports.deleteEvent = handler.deleteOne(Event);
