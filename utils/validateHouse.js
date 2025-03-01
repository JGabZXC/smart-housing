const House = require('../models/houseModel');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');

const validateHouse = catchAsync(async (address) => {
  const house = await House.findOne({ _id: address });

  if (!house) throw new AppError('House not found', 404);
  if (house.status === 'occupied') throw new AppError('House is occupied', 400);

  return house;
});

module.exports = validateHouse;
