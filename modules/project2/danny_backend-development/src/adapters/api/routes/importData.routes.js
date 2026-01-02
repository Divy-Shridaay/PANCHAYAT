// routes/importData.route.js
const { importData } = require('../controllers/importData.controller');
const importDataRouter = require('express').Router();

importDataRouter.post('/', importData);

module.exports = importDataRouter;
