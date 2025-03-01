const express = require('express');
const authController = require('../controllers/authController');
const houseController = require('../controllers/houseController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.protectTo('admin'));
router
  .route('/')
  .get(houseController.getAllHouses)
  .post(houseController.createHouse);

router
  .route('/:id')
  .get(houseController.getHouse)
  .patch(houseController.updateHouse)
  .delete(houseController.deleteHouse);

module.exports = router;
