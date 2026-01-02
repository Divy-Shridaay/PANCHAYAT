const { getCurrentUser } = require("../controllers/currentUser.controller");
const currentUserRouter = require("express").Router();

currentUserRouter.get("/", getCurrentUser);

module.exports = currentUserRouter;
