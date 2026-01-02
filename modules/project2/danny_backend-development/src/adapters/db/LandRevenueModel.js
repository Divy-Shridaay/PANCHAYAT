const { default: mongoose } = require("mongoose");

const LandRevenueSchema = new mongoose.Schema(
  {
    j_a_id: { type: mongoose.Schema.Types.ObjectId },
    billNo: { type: Number, required: true },
    bookNo: { type: Number, required: true },
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
    spare: { type: Number, required: true, default: 0 },
    left: { type: Number, required: true },
    pending: { type: Number, required: true },
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

const LandRevenue = mongoose.model(
  "LandRevenue",
  LandRevenueSchema,
  "LandRevenue"
);

module.exports = LandRevenue;
