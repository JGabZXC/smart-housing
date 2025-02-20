const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');
const messageRoute = require('./messageRoutes');

const router = express.Router();

router.use('/:projectId/messages', messageRoute);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(
    authController.protect,
    authController.protectTo('admin'),
    projectController.createProject,
  );

router
  .route('/:id')
  .get(projectController.getProject)
  .patch(
    authController.protect,
    authController.protectTo('admin'),
    projectController.updateProject,
  )
  .delete(
    authController.protect,
    authController.protectTo('admin'),
    projectController.deleteProject,
  );

module.exports = router;
