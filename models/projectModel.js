const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A project must have a name'],
    trime: true,
    minLength: 5,
    maxLength: 30,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  richDescription: {
    type: String,
    required: [true, 'A project must have a rich description'],
  },
  description: {
    type: String,
    required: [true, 'A project must have a description'],
    minLength: 10,
  },
  imageCover: String,
  images: [String],
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

projectSchema.pre('save', async function (next) {
  if (this.isFeatured) {
    const checkExistingFeatured = await mongoose.model('Project').find({
      isFeatured: true,
    });

    if (checkExistingFeatured.length >= 1)
      return next(new AppError('There is already a featured project.', 400));
  }

  next();
});
projectSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update.isFeatured) {
    const checkExistingFeatured = await mongoose.model('Project').find({
      isFeatured: true,
    });

    if (checkExistingFeatured.length >= 1)
      return next(new AppError('There is already a featured project.', 400));
  }

  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
