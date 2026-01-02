const { getLandReport } = require('../controllers/landReport.controller');

const landReportRouter = require('express').Router();

landReportRouter.get('/', getLandReport);

module.exports = landReportRouter;