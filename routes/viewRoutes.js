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
router.route('/project/:slug/edit').get(viewController.editProjEvePage);

router.route('/event').get(viewController.getAllEvent);
router.route('/event/:slug').get(viewController.getEvent);
router.route('/event/:slug/edit').get(viewController.editProjEvePage);

// To get the Ids
router
  .route('/api/v1/getIds')
  .post(
    authController.protect,
    authController.protectTo('admin'),
    authController.getIds,
  );

router
  .route('/admin')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getAdminDashboard,
  );

router
  .route('/payment')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getPayment,
  );

router
  .route('/address')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getAddress,
  );

router
  .route('/admin/signup')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getCreateResident,
  );

router
  .route('/admin/update/resident')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getUpdateResident,
  );

module.exports = router;
