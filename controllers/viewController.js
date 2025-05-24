const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3Bucket');

const catchAsync = require('../utils/catchAsync');
const Project = require('../models/projectModel');
const Event = require('../models/eventModel');
const Garbage = require('../models/garbageModel');
const Payment = require('../models/paymentModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getIndex = catchAsync(async (req, res, next) => {
  // const garbages = await Garbage.find();
  // const featuredProject = await Project.findOne({ isFeatured: true });
  // const featuredEvent = await Event.findOne({ isFeatured: true });
  const [garbages, featuredProject, featuredEvent] = await Promise.all([
    Garbage.find(),
    Project.findOne({ isFeatured: true }),
    Event.findOne({ isFeatured: true }),
  ]);

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

  if (featuredProject?.imageCover) {
    const getObjectParams = {
      Bucket: process.env.S3_NAME,
      Key: featuredProject.imageCover,
    };
    const command = new GetObjectCommand(getObjectParams);
    featuredProject.imageCoverUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
  }

  res.status(200).render('projects', {
    title: 'Projects',
    featuredProject,
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) return next(new AppError('No project was found', 404));

  res.status(200).render('project-single', {
    title: project.name,
    project,
  });
});

exports.getAllEvent = catchAsync(async (req, res, next) => {
  const featuredEvent = await Event.findOne({ isFeatured: true });

  if (featuredEvent?.imageCover) {
    const objectParams = {
      Bucket: process.env.S3_NAME,
      Key: featuredEvent.imageCover,
    };
    const command = new GetObjectCommand(objectParams);
    featuredEvent.imageCoverUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
  }

  res.status(200).render('events', {
    title: 'Events',
    featuredEvent,
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug });
  if (!event) return next(new AppError('No event found was found', 404));

  res.status(200).render('event-single', {
    title: event.name,
    event,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  // const payment = await Payment.find({ user: req.user._id }).sort(
  //   '-paymentDate',
  // );

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

  res.status(200).render('me', {
    title: req.user.name,
    payment,
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

// ADMIN
exports.getAdminDashboard = catchAsync(async (req, res, next) => {
  const [featuredProject, featuredEvent] = await Promise.all([
    Project.findOne({ isFeatured: true }),
    Event.findOne({ isFeatured: true }),
  ]);

  if (featuredProject?.imageCover) {
    const getObjectParams = {
      Bucket: process.env.S3_NAME,
      Key: featuredProject.imageCover,
    };
    const command = new GetObjectCommand(getObjectParams);
    featuredProject.imageCoverUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
  }

  if (featuredEvent?.imageCover) {
    const getObjectParams = {
      Bucket: process.env.S3_NAME,
      Key: featuredEvent.imageCover,
    };
    const command = new GetObjectCommand(getObjectParams);
    featuredEvent.imageCoverUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
  }

  res.status(200).render('dashboard', {
    title: 'Dashboard',
    featuredProject,
    featuredEvent,
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  res.status(200).render('payment', {
    title: 'Payment',
  });
});

exports.getAddress = catchAsync(async (req, res, next) => {
  res.status(200).render('address', {
    title: 'Address',
  });
});

exports.getCreateResident = catchAsync(async (req, res, next) => {
  res.status(200).render('create_resident', {
    title: 'Create Resident',
  });
});

exports.getUpdateResident = catchAsync(async (req, res, next) => {
  res.status(200).render('update_resident', {
    title: 'Update Resident',
  });
});

exports.editProjEvePage = catchAsync(async (req, res, next) => {
  const { type } = req.query;
  const project = req.params.slug;
  let data = '';

  if (type === 'project') data = await Project.findOne({ slug: project });
  if (type === 'event') data = await Event.findOne({ slug: project });

  if (type !== 'project' && type !== 'event') {
    return next(new AppError('Invalid type specified', 400));
  }

  if (!data) return next(new AppError('No data was found', 404));

  res.status(200).render('edit_proj_eve', {
    title: data.name,
    data,
    type,
  });
});
