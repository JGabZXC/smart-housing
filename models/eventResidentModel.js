const mongoose = require('mongoose');

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
});

const EventResident = mongoose.model('EventResident', eventResidentSchema);

module.exports = EventResident;
