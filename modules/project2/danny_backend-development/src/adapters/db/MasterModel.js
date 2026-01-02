const mongoose = require("mongoose");

const MasterSchema = new mongoose.Schema(
  {
    lSarkari: {
      type: String,
      required: true,
    },
    lSivay: {
      type: String,
      required: true,
    },
    sSarkari: {
      type: String,
      required: true,
    },
    sSivay: {
      type: String,
      required: true,
    },
    landRevenueBookLimit: {
      type: Number,
      required: true,
    },
    educationRevenueBookLimit: {
      type: Number,
      required: true,
    },
    localFundRevenueBookLimit: {
      type: Number,
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

const Master = mongoose.model("Master", MasterSchema);

module.exports = Master;
