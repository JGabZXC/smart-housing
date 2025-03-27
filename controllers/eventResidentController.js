const handler = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const EventResident = require('../models/eventResidentModel');

exports.getAllEvents = handler.getAll(EventResident);
exports.getEvent = handler.getOne(EventResident);
exports.getResidentEvents = catchAsync(async (req, res, next) => {
  // Convert this later to ApiFeatures
  const events = await EventResident.find({ user: req.user._id });

  if (events.length === 0) return next(new AppError('No events found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      doc: events,
    },
  });
});
exports.createEvent = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const event = await EventResident.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      event,
    },
  });
});
exports.updateEvent = catchAsync(async (req, res, next) => {
  const event = await EventResident.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (req.body.user) delete req.body.user;

  if (!event) return next(new AppError('No event found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});
exports.deleteEvent = handler.deleteOne(EventResident);
