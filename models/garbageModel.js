const mongoose = require('mongoose');

const timeLocationSchema = new mongoose.Schema({
  time: {
    type: String,
    required: [true, 'Please provide Time'],
  },
  street: {
    type: String,
    required: [true, 'Please provide Street'],
  },
});

const garbageSchema = new mongoose.Schema({
  phase: {
    type: Number,
    required: [true, 'Please provide Phase'],
  },
  day: {
    type: String,
    required: [true, 'Please provide Day'],
  },
  timeLocation: [timeLocationSchema],
});

garbageSchema.index({ phase: 1, day: 1 }, { unique: true });

garbageSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

const Garbage = mongoose.model('Garbage', garbageSchema);

module.exports = Garbage;
