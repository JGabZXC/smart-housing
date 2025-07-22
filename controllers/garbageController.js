const Garbage = require('../models/garbageModel');
const handler = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllGarbages = handler.getAll(Garbage);
exports.createGarbage = handler.createOne(Garbage);
exports.getOneGarbage = handler.getOne(Garbage);
exports.updateGarbage = handler.updateOne(Garbage);
exports.deleteGarbage = handler.deleteOne(Garbage);

exports.updateGarbageSchedule = catchAsync(async (req, res, next) => {
  const { garbageId, scheduleId } = req.params;
  const { day } = req.body;

  if (typeof day !== 'string' || !day)
    return next(new AppError('Day must be a string', 400));

  const formattedDay =
    day.trim().charAt(0).toUpperCase() + day.slice(1).toLowerCase();

  const schedule = await Garbage.findOne({
    _id: garbageId,
    'schedule._id': scheduleId,
  });

  if (!schedule)
    return next(new AppError('No garbage or schedule found with that ID', 404));

  const scheduleToUpdate = schedule.schedule.id(scheduleId);
  if (!scheduleToUpdate)
    return next(new AppError('No schedule found with that ID', 404));

  scheduleToUpdate.day = formattedDay;
  const latestGarbage = await schedule.save({
    validateModifiedOnly: true,
  });

  return res.status(200).json({
    status: 'success',
    data: {
      doc: latestGarbage,
    },
  });
});
exports.updateGarbageScheduleTimeLocation = catchAsync(
  async (req, res, next) => {
    const { garbageId, scheduleId, timelocationId } = req.params;
    const { timeLocation } = req.body;

    const existingTimeLocation = await Garbage.findOne({
      _id: garbageId,
      'schedule._id': scheduleId,
      'schedule.timeLocation._id': timelocationId,
    });

    if (!existingTimeLocation)
      return next(new AppError('No time location found with that ID', 404));

    const schedule = existingTimeLocation.schedule.id(scheduleId);
    const toUpdateLocation = schedule.timeLocation.id(timelocationId);

    if (!toUpdateLocation)
      return next(new AppError('No time location found with that ID', 404));

    if (timeLocation.time) toUpdateLocation.time = timeLocation.time;
    if (timeLocation.street) {
      toUpdateLocation.street = timeLocation.street;
    }

    const updatedGarbage = await existingTimeLocation.save({
      validateModifiedOnly: true,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        doc: updatedGarbage,
      },
    });
  },
);
exports.deleteGarbageScheduleTimeLocation = catchAsync(
  async (req, res, next) => {
    const { garbageId, scheduleId, timelocationId } = req.params;

    const existingTimeLocation = await Garbage.findOne({
      _id: garbageId,
      'schedule._id': scheduleId,
      'schedule.timeLocation._id': timelocationId,
    });

    if (!existingTimeLocation)
      return next(new AppError('No time location found with that ID', 404));

    const schedule = existingTimeLocation.schedule.id(scheduleId);
    const toUpdateLocation = schedule.timeLocation.id(timelocationId);

    if (!toUpdateLocation)
      return next(new AppError('No time location found with that ID', 404));

    schedule.timeLocation.pull(timelocationId); // Delete the time location

    const updatedGarbage = await existingTimeLocation.save({
      validateModifiedOnly: true,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        doc: updatedGarbage,
      },
    });
  },
);
exports.insertGarbageSchedule = catchAsync(async (req, res, next) => {
  const { garbageId } = req.params;
  const { schedule } = req.body;

  const { day } = schedule;

  if (typeof day !== 'string' || !day)
    return next(new AppError('Day must be a string', 400));

  const formattedDay =
    day.trim().charAt(0).toUpperCase() + day.slice(1).toLowerCase();

  const garbage = await Garbage.findOne({ _id: garbageId });
  if (!garbage) return next(new AppError('No garbage found with that ID', 404));

  garbage.schedule.push(schedule);
  const updatedGarbage = await garbage.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      doc: updatedGarbage,
    },
  });
});
exports.insertGarbageScheduleTimeLocation = catchAsync(
  async (req, res, next) => {
    const { garbageId, scheduleId } = req.params;
    const { timeLocation } = req.body;

    const schedule = await Garbage.findOne({
      _id: garbageId,
      'schedule._id': scheduleId,
    });

    if (!schedule)
      return next(
        new AppError('No garbage or schedule found with that ID', 404),
      );

    const scheduleToUpdate = schedule.schedule.id(scheduleId);
    scheduleToUpdate.timeLocation.push(timeLocation);
    const updatedGarbage = await schedule.save({
      validateModifiedOnly: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        doc: updatedGarbage,
      },
    });
  },
);
exports.deleteGarbageSchedule = catchAsync(async (req, res, next) => {
  const { garbageId, scheduleId } = req.params;

  const schedule = await Garbage.findOne({
    _id: garbageId,
    'schedule._id': scheduleId,
  });

  if (!schedule)
    return next(new AppError('No garbage or schedule found with that ID', 404));

  schedule.schedule.pull(scheduleId);

  const updatedGarbage = await schedule.save({
    validateModifiedOnly: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      doc: updatedGarbage,
    },
  });
});

exports.updateTimeLocation = catchAsync(async (req, res, next) => {
  const { garbageId, timeLocationId } = req.params;

  const garbage = await Garbage.findById(garbageId);

  if (!garbage) return next(new AppError('No garbage found with that ID', 404));

  const timeLocation = garbage.timeLocation.id(timeLocationId);

  if (!timeLocation)
    return next(new AppError('No timeLocation found with that ID', 404));

  if (req.body.time) timeLocation.time = req.body.time;
  if (req.body.street) timeLocation.street = req.body.street;

  const latestGarbage = await garbage.save();

  res.status(200).json({
    status: 'success',
    doc: {
      doc: latestGarbage,
    },
  });
});
