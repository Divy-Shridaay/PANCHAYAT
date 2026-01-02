const mongoose = require("mongoose");

const VillagerSchema = new mongoose.Schema(
  {
    name: { type: String },
    accountNo: { type: String, required: true },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: true,
    },
    date: { type: String },
    sarkari: { type: Number, default: 0 },
    sivay: { type: Number, default: 0 },
    j_a: { type: Number, default: 0 },
    j_m: { type: Number, default: 0 },
    l_m: { type: Number, default: 0 },
    s_m: { type: Number, default: 0 },
    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 1,
    },
    // financialYear: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "FinancialYear",
    //   required: true,
    // },
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

// � Composite Unique Constraint
VillagerSchema.index({ accountNo: 1, village: 1 }, { unique: true });

// 🚫 Prevent auto indexes being created
mongoose.set("autoIndex", false);

const Villager = mongoose.model("Villager", VillagerSchema);

module.exports = Villager;
