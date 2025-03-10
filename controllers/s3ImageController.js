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

    let coverPhotoUrl = null;
    const imageUrls = [];

    if (item?.imageCover) {
      const getObjectParams = {
        Bucket: process.env.S3_NAME,
        Key: item.imageCover,
      };
      const command = new GetObjectCommand(getObjectParams);
      coverPhotoUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    if (item?.images?.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const image of item.images) {
        const getObjectParams = {
          Bucket: process.env.S3_NAME,
          Key: image,
        };
        const command = new GetObjectCommand(getObjectParams);
        // eslint-disable-next-line no-await-in-loop
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        imageUrls.push(url);
      }
    }

    if (!coverPhotoUrl && imageUrls.length === 0)
      return res.json({ message: 'No images found' });

    return res.json({ coverPhotoUrl, imageUrls });
  });
exports.getAllImages = catchAsync(async (req, res, next) => {});
