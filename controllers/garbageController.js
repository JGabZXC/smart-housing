const Garbage = require('../models/garbageModel');
const handler = require('./handlerController');

exports.getAllGarbages = handler.getAll(Garbage);
exports.createGarbage = handler.createOne(Garbage);
exports.getOneGarbage = handler.getOne(Garbage);
exports.updateGarbage = handler.updateOne(Garbage);
exports.deleteGarbage = handler.deleteOne(Garbage);
