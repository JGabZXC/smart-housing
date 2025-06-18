const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'A message must have a message'],
    trim: true,
    minLength: 5,
    maxLength: 100,
  },
  date: {
    type: Date,
    default: () => Date.now(),
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'A message must have an event'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A message must have a user'],
  },
});

// messageSchema.index({ event: 1, user: 1 }, { unique: true }); // Every user should not be limited to message in any event, so i disabled this

messageSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
