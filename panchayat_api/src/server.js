import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import app from "./app.js";
import defaultCategories from "./utils/defaultCategories.js";
import Category from "./models/Category.js";


connectDB().then(async () => {
  await seedDefaultCategories(); // ⭐ IMPORTANT
});


app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
);

const seedDefaultCategories = async () => {
  for (const cat of defaultCategories) {
    const exists = await Category.findOne({
      name: cat.name,
      type: cat.type,
    });

    if (!exists) {
      await Category.create({
        name: cat.name,
        type: cat.type,
      });
    }
  }

  console.log("✅ Default categories ensured");
};
