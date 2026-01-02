const { asyncHandler } = require("tranxpress");
const User = require("../../db/UserModel");
const SuccessResponse = require("../../../domain/Responses/SuccessResponse");
const CustomError = require("../../../domain/CustomError");

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate user credentials
  if (!email || !password) {
    throw new CustomError("Please provide email and password", 400);
  }

  // Find user
  const user = await User.findOne({ email }).select("+password");
  // console.log(user);

  if (!user) {
    throw new CustomError("Incorrect Credentials", 401);
  }
  // ⬇️ ADD THIS DEBUG CODE HERE
  console.log("Entered:", password);
  console.log("Stored:", user.password);
  console.log("Match:", await user.comparePassword(password));
  // ⬆️ ADD THIS
  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new CustomError("Incorrect Credentials", 401);
  }

  // Generate token
  const { accessToken, refreshToken } = await user.generateToken();

  console.log("accessToken" , accessToken);
  console.log("refreshToken" , refreshToken);
   

  res.cookie("accessToken", accessToken, { httpOnly: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true });

  res
    .status(200)
    .json(
      new SuccessResponse({ accessToken, refreshToken }, "Login successful")
    );
});


exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // 1️⃣ Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new CustomError("All password fields are required", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new CustomError("New password and confirmation do not match", 400);
  }

  // 2️⃣ Get user ID from JWT middleware
  const userId = req.user;
  if (!userId) {
    throw new CustomError("Unauthorized request", 401);
  }

  // 3️⃣ Find user
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  // 4️⃣ Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new CustomError("Current password is incorrect", 401);
  }

  // 5️⃣ Prevent reusing old password
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    throw new CustomError("New password cannot be the same as the old one", 400);
  }

  // 6️⃣ Update password
  user.password = newPassword;
  await user.save();

  // 7️⃣ Respond success
  res
    .status(200)
    .json(new SuccessResponse(null, "Password changed successfully"));
});
