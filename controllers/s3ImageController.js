const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3Bucket');

const catchAsync = require('../utils/catchAsync');
const Project = require('../models/projectModel');
const Event = require('../models/eventModel');

exports.getFeaturedCover = (event) =>
  catchAsync(async (req, res, next) => {
    let imageCovers;
    if (event === 'project') {
      imageCovers = await Project.find({
        isFeatured: true,
      }).select('imageCover');
    }

    if (event === 'event') {
      imageCovers = await Event.find({
        isFeatured: true,
      }).select('imageCover');
    }

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

exports.getImages = (event) =>
  catchAsync(async (req, res, next) => {
    let item;
    if (event === 'project') {
      item = await Project.findOne({ slug: req.params.slug });
    }

    if (event === 'event') {
      item = await Event.findOne({ slug: req.params.slug });
    }

    const coverPhoto = item.imageCover;
    const { images } = item;

    const getObjectParams = {
      Bucket: process.env.S3_NAME,
      Key: coverPhoto,
    };

    const command = new GetObjectCommand(getObjectParams);
    const coverPhotoUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    const imageUrls = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const image of images) {
      // eslint-disable-next-line no-shadow
      const getObjectParams = {
        Bucket: process.env.S3_NAME,
        Key: image,
      };
      // eslint-disable-next-line no-shadow
      const command = new GetObjectCommand(getObjectParams);
      // eslint-disable-next-line no-await-in-loop
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

      imageUrls.push(url);
    }

    res.json({ coverPhotoUrl, imageUrls });
  });

exports.getAllImages = catchAsync(async (req, res, next) => {});
