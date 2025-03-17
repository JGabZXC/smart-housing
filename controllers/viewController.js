const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3Bucket');

const catchAsync = require('../utils/catchAsync');
const Project = require('../models/projectModel');
const Event = require('../models/eventModel');
const Garbage = require('../models/garbageModel');
const Payment = require('../models/paymentModel');

exports.getIndex = catchAsync(async (req, res, next) => {
  const garbages = await Garbage.find();
  const featuredProject = await Project.findOne({ isFeatured: true });

  res.status(200).render('index', {
    title: 'Holiday Homes',
    garbages,
    featuredProject,
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
  // console.log(project);
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
    const command = GetObjectCommand(objectParams);
    featuredEvent.imageCoverUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
  }

  res.status(200).render('events', {
    title: 'Events',
    featuredEvent,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const payment = await Payment.find({ user: req.user._id }).sort(
    '-paymentDate',
  );

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
  res.status(200).render('dashboard', {
    title: 'Dashboard',
  });
});

exports.getAddress = catchAsync(async (req, res, next) => {
  res.status(200).render('address', {
    title: 'Address',
  });
});
