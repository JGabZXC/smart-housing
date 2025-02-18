const User = require('../models/userModel');
const handlerFactory = require('./handlerController');

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);
exports.updateUser = handlerFactory.updateOne(User);

exports.signup = handlerFactory.createOne(User);
