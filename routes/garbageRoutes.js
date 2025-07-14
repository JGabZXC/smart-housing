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

router
  .route('/schedule/:garbageId')
  .post(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.insertGarbageSchedule,
  );

router
  .route('/schedule/:garbageId/:scheduleId')
  .patch(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.updateGarbageSchedule,
  )
  .post(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.insertGarbageScheduleTimeLocation,
  );
router
  .route('/schedule/:garbageId/:scheduleId/:timelocationId')
  .patch(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.updateGarbageScheduleTimeLocation,
  )
  .delete(
    authController.protect,
    authController.protectTo('admin'),
    garbageController.deleteGarbageScheduleTimeLocation,
  );

module.exports = router;
