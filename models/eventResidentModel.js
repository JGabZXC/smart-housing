const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const eventResidentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'An event must have a data'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  place: String,
  approved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

eventResidentSchema.pre('save', async function (next) {
  const newEvent = this;

  const existingEvent = await mongoose.model('EventResident').findOne({
    place: newEvent.place,
    date: {
      $gte: new Date(
        newEvent.date.getFullYear(),
        newEvent.date.getMonth(),
        newEvent.date.getDate(),
      ),
      $lt: new Date(
        newEvent.date.getFullYear(),
        newEvent.date.getMonth(),
        newEvent.date.getDate() + 1,
      ),
    },
  });

  // If an event exists on the same date and place, throw an error
  if (existingEvent) {
    return next(
      new AppError(
        `An event is already booked on ${existingEvent.date.toDateString()} at ${existingEvent.place}`,
        401,
      ),
    );
  }

  // No conflict, proceed with saving
  next();
});

const EventResident = mongoose.model('EventResident', eventResidentSchema);

module.exports = EventResident;
