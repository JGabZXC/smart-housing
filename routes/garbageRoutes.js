const express = require('express');
const garbageController = require('../controllers/garbageController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(garbageController.getAllGarbages)
  .post(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.createGarbage,
  );

router
  .route('/:id')
  .get(garbageController.getOneGarbage)
  .patch(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.updateGarbage,
  )
  .delete(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.deleteGarbage,
  );

module.exports = router;
