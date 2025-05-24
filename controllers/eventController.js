const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const s3 = require('../utils/s3Bucket');
const Event = require('../models/eventModel');
const handler = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Message = require('../models/messageModel');

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

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // eslint-disable-next-line prefer-destructuring
  const query = features.query;

  const totalEvent = await Event.countDocuments();
  const totalPages = Math.ceil(totalEvent / (req.query.limit || 10));

  let doc = await query;

  doc = await Promise.all(
    doc.map(async (item) => {
      const modifiedItem = { ...item.toObject() };

      // Generate signed URL for imageCover (if it exists)
      if (item.imageCover) {
        const getObjectsParams = {
          Bucket: process.env.S3_NAME,
          Key: item.imageCover,
        };
        const command = new GetObjectCommand(getObjectsParams);
        modifiedItem.coverUrl = await getSignedUrl(s3, command, {
          expiresIn: 3600,
        });
      } else {
        modifiedItem.coverUrl = undefined;
      }

      // Generate signed URLs for images (if they exist)
      if (item.images.length > 0) {
        modifiedItem.imagesUrl = await Promise.all(
          item.images.map(async (image) => {
            const getObjectsParams = {
              Bucket: process.env.S3_NAME,
              Key: image,
            };
            const command = new GetObjectCommand(getObjectsParams);
            return await getSignedUrl(s3, command, { expiresIn: 3600 });
          }),
        );
      } else {
        modifiedItem.imagesUrl = undefined;
      }

      // Return the object
      return modifiedItem;
    }),
  );

  res.status(200).json({
    status: 'success',
    results: doc.length,
    totalPages,
    data: {
      doc,
    },
  });
});
exports.getEvent = handler.getOne(Event);
exports.createEvent = handler.createOne(Event);
exports.updateEvent = catchAsync(async (req, res,next) => {
  const event = await Event.findById(req.params.id);

  console.log(req.body);

  if(req.body.isFeatured === 'false') req.body.isFeatured = false;

  if(!event) return next(new Apperror('No event found with that ID', 404));

  if(req.body.imageCover && event.imageCover) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_NAME,
        Key: project.imageCover
      }),
    );
  }

  if(req.body.images && project.images.length > 0) {
    await Promise.all(
      project.images.map(async (image) => {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_NAME,
            Key: image
          }),
        );
      }),
    );
  }

  const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      },
    );

  res.status(200).json({
    status: 'success',
    data: {
      updatedEvent,
    }
  })

});
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) return next(new AppError('No event found with that ID', 404));

  if (event.imageCover) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_NAME,
        Key: event.imageCover,
      }),
    );
  }

  if (event.images && event.images.length > 0) {
    await Promise.all(
      event.images.map(async (image) => {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_NAME,
            Key: image,
          }),
        );
      }),
    );
  }

  await Event.findByIdAndDelete(req.params.id);
  await Message.deleteMany({ event: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.attendEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) return next(new AppError('Event not found!'));

  if (event.attendees.includes(req.user._id))
    return next(new AppError('You are already attending this event!'));

  event.attendees.push(req.user._id);
  await event.save();

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});
