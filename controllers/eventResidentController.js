const handler = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const EventResident = require('../models/eventResidentModel');
const User = require('../models/userModel');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.email) {
    const user = await User.findOne({ email: req.query.email });
    if (!user) return next(new AppError('No user found with that email', 404));
    filter.user = user._id;
  }
  const features = new APIFeatures(
    EventResident.find(filter).populate('user approvedBy'),
    req.query,
  )
    .sort()
    .paginate();

  const [events, totalEvents] = await Promise.all([
    features.query,
    EventResident.find(filter).countDocuments(),
  ]);
  const totalPages = Math.ceil(totalEvents / (req.query.limit || 10));
  let finalEvents = events;
  if (req.query.sort === 'user.name') {
    finalEvents = events.sort((a, b) => a.user.name.localeCompare(b.user.name));
  }

  res.status(200).json({
    status: 'success',
    results: events.length,
    totalPages,
    data: {
      doc: finalEvents,
    },
  });
});
exports.getEvent = handler.getOne(EventResident);
exports.getMyEvent = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    EventResident.find({ user: req.user._id }),
    req.query,
  )
    .sort()
    .paginate();

  const [events, totalEvents] = await Promise.all([
    features.query,
    EventResident.find().countDocuments(),
  ]);
  const totalPages = Math.ceil(totalEvents / (req.query.limit || 10));

  res.status(200).json({
    status: 'success',
    results: events.length,
    totalPages,
    data: {
      doc: events,
    },
  });
});
exports.createEvent = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;

  const checkDate = new Date(req.body.date);
  if (checkDate < new Date())
    return next(new AppError('Event date cannot be in the past', 400));

  const event = await EventResident.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      event,
    },
  });
});
exports.updateMyEvent = catchAsync(async (req, res, next) => {
  const filter = {};
  const updateBody = {};

  if (req.user.role === 'admin') {
    filter._id = req.params.id;

    if (typeof req.body.approved === 'boolean') {
      updateBody.approved = req.body.approved;
      updateBody.approvedBy = req.body.approved ? req.user._id : null;
    }
  } else {
    filter._id = req.params.id;
    filter.user = req.user._id;
    // Non-admin users cannot modify approval status
    delete req.body.approved;
    delete req.body.approvedBy;
  }

  const event = await EventResident.findOneAndUpdate(filter, updateBody, {
    new: true,
    runValidators: true,
  }).populate('user approvedBy');

  if (!event) return next(new AppError('No event found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});
exports.deleteMyEvent = catchAsync(async (req, res, next) => {
  const event = await EventResident.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!event) return next(new AppError('No event found', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
