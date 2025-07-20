const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/payment-session',
  authController.protect,
  paymentController.createCheckoutSession,
);

router.get(
  '/statement/:year',
  authController.protect,
  paymentController.getPaymentStatement,
);

router.get(
  '/yearly-statement/:year',
  authController.protect,
  paymentController.getYearlyStatement,
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

module.exports = router;
