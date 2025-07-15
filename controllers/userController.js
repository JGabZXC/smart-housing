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

exports.securityAnswer = catchAsync(async (req, res, next) => {
  const { secretQuestion, secretAnswer, currentAnswer } = req.body;

  if (!secretQuestion || !secretAnswer)
    return next(new AppError('Please provide all required fields', 400));

  const user = await User.findById(req.user._id);

  console.log(user.secretQuestion);

  if (user.secretQuestion) {
    if (!secretAnswer || !currentAnswer)
      return next(new AppError('Please provide all required fields', 400));
    if (!user.isCorrectSecretAnswer(user.secretAnswer, currentAnswer))
      return next(new AppError('Incorrect secret answer', 401));
  }

  if (
    user.secretAnswer &&
    (await user.isCorrectSecretAnswer(user.secretAnswer, secretAnswer))
  )
    return next(
      new AppError(
        'New secret answer must be different from current answer',
        400,
      ),
    );

  const hashedSecretAnswer = await user.hashSecretAnswer(secretAnswer);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      secretQuestion,
      secretAnswer: hashedSecretAnswer,
    },
    {
      new: true,
      validateModifiedOnly: true,
    },
  );

  authController.sendToken(updatedUser, 200, res);
});

exports.checkSecurityAnswer = catchAsync(async (req, res, next) => {
  const { secretAnswer } = req.body;

  if (!secretAnswer)
    return next(new AppError('Please provide the secret answer', 400));

  const user = await User.findById(req.user._id);

  if (!user.secretQuestion)
    return next(new AppError('No security question set', 400));

  if (!(await user.isCorrectSecretAnswer(secretAnswer, user.secretAnswer)))
    return next(new AppError('Incorrect secret answer', 401));

  res.status(200).json({
    status: 'success',
    message: 'Secret answer is correct',
  });
});
