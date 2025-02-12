const mongoose = require('mongoose');

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
});

eventSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
