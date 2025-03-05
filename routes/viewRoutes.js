const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);
router.route('/').get(viewController.getIndex);

router.route('/login').get(authController.reRoute, viewController.getLogin);

router.route('/project/:slug').get(viewController.getProject);

module.exports = router;
