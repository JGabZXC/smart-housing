const mongoose = require('mongoose');
const PaymentManager = require('../utils/paymentManager');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A payment must belong to a user'],
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: [true, 'A payment must have an address'],
    },
    amount: {
      type: Number,
      required: [true, 'A payment must have an amount'],
    },
    dateRange: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },
    paymentDate: {
      type: Date,
      default: () => Date.now(),
    },
    stripeSessionId: String,
    paymentIntentId: String,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'manual'],
      default: 'stripe',
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

paymentSchema.pre(/^find/, async function (next) {
  this.select('-__v');
  next();
});

paymentSchema.virtual('formattedDateRange').get(function () {
  const { startMonthName, endMonthName } = PaymentManager.getMonthName(
    this.dateRange,
  );

  return `${startMonthName} - ${endMonthName}`;
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
