const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const User = require("../../db/UserModel");
const Role = require("../../db/RoleModels");
const { asyncHandler } = require("tranxpress");

const authJWT = asyncHandler(async (req, res, next) => {
  let token =
  req.cookies.accessToken ||
  req.headers.authorization?.split(" ")[1] ||
  req.query.token;
  
  console.log('token' , token);


  if (!token) {
    return res.status(401).json({ message: "Unauthorized1", status: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.id;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", status: false });
  }
});

module.exports = authJWT;
