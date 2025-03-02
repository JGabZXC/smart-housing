const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

const router = express.Router({ mergeParams: true });

// Temporary ONLY! Remove this if there's a frontend available
// router.use(authController.protect);
router
  .route('/')
  .get(
    paymentController.createBookingCheckout,
    messageController.getAllMessages,
  )
  .post(
    authController.protectTo('user'),
    messageController.setEventIds,
    messageController.createMessage,
  );
router
  .route('/:id')
  .get(messageController.getMessage)
  .patch(authController.protectTo('user'), messageController.updateMessage)
  .delete(authController.protectTo('user'), messageController.deleteMessage);

module.exports = router;
