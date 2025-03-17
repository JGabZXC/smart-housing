const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A payment must belong to a user'],
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: [true, 'A payment must have an address'],
  },
  amount: {
    type: Number,
    required: [true, 'A payment must have an amount'],
  },
  dateRange: {
    type: String,
    required: [true, 'A payment must have a date range'],
  },
  paymentDate: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
