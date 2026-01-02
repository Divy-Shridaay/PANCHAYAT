const mongoose = require("mongoose");

const TalukaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
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

const Taluka = mongoose.model("Taluka", TalukaSchema);

module.exports = Taluka;
