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

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { amount, dateRange } = req.query;

  const { overlaps } = await isDateRangeAlreadyPaid(
    req.user._id,
    req.user.address,
    dateRange,
  );

  if (overlaps)
    return next(new AppError(`Payment for ${dateRange} already exists`, 400));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: req.user.email,
    success_url: `${req.protocol}://${req.get('host')}/me?user=${req.user._id}&address=${req.user.address}&price=${amount}&dateRange=${dateRange}`,
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
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({ status: 'success', session });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { user, address, price, dateRange } = req.query;

  if (!user && !address && !price && !dateRange) return next();
  await Payment.create({
    user: req.user._id,
    address: req.user.address,
    amount: price,
    dateRange,
  });

  res.redirect(req.originalUrl.split('?')[0]);
});

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

  console.log(amount);

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

  console.log(paymentMod)

  res.status(201).json({
    status: 'success',
    data: {
      payment: paymentMod,
    },
  });
});
exports.updatePayment = handler.updateOne(Payment);
exports.deletePayment = handler.deleteOne(Payment);
