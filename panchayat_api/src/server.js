import dotenv from "dotenv";
dotenv.config();
// import defaultCategories from "./utils/defaultCategories.js";

import { connectDB } from "./config/db.js";
import app from "./app.js";
import defaultCategories from "./utils/defaultCategories.js";
import Category from "./models/Category.js";
import User from "./models/User.js";


connectDB().then(async () => {
  await seedDefaultCategories(); // ⭐ IMPORTANT

  // Ensure username index is unique but sparse so null values don't conflict
  try {
    const indexes = await User.collection.indexes();
    const hasUsernameIndex = indexes.some((idx) => idx.name === "username_1");

    if (hasUsernameIndex) {
      try {
        await User.collection.dropIndex("username_1");
        console.log("Dropped existing username_1 index (if it existed)");
      } catch (dropErr) {
        console.log("No username_1 index to drop or drop failed:", dropErr.message);
      }
    }

    await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
    console.log("Ensured username index is unique + sparse");
  } catch (err) {
    console.error("Failed to ensure username index:", err.message);
  }
});


app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
);

const seedDefaultCategories = async () => {
  for (const cat of defaultCategories) {
    await Category.findOneAndUpdate(
      { name: cat.name, type: cat.type },
      { $set: { isDefault: true, isDeleted: false } },
      { upsert: true, new: true }
    );
  }

  console.log("✅ Default categories ensured and protected");
};
