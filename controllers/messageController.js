const handlerFactory = require('./handlerController');
const Message = require('../models/messageModel');

exports.setEventIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.event) req.body.event = req.params.eventId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllMessages = handlerFactory.getAll(Message);
exports.getMessage = handlerFactory.getOne(Message);
exports.createMessage = handlerFactory.createOne(Message);
exports.updateMessage = handlerFactory.updateOne(Message);
exports.deleteMessage = handlerFactory.deleteOne(Message);
