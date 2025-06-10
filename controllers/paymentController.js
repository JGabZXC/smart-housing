const stripe = require('stripe')(process.env.STRIPE_SK);
const handler = require('./handlerController');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const PaymentManager = require('../utils/paymentManager');

const insertPayment = async function (session) {
  const fromDate = new Date(session.metadata.dateRange.split('TO')[0]);
  const toDate = new Date(session.metadata.dateRange.split('TO')[1]);
  const user = await User.findById(session.client_reference_id).populate(
    'address',
  );
  console.log(session);
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

  if (req.query.email) {
    user = await User.findOne({ email: req.query.email });
    if (!user)
      return next(new AppError('No user found with that email address', 404));
    filter = { user: user._id };
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
      path: 'user'
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
    },
  });
});
exports.getPayment = handler.getOne(Payment);
exports.createPayment = catchAsync(async (req, res, next) => {
  const { email, amount, fromDate, toDate } = req.body;

  if (!email) return next(new AppError('Please provide an email address', 400));

  if (!+amount || +amount === 0)
    return next(new AppError('Please provide an amount', 400));

  if (!fromDate || !toDate)
    return next(new AppError('Please provide date', 400));

  const { start: newFromDate, end: newToDate } = PaymentManager.normalizeDates(
    fromDate,
    toDate,
  );

  if (Number.isNaN(newFromDate) || Number.isNaN(newToDate))
    return next(new AppError('Invalid date format', 400));

  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('No user found with that email address', 404));
  const paymentManager = new PaymentManager.CreatePayment({
    modelInstance: Payment,
    user,
    fromDate: newFromDate,
    toDate: newToDate,
    type: 'manual',
  });

  try {
    await PaymentManager.validatePaymentPeriod(paymentManager);
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

  if (!fromDate || !toDate)
    return next(new AppError('Please provide date', 400));

  const { start: newFromDate, end: newToDate } = PaymentManager.normalizeDates(
    fromDate,
    toDate,
  );

  if (Number.isNaN(newFromDate) || Number.isNaN(newToDate))
    return next(new AppError('Invalid date format', 400));

  const convertedFromDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(newFromDate);
  const convertedToDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(newToDate);

  const paymentManager = new PaymentManager.CreatePayment({
    modelInstance: Payment,
    user: req.user,
    fromDate: newFromDate,
    toDate: newToDate,
    type: 'stripe',
  });

  try {
    await PaymentManager.validatePaymentPeriod(paymentManager);
  } catch (err) {
    return next(new AppError(err.message, 400));
  }

  const dateRange = `${convertedFromDate}TO${convertedToDate}`;

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
            description: `Payment for ${convertedFromDate} to ${convertedToDate}. Do not forget to screenshot the payment confirmation.`,
          },
          unit_amount:
            PaymentManager.getNumberOfMonths(newFromDate, newToDate) *
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
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // Stripe will be the one who will get this error, not our server.
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Insert the payment into the database
    insertPayment(session);
  }

  res.status(200).json({ received: true });
});
