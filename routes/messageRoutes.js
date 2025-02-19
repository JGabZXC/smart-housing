const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(messageController.getAllMessages)
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
