const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const houseSchema = mongoose.Schema(
  {
    phase: {
      type: Number,
      required: [true, 'A house must have a phase'],
    },
    block: {
      type: Number,
      required: [true, 'A house must have a block'],
    },
    lot: {
      type: Number,
      required: [true, 'A house must have a lot'],
    },
    street: {
      type: String,
      required: [true, 'A house must have a street'],
    },
    status: {
      type: String,
      enum: ['occupied', 'unoccupied', 'maintenance'],
      default: 'unoccupied',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

houseSchema.virtual('completeAddress').get(function () {
  return `Phase ${this.phase}, Blk ${this.block}, Lot ${this.lot}, Street ${this.street}`;
});

houseSchema.pre('save', async function (next) {
  const house = await mongoose.model('House').findOne({
    phase: this.phase,
    block: this.block,
    lot: this.lot,
    street: this.street,
  });

  if (house)
    return next(new AppError('House already exists or under maintenance', 400));

  next();
});

houseSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const updateId = this.getQuery()._id;
  if (update.phase || update.block || update.lot || update.street) {
    const house = await mongoose.model('House').findOne({
      phase: update.phase,
      block: update.block,
      lot: update.lot,
      street: update.street,
    });

    if (house && updateId !== house._id.toString())
      return next(
        new AppError('House already exists or under maintenance', 400),
      );
  }
  next();
});

houseSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

const House = mongoose.model('House', houseSchema);

module.exports = House;
