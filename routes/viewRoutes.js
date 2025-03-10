const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.use(authController.isLoggedIn);
router.route('/').get(viewController.getIndex);

router.route('/login').get(authController.reRoute, viewController.getLogin);

router
  .route('/me')
  .get(
    authController.protect,
    paymentController.createBookingCheckout,
    viewController.getMe,
  );

router.route('/project').get(viewController.getAllProject);
router.route('/project/:slug').get(viewController.getProject);

module.exports = router;
