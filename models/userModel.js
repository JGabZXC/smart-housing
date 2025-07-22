const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const House = require('./houseModel');

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
    validTokenDate: {
      type: Date,
      default: new Date(),
    },
    passwordChangedAt: Date,
    secretQuestion: String,
    secretAnswer: String,
    resetToken: String,
    resetTokenExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre(/^find/, function (next) {
  this.populate('address');
  next();
});

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

// House Checker
// userSchema.pre('save', async function (next) {
// await validateHouse(this.address);
//
//   next();
// });

userSchema.post('save', async function () {
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

userSchema.methods.hashSecretAnswer = async function (answer) {
  return await bcrypt.hash(answer, 12);
};

userSchema.methods.isCorrectSecretAnswer = async function (
  candidateAnswer,
  userAnswer,
) {
  return await bcrypt.compare(candidateAnswer, userAnswer);
};

// Password Change Checker
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    console.log(JWTTimeStamp, (changeTimeStamp + 1));
    console.log(JWTTimeStamp < (changeTimeStamp + 1));
    return JWTTimeStamp < (changeTimeStamp + 1);
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
