const stripe = require('stripe')(process.env.STRIPE_SK);
const handler = require('./handlerController');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const APIFeautres = require('../utils/apiFeatures');

const isDateRangeAlreadyPaid = async function (userId, addressId, dateRange) {
  const [startMonth, endMonth] = dateRange.split('-');

  const existingPayments = await Payment.find({
    user: userId,
    address: addressId,
  });

  const overlappingPayment = existingPayments.find((payment) => {
    const [paidStart, paidEnd] = payment.dateRange.split('-');

    return (
      +startMonth === +paidStart ||
      +startMonth === +paidEnd ||
      +endMonth === +paidEnd ||
      +endMonth === +paidStart
    );
  });

  return overlappingPayment
    ? { overlaps: true, payment: overlappingPayment }
    : { overlaps: false };
};

const insertPayment = async function (session) {
  await Payment.create({
    user: session.client_reference_id,
    address: session.metadata.address,
    amount: session.amount_total / 100, // Convert from cents to PHP
    dateRange: session.metadata.dateRange,
    stripeSessionId: session.id,
    paymentIntentId: session.payment_intent,
    paymentMethodStripe: session.payment_method,
    paid: true,
  });
};

exports.getAllPayments = catchAsync(async (req, res, next) => {
  let filter = {};
  let user;

  if (req.query.email) {
    user = await User.findOne({ email: req.query.email });
    if (!user)
      return next(new AppError('No user found with that email address', 404));
    filter = { user: user._id };
  }

  const features = new APIFeautres(Payment.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const payments = await features.query
    .populate({
      path: 'user',
      select: 'email name',
    })
    .populate('address');

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      doc: payments,
    },
  });
});
exports.getPayment = handler.getOne(Payment);
// exports.createPayment = handler.createOne(Payment);
exports.createPayment = catchAsync(async (req, res, next) => {
  // const payment = await Payment.create(req.body);
  const { email, amount, dateRange } = req.body;

  if (!email) return next(new AppError('Please provide an email address', 400));

  if (!+amount || +amount === 0)
    return next(new AppError('Please provide an amount', 400));

  if (!amount || !dateRange)
    return next(new AppError('Please provide an amount and date range', 400));

  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError('No user found with that email address', 404));

  const { overlaps } = await isDateRangeAlreadyPaid(
    user._id,
    user.address,
    dateRange,
  );

  if (overlaps)
    return next(new AppError(`Payment for ${dateRange} already exists`, 400));

  const paymentMod = await Payment.create({
    user: user._id,
    address: user.address,
    amount,
    dateRange,
  });

  res.status(201).json({
    status: 'success',
    data: {
      payment: paymentMod,
    },
  });
});
exports.updatePayment = handler.updateOne(Payment);
exports.deletePayment = handler.deleteOne(Payment);

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { dateRange } = req.body;

  if (!dateRange)
    return next(new AppError('Please provide amount and date range', 400));

  // format(MMYYYY-MMYYYY)
  const [start, end] = dateRange.split('-');
  const startMonth = parseInt(start.substring(0, 2), 10);
  const startYear = parseInt(start.substring(2), 10);
  const endMonth = parseInt(end.substring(0, 2), 10);
  const endYear = parseInt(end.substring(2), 10);

  const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

  if (months <= 0) return next(new AppError('Invalid date range', 400));
  //  012020-012020 will still proceed, so it needs to be 012020-022020 to be accepted
  if (months <= 1)
    return next(new AppError('Date range must cover at least 2 months', 400));

  const amount = months * 100; // Assuming 100 PHP per month

  const { overlaps } = await isDateRangeAlreadyPaid(
    req.user._id,
    req.user.address,
    dateRange,
  );

  if (overlaps)
    return next(new AppError(`Payment for ${dateRange} already exists`, 400));

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
            description: `Payment for ${dateRange}. Do not forget to screenshot the payment confirmation.`,
          },
          unit_amount: amount * 100, // Convert to pesos (PHP)
        },
        quantity: 1,
      },
    ],
    metadata: {
      dateRange,
      address: String(req.user.address),
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
    // Stripe will be the one who will get this error, not the our server.
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Insert the payment into the database
    insertPayment(session);
  }

  res.status(200).json({ received: true });
});
