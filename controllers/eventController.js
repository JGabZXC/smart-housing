const multer = require('multer');
const Event = require('../models/eventModel');
const handler = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Message = require('../models/messageModel');
const signedImages = require('../utils/signedImages');
const s3Bucket = require('../utils/s3Bucket');

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

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // eslint-disable-next-line prefer-destructuring
  const query = features.query;

  const [doc, totalEvents] = await Promise.all([query, Event.countDocuments()]);
  const totalPages = Math.ceil(totalEvents / (req.query.limit || 10));

  const updatedDoc =
    doc.length > 0 && (await signedImages.checkSignedExpiration(doc, Event));

  let data = doc;

  if (updatedDoc) data = updatedDoc;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    totalPages,
    data: {
      doc: data,
    },
  });
});
exports.getEvent = handler.getOne(Event);
exports.createEvent = catchAsync(async (req, res, next) => {
  const {
    name,
    date,
    richDescription,
    description,
    place,
    imageCover,
    images,
    isFeatured,
  } = req.body;
  const expiresAt = signedImages.getExpiresAt();
  const payload = {};

  let newEvent;

  newEvent = await Event.create({
    name,
    date,
    richDescription,
    description,
    place,
    imageCover,
    images,
    isFeatured,
  });

  const { imgCover, imgsArray } = await s3Bucket.uploadToS3(req);

  if (imgCover || imgsArray.length > 0) {
    if (imgCover) {
      const signedCoverUrl = await signedImages.signUrl(imgCover);
      payload.imageCover = {
        key: imgCover,
        signedUrl: signedCoverUrl,
        signedUrlExpires: expiresAt,
      };
    }

    if (imgsArray && imgsArray.length > 0) {
      const signedUrls = await Promise.all(
        imgsArray.map((img) => signedImages.signUrl(img)),
      );
      payload.images = imgsArray.map((img, index) => ({
        key: img,
        signedUrl: signedUrls[index],
        signedUrlExpires: expiresAt,
      }));
    }
    newEvent = await Event.findByIdAndUpdate(newEvent._id, payload, {
      new: true,
    });
  }

  return res.status(201).json({
    status: 'success',
    data: newEvent,
  });
});
exports.updateEvent = catchAsync(async (req, res, next) => {
  const { name, date, richDescription, description, place } =
    req.body;
  const event = await Event.findById(req.params.id);
  if(req.body.isFeatured === 'false') req.body.isFeatured = false;
  if (!event) return next(new AppError('No event found with that ID', 404));

  if (
    (req.files.imageCover && event.imageCover?.key) ||
    (req.files.images && event.images.length > 0)
  ) {
    await s3Bucket.deleteObject(event);
  }

  let updatedEvent;
  const expiresAt = signedImages.getExpiresAt();
  const payload = {};

  updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    {
      name,
      date,
      richDescription,
      description,
      place,
      imageCover: payload?.imageCover,
      images: payload?.images,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  const { imgCover, imgsArray } = await s3Bucket.uploadToS3(req);
  if (imgCover || imgsArray.length > 0) {
    if (imgCover) {
      const signedCoverUrl = await signedImages.signUrl(imgCover);
      payload.imageCover = {
        key: imgCover,
        signedUrl: signedCoverUrl,
        signedUrlExpires: expiresAt,
      };
    }

    if (imgsArray && imgsArray.length > 0) {
      const signedUrls = await Promise.all(
        imgsArray.map((img) => signedImages.signUrl(img)),
      );
      payload.images = imgsArray.map((img, index) => ({
        key: img,
        signedUrl: signedUrls[index],
        signedUrlExpires: expiresAt,
      }));
    }

    updatedEvent = await Event.findByIdAndUpdate(updatedEvent._id, payload, {
      new: true,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedEvent,
    },
  });
});
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) return next(new AppError('No event found with that ID', 404));

  if (event.imageCover?.key || event.images.length > 0) {
    await s3Bucket.deleteObject(event);
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
