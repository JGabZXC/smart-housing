const express = require('express');
const authController = require('../controllers/authController');
const eventResidentController = require('../controllers/eventResidentController');

const router = express.Router();

router.use(authController.protect);

router.route('/myevent').get(eventResidentController.getResidentEvents);

router
  .route('/')
  .get(authController.protectTo('admin'), eventResidentController.getAllEvents)
  .post(eventResidentController.createEvent);

router
  .route('/:id')
  .get(eventResidentController.getEvent)
  .patch(eventResidentController.updateEvent)
  .delete(eventResidentController.deleteEvent);

module.exports = router;
