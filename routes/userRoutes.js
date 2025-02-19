const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/login').post(authController.login);

// Below this line, all routes are protected
router.use(authController.protect);
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
  .get(authController.protectTo('admin'), authController.getUser);

module.exports = router;
