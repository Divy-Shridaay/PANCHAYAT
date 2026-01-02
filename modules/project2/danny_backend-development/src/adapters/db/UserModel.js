const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    password: {
  type: String,
  required: true,
  select: false,
},

    phone: {
      type: String,
      index: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    middleName: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },
    villageAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Village",
      },
    ],
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },
    dob: {
      type: Date,
    },
    // roleId: {
    //   type: Number,
    //   required: true,
    //   default: 4,
    //   ref: "role",
    // },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    // permissions: { type: mongoose.Schema.Types.Mixed },
    extraPermissions: [
      {
        type: String,
      },
    ],
    revokedPermissions: [
      {
        type: String,
      },
    ],
    status: {
      type: Number,
      default: 1,
    },
    tokenVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
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

UserSchema.pre("save", async function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // hash the password with a cost of 12
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(user.password, salt);

  // replace the plain text password with the hashed one
  user.password = hash;
  next();
});
console.log("bcrypt", bcrypt);
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
console.log("jwt", jwt);
UserSchema.methods.generateToken = async function () {
  const accessToken = jwt.sign(
    { id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};


UserSchema.pre("save", function (next) {
  if (
    this.isModified("firstName") ||
    this.isModified("middleName") ||
    this.isModified("lastName")
  ) {
    this.name = `${this.firstName || ""} ${this.middleName || ""} ${
      this.lastName || ""
    }`.trim();
  }
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
