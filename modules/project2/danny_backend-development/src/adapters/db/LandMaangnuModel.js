const { default: mongoose } = require("mongoose");

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
    },
    left: {
      type: Number,
      default: 0,
    },
    sarkari: {
      type: Number,
    },
    sivay: {
      type: Number,
    },
    rotating: {
      type: Number,
      default: 0,
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
  }
);

const LandMaangnu = mongoose.model(
  "LandMaangnu",
  LandMaangnuSchema,
  "LandMaangnu"
);
module.exports = LandMaangnu;
