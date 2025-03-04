const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.isLoggedIn);
router.route('/').get(viewController.getIndex);

router.route('/login').get(viewController.getLogin);

// Fix this later!
router.route('/api/v1/getImage').get(viewController.getImage);

module.exports = router;
