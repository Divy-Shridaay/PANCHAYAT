const { default: mongoose } = require("mongoose");
const { toPaisa, fromPaisa } = require("./currencyHelpers");

const LandMaangnuSchema = new mongoose.Schema(
  {
    villager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villager",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },
    fajal: {
      type: Number,
      required: true,
      default: 0,
      set: toPaisa,
      get: fromPaisa,
    },
    left: {
      type: Number,
      default: 0,
      set: toPaisa,
      get: fromPaisa,
    },
    sarkari: {
      type: Number,
      set: toPaisa,
      get: fromPaisa,
    },
    sivay: {
      type: Number,
      set: toPaisa,
      get: fromPaisa,
    },
    rotating: {
      type: Number,
      default: 0,
      set: toPaisa,
      get: fromPaisa,
    },
    financialYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialYear",
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1, 2], // 0 for inactive, 1 for active and 2 for deleted
      default: 1, // 1 for active, 0 for inactive
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

const LandMaangnu = mongoose.model(
  "LandMaangnu",
  LandMaangnuSchema,
  "LandMaangnu"
);
module.exports = LandMaangnu;
