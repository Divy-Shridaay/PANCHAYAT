const mongoose = require("mongoose");

const ChallanSchema = new mongoose.Schema(
  {
    challanNo: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    from: { type: String, required: true },
    // to: { type: Number, required: true },
    left: { type: Number, required: true },
    pending: { type: Number, required: true },
    rotating: { type: Number, required: true },
    total: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Land", "Education", "Local Fund"],
      required: true,
      default: "Land",
    },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },
    financialYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialYear",
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

const Challan = mongoose.model("Challan", ChallanSchema);

module.exports = Challan;
