const { default: mongoose } = require("mongoose");

const LocalFundRevenueSchema = new mongoose.Schema(
  {
    j_a_id: { type: mongoose.Schema.Types.ObjectId },
    billNo: { type: String, required: true },
    bookNo: { type: String, required: true },
    billDate: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function (value) {
          if (!value) return false;
          const year = value.getFullYear();
          return /^\d{4}$/.test(year.toString()); // only 4-digit year allowed
        },
        message: (props) =>
          `${props.value} does not have a valid 4-digit year.`,
      },
    },
    villager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villager",
      required: true,
    },
    left: { type: Number, required: true },
    pending: { type: Number, required: true },
    spare: { type: Number, required: true, default: 0 },
    rotating: { type: Number, required: true },
    total: { type: Number, required: true },
    word: { type: String },
    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 1,
    },
    financialYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialYear",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const LocalFundRevenue = mongoose.model(
  "LocalFundRevenue",
  LocalFundRevenueSchema,
  "LocalFundRevenue"
);

module.exports = LocalFundRevenue;
