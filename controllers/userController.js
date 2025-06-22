const catchAsync = require('../utils/catchAsync');
const authController = require('./authController');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, confirmPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.checkPassword(currentPassword, user.password)))
    return next(new AppError('Current password is incorrect', 401));

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordChangedAt = Date.now();
  const updatedUser = await user.save({ validateModifiedOnly: true });

  authController.sendToken(updatedUser, 200, res);
});

exports.changeDetails = catchAsync(async (req, res, next) => {
  const { name, email, contactNumber } = req.body;

  if (typeof name !== 'string' || typeof email !== 'string')
    return next(new AppError('Name or email must be strings', 400));

  req.body.name = name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!email) delete req.body.email;
  if (!name) delete req.body.name;
  if (!contactNumber) delete req.body.contactNumber;

  if (email) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) return next(new AppError('Invalid email format', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    validateModifiedOnly: true,
  });

  authController.sendToken(updatedUser, 200, res);
});
