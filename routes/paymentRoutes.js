const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');
const Payment = require('../models/paymentModel');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/payment-session',
  authController.protect,
  paymentController.createCheckoutSession,
);

router.use(authController.protectTo('admin'));
router
  .route('/')
  .get(paymentController.getAllPayments)
  .post(paymentController.createPayment);

router
  .route('/:id')
  .get(paymentController.getPayment)
  .patch(paymentController.updatePayment)
  .delete(paymentController.deletePayment);

router.route('/test/test').get(async (req, res) => {
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 30 days later
  // const fromDate = new Date('2025-06-04'); // 30 days later
  // const toDate = new Date('2025-08-04'); // 30 days later

  console.log(fromDate);

  const doc = await Payment.find({
    'dateRange.from': { $gte: fromDate },
    'dateRange.to': { $lte: toDate },
  });
  res.status(200).json({
    status: 'success',
    doc,
  });
});

module.exports = router;
