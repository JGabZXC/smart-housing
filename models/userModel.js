const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

userSchema.virtual('completeAddress').get(function () {
  return `Phase ${this.phase}, ${this.street}, Blk ${this.blk}, Lot ${this.lot}`;
});

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

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimeStamp < changeTimeStamp;
  }

  return false;
};

userSchema.methods.isTokenLatest = function (tokenDate) {
  if (this.validTokenDate) {
    const tokenTimeStamp = Math.floor(this.validTokenDate.getTime() / 1000);

    return tokenDate < tokenTimeStamp;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
