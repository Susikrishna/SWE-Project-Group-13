const mongoose = require("mongoose");

const permissionSetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },
    mfes: [{ type: mongoose.Schema.Types.ObjectId, ref: "MfeRegistry", default: [] }],
    apis: [{ type: mongoose.Schema.Types.ObjectId, ref: "ApiRegistry", default: [] }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PermissionSet", permissionSetSchema);
