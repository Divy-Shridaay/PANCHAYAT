require("dotenv").config();
const mongoose = require("mongoose");
const { Types } = mongoose;
const app = require("./src/app/index");
const connectDB = require("./src/adapters/db/MongooseClient");
const Village = require("./src/adapters/db/VillageModel");

const PORT = process.env.PORT || 5000;
console.log(process.env.MONGO_URI)
async function convertVillageToObjectId() {
  const collection = mongoose.connection.collection("LandMaangnu"); // � update this
  const cursor = collection.find({
    financialYear: { $type: "string", $regex: /^[a-f\d]{24}$/i },
  });

  const bulkOps = [];
  for await (const doc of cursor) {
    bulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { financialYear: new Types.ObjectId(doc.district) } },
      },
    });
  }

  if (bulkOps.length > 0) {
    const result = await collection.bulkWrite(bulkOps);
    console.log(
      `✅ Converted ${result.modifiedCount} village fields to ObjectId.`
    );
  } else {
    console.log(
      `ℹ️ No matching string-based ObjectId fields found in "village".`
    );
  }
}
console.log(process.env.MONGO_URI)
connectDB().then(async () => {
  // await convertVillageToObjectId(); // � Run our field-fixing function
  app.listen(PORT, () => {
    console.log(`� Server running on port ${PORT}`);
  });
});
