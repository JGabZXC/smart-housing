const mongoose = require('mongoose');
const slugify = require('slugify');
const AppError = require('../utils/appError');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An event must have a name'],
    trim: true,
    minLength: 5,
    maxLength: 30,
  },
  date: {
    type: Date,
    required: [true, 'An event must have a data'],
  },
  richDescription: {
    type: String,
    required: [true, 'An event must have a rich description'],
  },
  description: {
    type: String,
    required: [true, 'An event must have a description'],
    minLength: 10,
  },
  place: {
    type: String,
    required: [true, 'An event must have a place'],
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
  attendees: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  slug: String,
});

eventSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

// Check if there is already a featured event
eventSchema.pre('save', async function (next) {
  if (this.isFeatured) {
    const checkExistingFeatured = await mongoose.model('Event').find({
      isFeatured: true,
    });

    if (checkExistingFeatured.length >= 1)
      return next(new AppError('There is already a featured event', 400));
  }

  this.slug = slugify(this.name, { lower: true });

  next();
});
eventSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update.isFeatured) {
    const checkExistingFeatured = await mongoose.model('Event').find({
      isFeatured: true,
    });

    if (checkExistingFeatured.length >= 1)
      return next(new AppError('There is already a featured event', 400));
  }

  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }

  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
