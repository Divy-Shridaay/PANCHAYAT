const { exportData, exportVasulatPatrakData } = require('../controllers/exportData.controller');

const exportDataRouter = require('express').Router();

exportDataRouter.post('/', exportData);
exportDataRouter.post("/vasulat-patrak" , exportVasulatPatrakData)

module.exports = exportDataRouter;
