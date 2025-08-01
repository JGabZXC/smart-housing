const catchAsync = require('../utils/catchAsync');
const Project = require('../models/projectModel');
const Event = require('../models/eventModel');
const Garbage = require('../models/garbageModel');
const Payment = require('../models/paymentModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getIndex = catchAsync(async (req, res, next) => {
  const [garbages, featuredProject, featuredEvent] = await Promise.all([
    Garbage.find(),
    Project.findOne({ isFeatured: true }),
    Event.findOne({ isFeatured: true }),
  ]);

  if (featuredEvent)
    featuredEvent.time = featuredEvent.date.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });

  res.status(200).render('index', {
    title: 'Holiday Homes',
    garbages,
    featuredProject,
    featuredEvent,
  });
});

exports.getAllProject = catchAsync(async (req, res, next) => {
  const featuredProject = await Project.findOne({ isFeatured: true });

  res.status(200).render('Project/projects', {
    title: 'Projects',
    featuredProject,
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) return next(new AppError('No project was found', 404));

  res.status(200).render('Project/project-single', {
    title: project.name,
    project,
  });
});

exports.getAllEvent = catchAsync(async (req, res, next) => {
  const featuredEvent = await Event.findOne({ isFeatured: true });

  res.status(200).render('Event/events', {
    title: 'Events',
    featuredEvent,
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug }).populate({
    path: 'attendees',
    select: 'name email contactNumber',
  });
  if (!event) return next(new AppError('No event found was found', 404));

  res.status(200).render('Event/event-single', {
    title: event.name,
    event,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.query.limit = 50; // Only 50 payments will be shown to the client
  req.query.sort = '-paymentDate'; // Sort payment to latest to oldest

  const features = new APIFeatures(
    Payment.find({ user: req.user._id }),
    req.query,
  )
    .sort()
    .paginate();

  const { query } = features;

  const payment = await query;

  res.status(200).render('Me/me', {
    title: req.user.name,
    payment,
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('Login/login', {
    title: 'Login',
  });
});

// ADMIN
exports.getAdminDashboard = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/dashboard', {
    title: 'Dashboard',
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/manual_payment', {
    title: 'Payment',
  });
});

exports.getYearlyStatement = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/yearlyStatement', {
    title: 'Yearly Statement',
  });
});

exports.getAddress = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/address', {
    title: 'Address',
  });
});

exports.getCreateResident = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/create_user', {
    title: 'Create User',
  });
});

exports.getUpdateResident = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/update_user', {
    title: 'Update Resident',
  });
});

exports.editProjEvePage = catchAsync(async (req, res, next) => {
  const { type } = req.query;
  const project = req.params.slug;
  let data = '';

  if (type === 'projects') data = await Project.findOne({ slug: project });
  if (type === 'events') data = await Event.findOne({ slug: project });

  if (type !== 'projects' && type !== 'events') {
    return next(new AppError('Invalid type specified', 400));
  }

  if (!data) return next(new AppError('No data was found', 404));

  res.status(200).render('EditProjectEvent/edit-project-event', {
    title: data.name,
    data,
    type,
  });
});

exports.acceptEventBookings = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/acceptEventBookings', {
    title: 'Event Bookings',
  });
});

exports.getGarbageCollection = catchAsync(async (req, res, next) => {
  res.status(200).render('Admin/garbageCollection', {
    title: 'Garbage Collection',
  });
});

exports.getForgotPassword = catchAsync(async (req, res, next) => {
  res.status(200).render('ForgotPassword/forgotPassword', {
    title: 'Forgot Password',
  });
});
