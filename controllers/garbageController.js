const Garbage = require('../models/garbageModel');
const handler = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllGarbages = handler.getAll(Garbage);
exports.createGarbage = handler.createOne(Garbage);
exports.getOneGarbage = handler.getOne(Garbage);
exports.updateGarbage = handler.updateOne(Garbage);
exports.deleteGarbage = handler.deleteOne(Garbage);

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
