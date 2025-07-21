const multer = require('multer');
const handler = require('./handlerController');
const Project = require('../models/projectModel');
const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const signedImages = require('../utils/signedImages');
const s3Bucket = require('../utils/s3Bucket');

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

exports.setProjectUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.event) req.body.event = req.params.projectId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllProjects = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Project.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // eslint-disable-next-line prefer-destructuring
  const query = features.query;

  const [doc, totalProjects] = await Promise.all([
    query,
    Project.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalProjects / (req.query.limit || 10));

  const updatedDoc =
    doc.length > 0 && (await signedImages.checkSignedExpiration(doc, Project));

  let data = doc;

  if (updatedDoc) data = updatedDoc;

  res.status(200).json({
    status: 'success',
    results: doc.length,
    totalPages,
    data: {
      doc: data,
    },
  });
});
exports.getProject = handler.getOne(Project);
exports.createProject = catchAsync(async (req, res, next) => {
  const { date } = req.body;

  const expiresAt = signedImages.getExpiresAt();
  const payload = {};

  const body = { ...req.body };
  if (date === '') delete body.date;

  let newProject;

  newProject = await Project.create(body);

  const { imgCover, imgsArray } = await s3Bucket.uploadToS3(req);

  if (imgCover || imgsArray.length > 0) {
    if (imgCover) {
      const signedCoverUrl = await signedImages.signUrl(imgCover);
      payload.imageCover = {
        key: imgCover,
        signedUrl: signedCoverUrl,
        signedUrlExpires: expiresAt,
      };
    }

    if (imgsArray && imgsArray.length > 0) {
      const signedUrls = await Promise.all(
        imgsArray.map((img) => signedImages.signUrl(img)),
      );
      payload.images = imgsArray.map((img, index) => ({
        key: img,
        signedUrl: signedUrls[index],
        signedUrlExpires: expiresAt,
      }));
    }

    newProject = await Project.findByIdAndUpdate(newProject._id, payload, {
      new: true,
    });
  }

  return res.status(201).json({
    status: 'success',
    data: newProject,
  });
});
exports.updateProject = catchAsync(async (req, res, next) => {
  const { name, richDescription, description, date } = req.body;
  const project = await Project.findById(req.params.id);
  if (req.body.isFeatured === 'false') req.body.isFeatured = undefined;
  if (!project) return next(new AppError('No project found with that ID', 404));

  if (
    (req.files.imageCover && project.imageCover?.key) ||
    (req.files.images && project.images.length > 0)
  ) {
    await s3Bucket.deleteObject(project);
  }

  let updatedProject;
  const expiresAt = signedImages.getExpiresAt();
  const payload = {};

  updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    {
      name,
      richDescription,
      description,
      isFeatured: req.body.isFeatured,
      date,
      imageCover: payload?.imageCover,
      images: payload?.images,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  const { imgCover, imgsArray } = await s3Bucket.uploadToS3(req);
  if (imgCover || imgsArray.length > 0) {
    if (imgCover) {
      const signedCoverUrl = await signedImages.signUrl(imgCover);
      payload.imageCover = {
        key: imgCover,
        signedUrl: signedCoverUrl,
        signedUrlExpires: expiresAt,
      };
    }

    if (imgsArray && imgsArray.length > 0) {
      const signedUrls = await Promise.all(
        imgsArray.map((img) => signedImages.signUrl(img)),
      );
      payload.images = imgsArray.map((img, index) => ({
        key: img,
        signedUrl: signedUrls[index],
        signedUrlExpires: expiresAt,
      }));
    }

    updatedProject = await Project.findByIdAndUpdate(
      updatedProject._id,
      payload,
      {
        new: true,
      },
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedProject,
    },
  });
});
exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError('No project found with that ID', 404));

  if (project.imageCover?.key || project.images.length > 0) {
    await s3Bucket.deleteObject(project);
  }

  await Project.findByIdAndDelete(req.params.id);
  await Message.deleteMany({ event: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
