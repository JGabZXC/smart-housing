const catchAsync = require('../utils/catchAsync');
const Project = require('../models/projectModel');
const Garbage = require('../models/garbageModel');
const s3 = require('../utils/s3Bucket');

const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

exports.getIndex = catchAsync(async (req, res, next) => {
  const garbages = await Garbage.find();
  const featuredProject = await Project.findOne({ isFeatured: true });

  res.status(200).render('index', {
    title: 'Holiday Homes',
    garbages,
    featuredProject,
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

// Fix this later!
exports.getImage = catchAsync(async (req, res, next) => {
  const imageCovers = await Project.find({
    imageCover: { $exists: true },
    isFeatured: true,
  }).select('imageCover');

  const imageCoverWithUrls = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const imageCover of imageCovers) {
    const getObjectParams = {
      Bucket: process.env.S3_NAME,
      Key: imageCover.imageCover,
    };
    const command = new GetObjectCommand(getObjectParams);
    // eslint-disable-next-line no-await-in-loop
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Conver Mongoose document to plain JavaScript object
    const imageCoverObj = imageCover.toObject();
    imageCoverObj.imageUrl = url;
    imageCoverWithUrls.push(imageCoverObj);
  }

  res.json(imageCoverWithUrls);
});
