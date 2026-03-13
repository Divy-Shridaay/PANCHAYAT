const mongoose = require("mongoose");
const { toPaisa, fromPaisa } = require("./currencyHelpers");

const EducationRevenueSchema = new mongoose.Schema(
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
    spare: { type: Number, required: true, default: 0, set: toPaisa, get: fromPaisa },
    left: { type: Number, required: true, set: toPaisa, get: fromPaisa },
    pending: { type: Number, required: true, set: toPaisa, get: fromPaisa },
    rotating: { type: Number, required: true, set: toPaisa, get: fromPaisa },
    total: { type: Number, required: true, set: toPaisa, get: fromPaisa },
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
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

const EducationRevenue = mongoose.model(
  "EducationRevenue",
  EducationRevenueSchema,
  "EducationRevenue"
);

module.exports = EducationRevenue;
