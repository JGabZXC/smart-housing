// noinspection JSUnusedLocalSymbols

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerController');
const catchAsync = require('../utils/catchAsync');
const validateHouse = require('../utils/validateHouse');
const House = require('../models/houseModel');

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
exports.getUser = handlerFactory.getOne(User, 'address');
exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedFields = {};

  const user = await User.findOne({ _id: req.params.id });
  if (!user) return next(new AppError('User not found', 404));

  if (req.body.password && req.body.confirmPassword) {
    if (req.body.password !== req.body.confirmPassword)
      return next(new AppError('Passwords do not match', 400));

    updatedFields.password = req.body.password;
    updatedFields.confirmPassword = req.body.confirmPassword;
  }

  updatedFields.name = req.body.name || user.name;
  updatedFields.contactNumber = req.body.contactNumber || user.contactNumber;
  updatedFields.email = req.body.email || user.email;
  updatedFields.role = req.body.role || user.role;

  if (req.body.address) {
    const newAddress = await validateHouse(req.body.address);

    updatedFields.address = newAddress._id;
    await House.findOneAndUpdate(
      { _id: newAddress._id },
      { status: 'occupied' },
      { new: true, runValidators: true },
    );

    if (user.address !== newAddress._id) {
      const prevAddress = await House.findOne({ _id: user.address });
      await House.findOneAndUpdate(
        { _id: prevAddress._id },
        { status: 'unoccupied' },
        { new: true, runValidators: true },
      );
    }
  }
  await User.updateOne({ _id: user._id }, updatedFields);

  res.status(200).json({
    status: 'success',
    data: {
      user: await User.findById(user._id),
    },
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if(!user) return next(new AppError('User not found', 404));

  await Message.deleteMany({user: req.params.id})
  await User.findByIdAndDelete(req.params.id);
  await House.findOneAndUpdate({ _id: user.address }, {status: 'unoccupied'}, {new: true, runValidators: true});

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  let { address } = req.body;

  console.log(req.body)

  if (typeof address !== 'object') {
    await validateHouse(address);
  } else {
    const { phase, block, lot, street } = req.body.address;
    const house = await validateHouse({ phase, block, lot, street });
    address = house._id;
  }

  const newUser = await User.create({
    name: req.body.name,
    contactNumber: req.body.contactNumber,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    address,
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

  await User.updateOne({ _id: user._id }, { validTokenDate: Date.now() });

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

// Only for rendered pages, no errors | JWT COOKIES
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const currentUser = await User.findById(decoded.id);

      if (!currentUser) return next();

      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      if (currentUser.isTokenLatest(decoded.iat)) return next();

      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.reRoute = (req, res, next) => {
  if (res.locals.user) return res.redirect('/');
  next();
};
