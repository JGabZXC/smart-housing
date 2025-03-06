const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3Bucket');

const catchAsync = require('../utils/catchAsync');
const Project = require('../models/projectModel');
const Garbage = require('../models/garbageModel');
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
  const features = new APIFeatures(Project.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const projects = await features.query;

  const projectsWithSignedUrls = await Promise.all(
    projects.map(async (project) => {
      const getObjectParams = {
        Bucket: process.env.S3_NAME,
        Key: project.imageCover,
      };
      const command = new GetObjectCommand(getObjectParams);
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

      return {
        ...project.toObject(),
        imageCoverUrl: signedUrl,
      };
    }),
  );

  res.status(200).render('projects', {
    title: 'Projects',
    projects: projectsWithSignedUrls,
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

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});
