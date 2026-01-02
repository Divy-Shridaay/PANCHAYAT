const { getMainReport } = require('../controllers/mainReport.controller');

const mainReportRouter = require('express').Router();

mainReportRouter.get('/', getMainReport);

module.exports = mainReportRouter;