const { getEducationReport } = require('../controllers/educationReport.controller');

const educationReportRouter = require('express').Router();

educationReportRouter.get('/', getEducationReport);

module.exports = educationReportRouter;