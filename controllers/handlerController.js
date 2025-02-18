const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const validateUserFields = (req, next) => {
  // User created should not have a role, eventAttended, or payment
  if (req.body.role || req.body.eventAttended || req.body.payment)
    return new AppError(
      'You cannot create a user with a role, eventAttended, or payment',
      400,
    );
  return null;
};

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.find();

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const restrictedFieldsErrorUser = validateUserFields(req, next);
    if (restrictedFieldsErrorUser) return next(restrictedFieldsErrorUser);

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const restrictedFieldsErrorUser = validateUserFields(req, next);
    if (restrictedFieldsErrorUser) return next(restrictedFieldsErrorUser);

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
