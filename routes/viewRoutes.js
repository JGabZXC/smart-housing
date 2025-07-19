const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);
router.route('/').get(viewController.getIndex);

router.route('/login').get(authController.reRoute, viewController.getLogin);

router.route('/me').get(authController.protect, viewController.getMe);

router.route('/projects').get(viewController.getAllProject);
router.route('/projects/:slug').get(viewController.getProject);
router.route('/projects/:slug/edit').get(viewController.editProjEvePage);

router.route('/events').get(viewController.getAllEvent);
router.route('/events/:slug').get(viewController.getEvent);
router.route('/events/:slug/edit').get(viewController.editProjEvePage);

// To get the Ids
router
  .route('/api/v1/getIds')
  .post(
    authController.protect,
    authController.protectTo('admin'),
    authController.getIds,
  );

router
  .route('/admin/dashboard')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getAdminDashboard,
  );

router
  .route('/admin/manual-payment')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getPayment,
  );

router
  .route('/admin/yearly-statement')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getYearlyStatement,
  );

router
  .route('/admin/address')
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

router
  .route('/admin/event-bookings')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.acceptEventBookings,
  );

router
  .route('/admin/garbage-collection')
  .get(
    authController.protect,
    authController.protectTo('admin'),
    viewController.getGarbageCollection,
  );

module.exports = router;
