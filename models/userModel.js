const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const House = require('./houseModel');
const validateHouse = require('../utils/validateHouse');

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
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Confirm Password is required'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    address: {
      type: mongoose.Schema.ObjectId,
      ref: 'House',
      required: [true, 'Address is required'],
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
    validTokenDate: {
      type: Date,
      default: new Date(),
    },
    passwordChangedAt: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

// House Checker
userSchema.pre('save', async function (next) {
  await validateHouse(this.address);

  next();
});

userSchema.post('save', async function (next) {
  const house = await House.findOne(this.address);

  await House.updateOne({ _id: house._id }, { status: 'occupied' }); // Update house status to occupied
});

// Password Checker
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Password Change Checker
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimeStamp < changeTimeStamp;
  }

  return false;
};

// Token Checker
userSchema.methods.isTokenLatest = function (tokenDate) {
  if (this.validTokenDate) {
    const tokenTimeStamp = Math.floor(this.validTokenDate.getTime() / 1000);

    return tokenDate < tokenTimeStamp;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
