const factory = require('./handlerController');
const House = require('../models/houseModel');

exports.getAllHouses = factory.getAll(House);
exports.getHouse = factory.getOne(House);
exports.createHouse = factory.createOne(House);
exports.updateHouse = factory.updateOne(House);
exports.deleteHouse = factory.deleteOne(House);
