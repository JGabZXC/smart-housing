const mongoose = require('mongoose');

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
      },
    ],
  },
});

garbageSchema.index({ phase: 1, 'pickUpDay.day': 1 }, { unique: true });

garbageSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

const Garbage = mongoose.model('Garbage', garbageSchema);

module.exports = Garbage;
