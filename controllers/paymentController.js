const stripe = require('stripe')(process.env.STRIPE_SK);
const handler = require('./handlerController');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const House = require('../models/houseModel');
const APIFeatures = require('../utils/apiFeatures');
const PaymentManager = require('../utils/paymentManager');

const insertPayment = async function (session) {
  const fromDate = new Date(session.metadata.dateRange.split('TO')[0]);
  const toDate = new Date(session.metadata.dateRange.split('TO')[1]);
  const user = await User.findById(session.client_reference_id).populate(
    'address',
  );
  const paymentManager = new PaymentManager.CreatePayment({
    modelInstance: Payment,
    user,
    fromDate,
    toDate,
    stripeSessionId: session.id,
    paymentIntentId: session.payment_intent,
    type: 'stripe',
  });

  await paymentManager.addPaymentDate(session.amount_total / 100);
};

exports.getAllPayments = catchAsync(async (req, res, next) => {
  let filter = {};
  let user;
  const { phase, block, lot } = req.query;

  if ((phase && block && lot) || req.query.email) {
    if (phase && block && lot) {
      const house = await House.findOne({
        phase: +phase,
        block: +block,
        lot: +lot,
      });
      filter = { address: house._id };
      user = await User.findOne(filter);
    } else if (req.query.email) {
      user = await User.findOne({ email: req.query.email });
      if (!user)
        return next(new AppError('No user found with that email address', 404));
      filter = { user: user._id };
    } else {
      return next(
        new AppError('No house or user found with provided details', 404),
      );
    }

    if (req.query.fromDate && req.query.toDate) {
      const fromDate = new Date(req.query.fromDate);
      const toDate = new Date(req.query.toDate);
      filter = {
        ...filter,
        'dateRange.from': { $gte: fromDate },
        'dateRange.to': { $lte: toDate },
      };
    }
  }

  const features = new APIFeatures(Payment.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [doc, totalPayments] = await Promise.all([
    features.query.populate({
      path: 'user',
    }),
    Payment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPayments / (req.query.limit || 10));

  res.status(200).json({
    status: 'success',
    results: doc.length,
    totalPages,
    data: {
      doc,
      email: user ? user.email : null,
    },
  });
});
exports.getPayment = handler.getOne(Payment);
exports.createPayment = catchAsync(async (req, res, next) => {
  const { email, amount, fromDate, toDate, or } = req.body;

  const convertedFromDate = new Date(fromDate);
  const convertedToDate = new Date(toDate);

  if (Number.isNaN(convertedFromDate) || Number.isNaN(convertedToDate))
    return next(new AppError('Invalid date format', 400));

  const calcMonths = PaymentManager.calculateFullMonths(
    convertedFromDate,
    convertedToDate,
  );

  if (!calcMonths.isValid)
    return next(
      new AppError(
        'Only full months are allowed (1 month, 2 months, 3 months, etc.). No partial months permitted.',
        400,
      ),
    );

  const convertedFromDateFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(convertedFromDate);
  const convertedToDateFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(convertedToDate);

  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('No user found with that email address', 404));
  const paymentManager = new PaymentManager.CreatePayment({
    modelInstance: Payment,
    user,
    fromDate: convertedFromDateFormat,
    toDate: convertedToDateFormat,
    type: 'manual',
    or,
  });

  try {
    await PaymentManager.validatePaymentPeriod(paymentManager, amount);
  } catch (err) {
    return next(new AppError(err.message, 400));
  }

  const payment = await paymentManager.addPaymentDate(amount);

  res.status(201).json({
    status: 'success',
    data: {
      payment,
    },
  });
});
exports.updatePayment = handler.updateOne(Payment);
exports.deletePayment = handler.deleteOne(Payment);

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { fromDate, toDate } = req.body;

  const convertedFromDate = new Date(fromDate);
  const convertedToDate = new Date(toDate);

  if (Number.isNaN(convertedFromDate) || Number.isNaN(convertedToDate))
    return next(new AppError('Invalid date format', 400));

  const calcMonths = PaymentManager.calculateFullMonths(
    convertedFromDate,
    convertedToDate,
  );

  if (!calcMonths.isValid)
    return next(
      new AppError(
        'Only full months are allowed (1 month, 2 months, 3 months, etc.). No partial months permitted.',
        400,
      ),
    );

  const convertedFromDateFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(convertedFromDate);
  const convertedToDateFormat = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(convertedToDate);

  const paymentManager = new PaymentManager.CreatePayment({
    modelInstance: Payment,
    user: req.user,
    fromDate: convertedFromDate,
    toDate: convertedToDate,
    type: 'stripe',
  });

  try {
    const paymentAmount = calcMonths.months * 100; // Assuming 100 PHP per month
    await PaymentManager.validatePaymentPeriod(paymentManager, paymentAmount);
  } catch (err) {
    return next(new AppError(err.message, 400));
  }

  const dateRange = `${convertedFromDateFormat}TO${convertedToDateFormat}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    client_reference_id: String(req.user._id),
    customer_email: req.user.email,
    success_url: `${req.protocol}://${req.get('host')}/me`,
    cancel_url: `${req.protocol}://${req.get('host')}/me`,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'php',
          product_data: {
            name: 'Payment for dues',
            description: `Payment for ${convertedFromDateFormat} to ${convertedToDateFormat}. Do not forget to screenshot the payment confirmation.`,
          },
          unit_amount:
            calcMonths.months *
            100 * // Assuming 100 PHP per month
            100, // Convert to pesos (PHP)
        },
        quantity: 1,
      },
    ],
    metadata: {
      dateRange,
    },
  });

  res.status(200).json({
    status: 'success',
    session_id: session.id,
    session,
  });
});
exports.getPaymentStatement = catchAsync(async (req, res, next) => {
  const year = parseInt(req.params.year, 10);
  const { id } = req.query;

  const futureYear = new Date().getFullYear() + 5;

  // Validate year parameter
  if (!year || year < 2025 || year > futureYear) {
    return next(
      new AppError(`Please provide a valid year (2025-${futureYear})`, 400),
    );
  }

  let targetUser = req.user;

  // If admin, allow querying other users via query parameters
  if (req.user.role === 'admin') {
    if (id) {
      targetUser = await User.findOne({ $or: [{ _id: id }, { address: id }] });
      if (!targetUser) {
        return next(new AppError('No user found with that ID', 404));
      }
    }
  }

  // Get all payments for the user in the specified year
  const yearStart = new Date(year, 0, 1); // January 1st
  const yearEnd = new Date(year + 1, 0, 1); // January 1st of next year

  const payments = await Payment.find({
    user: targetUser._id,
    $or: [
      {
        // Payments that start in this year
        'dateRange.from': {
          $gte: yearStart,
          $lt: yearEnd,
        },
      },
      {
        // Payments that end in this year
        'dateRange.to': {
          $gte: yearStart,
          $lt: yearEnd,
        },
      },
      {
        // Payments that span across this year
        'dateRange.from': { $lt: yearStart },
        'dateRange.to': { $gte: yearEnd },
      },
    ],
  }).sort({ paymentDate: 1 });

  // Generate monthly statement
  const statement = PaymentManager.generateMonthlyStatement(payments, year);

  // Get available years
  const availableYears = PaymentManager.getAvailableYears();

  res.status(200).json({
    status: 'success',
    data: {
      statement,
      availableYears,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
      },
    },
  });
});

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret =
    process.env.NODE_ENV === 'development'
      ? process.env.STRIPE_WEBHOOK_SECRET_DEV
      : process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // Stripe will be the one who will get this error, not our server.
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log(session);
    // Insert the payment into the database
    insertPayment(session);
  }

  res.status(200).json({ received: true });
});
