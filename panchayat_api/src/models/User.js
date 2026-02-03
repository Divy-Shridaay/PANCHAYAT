import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },

  gender: { type: String, enum: ["male", "female", "other"], required: true },
  dob: { type: String },

  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },

  // Registration fields
  pinCode: { type: String, required: true },
  taluko: { type: String, required: true },
  gam: { type: String, required: true },
  jillo: { type: String, required: true },

  // Auto-generated fields
  name: { type: String },

  // ✅ FIX: Make username sparse so null values don't conflict
  // sparse: true allows multiple null values but enforces uniqueness for actual values
  username: {
    type: String,
    unique: true,
    sparse: true  // This is the key fix!
  },
  password: { type: String },

  role: {
    type: String,
    enum: ["admin", "sarpanch", "clerk"],
    default: "clerk"
  },

  // OTP fields
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },

  // Password reset fields
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  isDeleted: { type: Boolean, default: false },

  // Trial period fields
  trialStartDate: { type: Date },

  // Payment and print fields
  isPaid: { type: Boolean, default: false },
  isPendingVerification: { type: Boolean, default: false },
  printCount: { type: Number, default: 0 },

  // Per-user module access controls
  modules: {
    pedhinamu: { type: Boolean },
    rojmel: { type: Boolean },
    jaminMehsul: { type: Boolean }
  },
  pendingModules: {
    pedhinamu: { type: Boolean, default: false },
    rojmel: { type: Boolean, default: false },
    jaminMehsul: { type: Boolean, default: false }
  },
  pedhinamuPrintAllowed: { type: Boolean },
  // Pedhinamu print override (admin can allow/deny printing irrespective of trial/payment)
  // Payment and subscription dates
  paymentStartDate: { type: Date },
  paymentEndDate: { type: Date },

  // Granular module-wise dates
  pedhinamuStartDate: { type: Date },
  pedhinamuEndDate: { type: Date },

  rojmelStartDate: { type: Date },
  rojmelEndDate: { type: Date },

  jaminMehsulStartDate: { type: Date },
  jaminMehsulEndDate: { type: Date }

}, { timestamps: true });

// ✅ Remove duplicate index definition (you already have it in schema)
// UserSchema.index({ username: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", UserSchema);