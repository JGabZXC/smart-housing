const mongoose = require('mongoose');

const garbageSchema = new mongoose.Schema({
  phase: {
    type: Number,
    required: [true, 'Please provide Phase'],
    unique: true,
  },
  pickUpDay: {
    day: {
      type: String,
      required: [true, 'Please provide Day'],
      unique: true,
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

const Garbage = mongoose.model('Garbage', garbageSchema);

module.exports = Garbage;
