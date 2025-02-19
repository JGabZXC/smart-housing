const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerController');
const catchAsync = require('../utils/catchAsync');

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  ),
  httpOnly: true,
};

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // remove password from the output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);
exports.updateUser = handlerFactory.updateOne(User);

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    contactNumber: req.body.contactNumber,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    phase: req.body.phase,
    street: req.body.street,
    blk: req.body.blk,
    lot: req.body.lot,
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // username variable will accept username or email input
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Invalid email or password', 401));

  user.validTokenDate = Date.now();
  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    if (process.env.NODE_ENV === 'development')
      return next(
        new AppError(
          'You are not logged in. Please log in to get access.',
          401,
        ),
      );
    else res.redirect('/');

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password. Please log in again.', 401),
    );

  if (currentUser.isTokenLatest(decoded.iat))
    return next(new AppError('Token is not the latest.', 401));

  req.user = currentUser;
  next();
});

exports.protectTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );

    next();
  };
