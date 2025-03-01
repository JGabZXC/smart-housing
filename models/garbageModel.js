const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const garbageSchema = new mongoose.Schema({
  phase: {
    type: Number,
    required: [true, 'Please provide Phase'],
  },
  pickUpDay: {
    day: {
      type: String,
      required: [true, 'Please provide Day'],
    },
    timeLocation: [
      {
        time: {
          type: String,
          required: [true, 'Please provide Time'],
        },
        street: {
          type: String,
          required: [true, 'Please provide Street'],
        },
        _id: false,
      },
    ],
  },
});

garbageSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

garbageSchema.pre('save', async function (next) {
  const checkExistingDay = await mongoose.model('Garbage').findOne({
    phase: this.phase,
    'pickUpDay.day': this.pickUpDay.day,
  });

  if (checkExistingDay) {
    return next(
      new AppError(
        `Day ${this.pickUpDay.day} already exists for Phase ${this.phase}`,
        400,
      ),
    );
  }
  next();
});

const Garbage = mongoose.model('Garbage', garbageSchema);

module.exports = Garbage;
