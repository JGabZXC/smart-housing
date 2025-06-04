const mongoose = require('mongoose');

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
      type: String,
      required: [true, 'A payment must have a date range'],
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

function getMonthName(dateRange) {
  // Split the dateRange string into start and end parts
  const [start, end] = dateRange.split('-');

  // Extract month and year from the start part
  const startMonth = parseInt(start.substring(0, 2), 10);
  const startYear = parseInt(start.substring(2), 10);

  // Create a Date object for the start date
  const startDate = new Date(startYear, startMonth - 1); // Months are 0-based in JS

  // Extract month and year from the end part
  const endMonth = parseInt(end.substring(0, 2), 10);
  const endYear = parseInt(end.substring(2), 10);

  // Create a Date object for the end date
  const endDate = new Date(endYear, endMonth - 1); // Months are 0-based in JS

  // Options for formatting the month name
  const options = { month: 'long', year: 'numeric' };

  // Format the dates to display month name and year
  const startMonthName = startDate.toLocaleDateString('en-US', options);
  const endMonthName = endDate.toLocaleDateString('en-US', options);

  return {
    startMonthName,
    endMonthName,
  };
}

paymentSchema.pre(/^find/, async function (next) {
  this.select('-__v');
  next();
});

paymentSchema.virtual('formattedDateRange').get(function () {
  const { startMonthName, endMonthName } = getMonthName(this.dateRange);

  return `${startMonthName} - ${endMonthName}`;
});

// paymentSchema.post(/^find/, (doc) => {
//   if (doc.length > 0) {
//     doc.forEach((docu) => {
//       const { startMonthName, endMonthName } = getMonthName(docu.dateRange);
//       docu.dateRange = `${startMonthName} - ${endMonthName}`;
//     });
//     return;
//   }
//
//   const { startMonthName, endMonthName } = getMonthName(doc.dateRange);
//   doc.dateRange = `${startMonthName} - ${endMonthName}`;
// });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
