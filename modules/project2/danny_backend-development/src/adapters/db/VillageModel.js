const mongoose = require("mongoose");

const VillageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    taluka: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taluka",
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Village = mongoose.model("Village", VillageSchema);

module.exports = Village;
