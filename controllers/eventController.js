const Event = require('../models/eventModel');
const handler = require('./handlerController');

exports.getAllEvents = handler.getAll(Event);
exports.getEvent = handler.getOne(Event);
exports.createEvent = handler.createOne(Event);
exports.updateEvent = handler.updateOne(Event);
exports.deleteEvent = handler.deleteOne(Event);
