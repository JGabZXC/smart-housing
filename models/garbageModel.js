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

// Check for existing day in phase
garbageSchema.pre('save', async function (next) {
  const checkExistingDay = await mongoose.model('Garbage').find({
    phase: this.phase,
    'pickUpDay.day': this.pickUpDay.day,
  });

  if (checkExistingDay.length >= 1)
    return next(
      new AppError(
        `The day ${this.pickUpDay.day} already exists for phase ${this.phase}`,
        400,
      ),
    );

  next();
});
garbageSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const query = this.getQuery();

  const garbage = await mongoose.model('Garbage').findById(query._id);
  const checkExistingDay = await mongoose.model('Garbage').find({
    phase: garbage.phase,
    'pickUpDay.day': update.pickUpDay.day,
  });

  if (checkExistingDay.length >= 1)
    return next(
      new AppError(
        `The day ${update.pickUpDay.day} already exists for phase ${garbage.phase}`,
        400,
      ),
    );

  next();
});

const Garbage = mongoose.model('Garbage', garbageSchema);

module.exports = Garbage;
