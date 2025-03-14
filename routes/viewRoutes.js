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

router.route('/event').get(viewController.getAllEvent);
// router.route('/event/:slug').get(viewController.getEvent);

router
  .route('/admin')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getAdminDashboard,
  );

module.exports = router;
