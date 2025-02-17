const express = require('express');
const garbageController = require('../controllers/garbageController');

const router = express.Router();

router
  .route('/')
  .get(garbageController.getAllGarbages)
  .post(garbageController.createGarbage);

router
  .route('/:id')
  .get(garbageController.getOneGarbage)
  .patch(garbageController.updateGarbage)
  .delete(garbageController.deleteGarbage);

module.exports = router;
