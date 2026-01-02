const { getLocalFundReport } = require('../controllers/localFundReport.controller');

const localFundReportRouter = require('express').Router();

localFundReportRouter.get('/', getLocalFundReport);

module.exports = localFundReportRouter;