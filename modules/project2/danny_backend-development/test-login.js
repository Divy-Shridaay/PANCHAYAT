const mongoose = require("mongoose");
const User = require("./src/adapters/db/UserModel");

require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
    console.log("✅ MongoDB connected");

    // Find user
    const user = await User.findOne({ email: "testuser@example.com" }).select("+password");
    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("✅ User found:", user.email);
    console.log("📦 Stored hash:", user.password);

    // Test compare
    const match = await user.comparePassword("TEST@123");
    console.log("🔐 comparePassword result:", match);

    if (match) {
      console.log("✅ Login would succeed!");
    } else {
      console.log("❌ Login would fail - hash mismatch");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
