const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An event must have a name'],
    trime: true,
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
  image: String,
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
});

eventSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

// Check if there is already a featured event
eventSchema.pre('save', async (next) => {
  const checkExistingFeatured = await mongoose.model('Event').find({
    isFeatured: true,
  });

  if (checkExistingFeatured.length >= 1)
    return next(new AppError('There is already a featured event', 400));

  next();
});
eventSchema.pre('findOneAndUpdate', async (next) => {
  const checkExistingFeatured = await mongoose.model('Event').find({
    isFeatured: true,
  });

  if (checkExistingFeatured.length >= 1)
    return next(new AppError('There is already a featured event', 400));

  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
