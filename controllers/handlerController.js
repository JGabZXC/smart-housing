const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3Bucket');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Project = require('../models/projectModel');

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // eslint-disable-next-line prefer-destructuring
    let query = features.query;
    if (populateOptions) query = query.populate(populateOptions);

    let totalPages;
    if (
      req.originalUrl.split('/')[3].startsWith('projects') ||
      req.originalUrl.split('/')[1].startsWith('events')
    ) {
      const totalProjects = await Project.countDocuments();
      totalPages = Math.ceil(totalProjects / (req.query.limit || 10));
    }

    let doc = await query;


    // This is for event and project
    const modifiedDoc = [];

    for (const item of doc) {
      if (item.imageCover) {
        const getObjectParams = {
          Bucket: process.env.S3_NAME,
          Key: item.imageCover,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        modifiedDoc.push({ ...item.toObject(), imageUrl: url });
      } else {
        modifiedDoc.push({ ...item.toObject(), imageUrl: undefined });
      }
      doc = modifiedDoc;
    }

    res.status(200).json({
      status: 'success',
      results: doc.length,
      totalPages,
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(populateOptions);

    if (!doc) return next(new AppError('No document found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Check later
    if (
      (req.originalUrl.split('/')[-1] === 'events' ||
        req.originalUrl.split('/')[-1] === 'projects') &&
      req.body.date
    )
      return next(
        new AppError('You cannot create a document with a date', 400),
      );

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
