const express = require('express');
const s3ImageController = require('../controllers/s3ImageController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/getFeaturedCover/project')
  .get(s3ImageController.getFeaturedCover('project'));

router
  .route('/getFeaturedCover/event')
  .get(s3ImageController.getFeaturedCover('event'));

router
  .route('/getImages/project/:slug')
  .get(s3ImageController.getImages('project'));

router.use(authController.protect);
router.use(authController.protectTo('admin'));
router.route('/').get(s3ImageController.getAllImages);

module.exports = router;
