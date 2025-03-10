const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3Bucket');

const catchAsync = require('../utils/catchAsync');
const Project = require('../models/projectModel');
const Garbage = require('../models/garbageModel');
const Payment = require('../models/paymentModel');
const APIFeatures = require('../utils/apiFeatures');

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
  let featuredProjectWithSignedUrl = null;

  if (featuredProject) {
    const getObjectParams = {
      Bucket: process.env.S3_NAME,
      Key: featuredProject.imageCover,
    };
    const command = new GetObjectCommand(getObjectParams);
    const imageCoverUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    featuredProjectWithSignedUrl = {
      ...featuredProject.toObject(),
      imageCoverUrl,
    };
  }

  const features = new APIFeatures(Project.find(), req.query)
    .filter()
    .limitFields()
    .paginate();
  const projects = await features.query.sort('-date');

  const projectsWithSignedUrls = await Promise.all(
    projects.map(async (project) => {
      let imageCoverUrl = null;

      if (project.imageCover) {
        const getObjectParams = {
          Bucket: process.env.S3_NAME,
          Key: project.imageCover,
        };
        const command = new GetObjectCommand(getObjectParams);
        imageCoverUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      }

      return {
        ...project.toObject(),
        imageCoverUrl,
      };
    }),
  );

  const totalProjects = await Project.countDocuments();
  const totalPages = Math.ceil(totalProjects / (req.query.limit || 10));
  const currentPage = +req.query.page || 1;

  res.status(200).render('projects', {
    title: 'Projects',
    featuredProject: featuredProjectWithSignedUrl,
    projects: projectsWithSignedUrls,
    totalPages,
    currentPage,
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
