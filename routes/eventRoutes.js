const express = require('express');
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const messageRoute = require('./messageRoutes');

const router = express.Router();

router.use('/:eventId/messages', messageRoute);

router
  .route('/')
  .get(eventController.getAllEvents)
  .post(
    authController.protect,
    authController.protectTo('admin'),
    eventController.uploadEventImages,
    eventController.createEvent,
  );

router
  .route('/:id')
  .get(eventController.getEvent)
  .patch(
    authController.protect,
    authController.protectTo('admin'),
    eventController.uploadEventImages,
    eventController.updateEvent,
  )
  .delete(
    authController.protect,
    authController.protectTo('admin'),
    eventController.deleteEvent,
  );

router
  .route('/:id/attend')
  .post(authController.protect, eventController.attendEvent);

module.exports = router;
