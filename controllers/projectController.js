const multer = require('multer');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../utils/s3Bucket');
const handler = require('./handlerController');
const Project = require('../models/projectModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProjectImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

exports.uploadS3 = catchAsync(async (req, res, next) => {
  // resize imageCover
  // const buffer = await sharp(req.files.imageCover[0].buffer)
  //   .resize({
  //     height: 1080,
  //     width: 1920,
  //     fit: 'contain',
  //   })
  //   .toBuffer();

  if (req.files.imageCover) {
    const filename = `project-${req.files.imageCover[0].originalname.split('.')[0]}-${Date.now()}-cover.jpeg`;
    const params = {
      Bucket: process.env.S3_NAME,
      Key: filename,
      Body: req.files.imageCover[0].buffer,
      ContentType: req.files.imageCover[0].mimetype,
    };
    const command = new PutObjectCommand(params);

    await s3.send(command);
    req.body.imageCover = filename;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `project-${file.originalname.split('.')[0]}-${Date.now()}-${i + 1}.jpeg`;
        const params = {
          Bucket: process.env.S3_NAME,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(params);

        await s3.send(command);
        req.body.images.push(filename);
      }),
    );
  }

  next();
});

exports.setProjectUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.event) req.body.event = req.params.projectId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllProjects = handler.getAll(Project);
exports.getProject = handler.getOne(Project);
exports.createProject = handler.createOne(Project);
exports.updateProject = handler.updateOne(Project);
exports.deleteProject = handler.deleteOne(Project);
