const mongoose = require("mongoose");
const { toPaisa, fromPaisa } = require("./currencyHelpers");

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
    sarkari: { type: Number, default: 0, set: toPaisa, get: fromPaisa },
    sivay: { type: Number, default: 0, set: toPaisa, get: fromPaisa },
    j_a: { type: Number, default: 0, set: toPaisa, get: fromPaisa },
    j_m: { type: Number, default: 0, set: toPaisa, get: fromPaisa },
    l_m: { type: Number, default: 0, set: toPaisa, get: fromPaisa },
    s_m: { type: Number, default: 0, set: toPaisa, get: fromPaisa },
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
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// � Composite Unique Constraint
VillagerSchema.index({ accountNo: 1, village: 1 }, { unique: true });
// 📊 Single field index for better query performance
VillagerSchema.index({ village: 1 }, { name: "idx_village" });
// 🚫 Prevent auto indexes being created
mongoose.set("autoIndex", false);

const Villager = mongoose.model("Villager", VillagerSchema);

module.exports = Villager;
