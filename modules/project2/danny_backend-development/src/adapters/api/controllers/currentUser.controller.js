const { asyncHandler } = require("tranxpress");
const User = require("../../db/UserModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");

exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user).populate("role");
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json(new SuccessResponse(user, "Fetched current user"));
});
