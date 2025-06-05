const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const s3 = require('../utils/s3Bucket');
const handler = require('./handlerController');
const Project = require('../models/projectModel');
const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const signedImages = require('../utils/signedImages');
const { uploadToS3 } = require('../utils/uploadToS3');

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

  // if (req.files.imageCover) {
  //   const filename = `project-${req.files.imageCover[0].originalname.split('.')[0]}-${Date.now()}-cover.jpeg`;
  //   const params = {
  //     Bucket: process.env.S3_NAME,
  //     Key: filename,
  //     Body: req.files.imageCover[0].buffer,
  //     ContentType: req.files.imageCover[0].mimetype,
  //   };
  //   const command = new PutObjectCommand(params);
  //
  //   await s3.send(command);
  //   req.body.imageCover = filename;
  // }
  //
  // if (req.files.images) {
  //   req.body.images = [];
  //   await Promise.all(
  //     req.files.images.map(async (file, i) => {
  //       const filename = `project-${file.originalname.split('.')[0]}-${Date.now()}-${i + 1}.jpeg`;
  //       const params = {
  //         Bucket: process.env.S3_NAME,
  //         Key: filename,
  //         Body: file.buffer,
  //         ContentType: file.mimetype,
  //       };
  //       const command = new PutObjectCommand(params);
  //
  //       await s3.send(command);
  //       req.body.images.push(filename);
  //     }),
  //   );
  // }

  next();
});

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
  const {
    name,
    richDescription,
    description,
    isFeatured,
    imageCover,
    images,
    date,
  } = req.body;
  const expiresAt = signedImages.getExpiresAt();
  const payload = {};

  let newProject;

  newProject = await Project.create({
    name,
    richDescription,
    description,
    isFeatured,
    date,
    imageCover,
    images,
  });

  const { imgCover, imgsArray } = await uploadToS3(req);

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
  const {
    name,
    richDescription,
    description,
    isFeatured,
    imageCover,
    images,
    date,
  } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return next(new AppError('No project found with that ID', 404));



  if (req.files.imageCover && project.imageCover) {
    console.log("delete")
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_NAME,
        Key: project.imageCover.key,
      }),
    );
  }

  if (req.files.images && project.images.length > 0) {
    await Promise.all(
      project.images.map(async (image) => {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_NAME,
            Key: image.key,
          }),
        );
      }),
    );
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
      isFeatured,
      date,
      imageCover: payload?.imageCover,
      images: payload?.images,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  const { imgCover, imgsArray } = await uploadToS3(req);
  // const imgCover = {};
  // const imgsArray = [];
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

  if (project.imageCover) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_NAME,
        Key: project.imageCover.key,
      }),
    );
  }

  if (project.images && project.images.length > 0) {
    await Promise.all(
      project.images.map(async (image) => {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_NAME,
            Key: image.key,
          }),
        );
      }),
    );
  }

  await Project.findByIdAndDelete(req.params.id);
  await Message.deleteMany({ event: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
