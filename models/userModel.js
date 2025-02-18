const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact Number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: 8,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phase: {
      type: Number,
      required: [true, 'Phase is required'],
    },
    street: {
      type: String,
      required: [true, 'Street is required'],
    },
    blk: {
      type: String,
      required: [true, 'Block is required'],
    },
    lot: {
      type: String,
      required: [true, 'Lot is required'],
    },
    payment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],
    eventAttended: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual('completeAddress').get(function () {
  return `Phase ${this.phase}, ${this.street}, Blk ${this.blk}, Lot ${this.lot}`;
});

userSchema.pre(/^find/, function (next) {
  this.select('-__v -password');
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
