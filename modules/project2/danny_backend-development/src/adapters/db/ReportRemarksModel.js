const mongoose = require("mongoose");

const ReportRemarkSchema = new mongoose.Schema(
  {
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
    remark: {
      type: String,
      default: "", 
      trim: true
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

const ReportRemark = mongoose.model("ReportRemark", ReportRemarkSchema);

module.exports = ReportRemark;
