const mongoose = require("mongoose");

const DistrictSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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

const District = mongoose.model("District", DistrictSchema);

module.exports = District;
