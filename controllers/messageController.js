const handlerFactory = require('./handlerController');
const Message = require('../models/messageModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.setEventIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.event)
    req.body.event = req.params.eventId || req.params.projectId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllMessages = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.eventId) filter = { event: req.params.eventId };
  if (req.params.projectId) filter = { event: req.params.projectId };
  const features = new APIFeatures(Message.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const messages = await features.query.populate({
    path: 'user',
    select: 'name',
  });

  const totalMessages = await Message.countDocuments(filter);
  const totalPages = Math.ceil(totalMessages / (req.query.limit || 10));

  res.status(200).json({
    status: 'success',
    results: messages.length,
    totalPages,
    messages,
  });
});
exports.getMessage = handlerFactory.getOne(Message);
exports.createMessage = handlerFactory.createOne(Message);
exports.updateMessage = handlerFactory.updateOne(Message);
exports.deleteMessage = handlerFactory.deleteOne(Message);
