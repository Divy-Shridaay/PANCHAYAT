const { default: mongoose } = require("mongoose");

const EducationMaangnuSchema = new mongoose.Schema({
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
    required: true,
    default: 0,
  },
  sarkari: {
    type: Number,
    // required: true,
  },
  sivay: {
    type: Number,
    // required: true,
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
});

const EducationMaangnu = mongoose.model(
  "EducationMaangnu",
  EducationMaangnuSchema,
  "EducationMaangnu"
);
module.exports = EducationMaangnu;
