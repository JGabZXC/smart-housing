const handler = require('./handlerController');
const Project = require('../models/projectModel');

exports.setProjectUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.event) req.body.event = req.params.projectId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllProjects = handler.getAll(Project);
exports.getProject = handler.getOne(Project);
exports.createProject = handler.createOne(Project);
exports.updateProject = handler.updateOne(Project);
exports.deleteProject = handler.deleteOne(Project);
