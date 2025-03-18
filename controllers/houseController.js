const factory = require('./handlerController');
const House = require('../models/houseModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllHouses = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(House.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const houses = await features.query;

  const countFeatures = new APIFeatures(House.find(), req.query).filter();
  const totalHouses = await countFeatures.query.countDocuments();
  const totalPages = Math.ceil(totalHouses / (req.query.limit || 10));

  res.status(200).json({
    status: 'success',
    results: houses.length,
    totalPages,
    houses,
  });
});
exports.getHouse = factory.getOne(House);
exports.createHouse = factory.createOne(House);
exports.updateHouse = factory.updateOne(House);
exports.deleteHouse = factory.deleteOne(House);
