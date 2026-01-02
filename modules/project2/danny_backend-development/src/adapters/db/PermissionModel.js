const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Permission Schema definition
const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Number,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming the 'User' collection is used to track who created the permission
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Export Permission model
const Permission = mongoose.model("permissions", permissionSchema);

module.exports = Permission;
