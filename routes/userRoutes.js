const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.getAllUsers);
router
  .route('/:id')
  .patch(authController.updateUser)
  .get(authController.getUser);

router.route('/signup').post(authController.signup);

module.exports = router;
