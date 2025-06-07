const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/login').post(authController.login);

// Below this line, all routes are protected
router.use(authController.protect);

router.route('/me/changePassword').patch(userController.changePassword);
router.route('/me/changeDetails').patch(userController.changeDetails);

router
  .route('/signup')
  .post(authController.protectTo('admin'), authController.signup);
router.route('/logout').get(authController.logout);

router
  .route('/')
  .get(authController.protectTo('admin'), authController.getAllUsers);
router
  .route('/:id')
  .patch(authController.protectTo('admin'), authController.updateUser)
  .delete(authController.protectTo('admin'), authController.deleteUser)
  .get(authController.protectTo('admin'), authController.getUser);

module.exports = router;
