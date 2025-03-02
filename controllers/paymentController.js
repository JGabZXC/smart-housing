const handler = require('./handlerController');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SK);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { amount, dateRange } = req.query;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: req.user.email,
    success_url: `${req.protocol}://${req.get('host')}/api/v1/messages?user=${req.user._id}&address=${req.user.address}&price=${amount}&dateRange=${dateRange}`,
    cancel_url: `${req.protocol}://${req.get('host')}/api/v1/messages`,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'php',
          product_data: {
            name: 'Payment for dues',
            description: `Payment for ${dateRange}`,
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

  await Payment.create({ user, address, amount: price, dateRange });
  next();
});

exports.getAllPayments = handler.getAll(Payment);
exports.getPayment = handler.getOne(Payment);
exports.createPayment = handler.createOne(Payment);
exports.updatePayment = handler.updateOne(Payment);
exports.deletePayment = handler.deleteOne(Payment);
