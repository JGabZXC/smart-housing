const mongoose = require('mongoose');
const slugify = require('slugify');
const AppError = require('../utils/appError');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A project must have a name'],
    trim: true,
    minLength: 5,
    maxLength: 30,
    unique: true,
  },
  date: {
    type: Date,
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
  imageCover: {
    key: String,
    signedUrl: String,
    signedUrlExpires: Date,
  },
  images: [
    {
      key: String,
      signedUrl: String,
      signedUrlExpires: Date,
    },
  ],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  slug: String,
});

projectSchema.pre('save', async function (next) {
  if (this.isFeatured) {
    const checkExistingFeatured = await mongoose.model('Project').find({
      isFeatured: true,
    });

    if (checkExistingFeatured.length >= 1)
      return next(new AppError('There is already a featured project.', 400));
  }

  this.slug = slugify(this.name, { lower: true });

  next();
});
projectSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const doc = await this.model.findOne(this.getQuery());

  if (update.isFeatured) {
    const checkExistingFeatured = await mongoose.model('Project').findOne({
      isFeatured: true,
    });

    if (!checkExistingFeatured) return next();

    if (String(checkExistingFeatured._id) === String(doc._id)) return next();

    if (checkExistingFeatured)
      return next(new AppError('There is already a featured project.', 400));
  }

  if(update.name) {
    update.slug = slugify(update.name || doc.name, { lower: true });
  }

  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
