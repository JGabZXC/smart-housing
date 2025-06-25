const mongoose = require('mongoose');

const timeLocationSchema = new mongoose.Schema({
  time: {
    type: String,
    required: [true, 'Please provide Time'],
  },
  street: {
    type: [String],
    required: [true, 'Please provide Street'],
  },
});

const garbageSchema = new mongoose.Schema({
  phase: {
    type: Number,
    required: [true, 'Please provide Phase'],
  },
  schedule: [
    {
      day: {
        type: String,
        enum: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        required: [true, 'Please provide Day'],
      },
      timeLocation: [timeLocationSchema],
    },
  ],
});

garbageSchema.index({ phase: 1 }, { unique: true });

garbageSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

garbageSchema.pre('save', function (next) {
  const days = this.schedule.map((s) => s.day);
  const uniqueDays = new Set(days);

  if (days.length !== uniqueDays.size) {
    return next(
      new Error('Duplicate days are not allowed within the same phase'),
    );
  }

  // Check for duplicate streets within each day
  this.schedule.forEach((schedule) => {
    const timeLocations = schedule.timeLocation.map((tl) => ({
      time: tl.time,
      streets: tl.street,
    }));

    // Check for duplicate time entries
    const timeStrings = timeLocations.map((tl) => tl.time);
    const uniqueTimes = new Set(timeStrings);
    if (timeStrings.length !== uniqueTimes.size) {
      return next(
        new Error('Duplicate time entries are not allowed within the same day'),
      );
    }

    const allStreets = schedule.timeLocation.flatMap((tl) => tl.street);
    const uniqueStreets = new Set(allStreets);

    if (allStreets.length !== uniqueStreets.size) {
      return next(
        new Error('Duplicate streets are not allowed within the same day'),
      );
    }
  });

  next();
});

const Garbage = mongoose.model('Garbage', garbageSchema);

module.exports = Garbage;
