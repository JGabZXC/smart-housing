const express = require('express');
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(eventController.getAllEvents)
  .post(
    authController.protect,
    authController.protectTo('admin'),
    eventController.createEvent,
  );

router
  .route('/:id')
  .get(eventController.getEvent)
  .patch(
    authController.protect,
    authController.protectTo('admin'),
    eventController.updateEvent,
  )
  .delete(
    authController.protect,
    authController.protectTo('admin'),
    eventController.deleteEvent,
  );

module.exports = router;
