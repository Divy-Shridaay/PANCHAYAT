const mongoose = require("mongoose");

const FinancialYearSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
    },
    financialYear: {
      type: String,
      required: true,
    },
    // startDate: {
    //   type: Date,
    //   required: true,
    // },
    // endDate: {
    //   type: Date,
    //   required: true,
    // },
    yearStatus: {
      type: String,
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

const FinancialYear = mongoose.model("FinancialYear", FinancialYearSchema);

module.exports = FinancialYear;

