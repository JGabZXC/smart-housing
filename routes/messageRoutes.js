const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/message').get(messageController.getAllMessages);

router.use(authController.protect);
router.route('/').get(messageController.getAllMessages).post(
  // authController.protectTo('user'),
  messageController.setEventIds,
  messageController.createMessage,
);
router
  .route('/:id')
  .get(messageController.getMessage)
  .patch(messageController.updateMessage)
  .delete(messageController.deleteMessage);

module.exports = router;
