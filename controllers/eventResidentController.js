const handler = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const EventResident = require('../models/eventResidentModel');

exports.getAllEvents = handler.getAll(EventResident);
exports.getEvent = handler.getOne(EventResident);
exports.getMyEvent = catchAsync(async (req, res, next) => {
  req.query.sort = '-createdAt';
  const features = new APIFeatures(
    EventResident.find({ user: req.user._id }),
    req.query,
  )
    .sort()
    .paginate();

  const events = await features.query;

  const totalEvents = await EventResident.find({
    user: req.user._id,
  }).countDocuments();
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

  console.log(req.body);

  const event = await EventResident.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      event,
    },
  });
});
exports.updateMyEvent = catchAsync(async (req, res, next) => {
  const event = await EventResident.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      date: req.body.date,
      place: req.body.place,
    },
    {
      new: true,
      runValidators: true,
    },
  );

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
