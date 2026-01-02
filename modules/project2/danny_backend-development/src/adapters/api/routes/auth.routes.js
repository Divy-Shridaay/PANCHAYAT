const { login, changePassword } = require('../controllers/auth.controller');
const authJWT = require('../middlewares/authJWT');

const authRouter = require('express').Router();

authRouter.post('/login', login);
authRouter.post('/change-password', authJWT , changePassword );

module.exports = authRouter;