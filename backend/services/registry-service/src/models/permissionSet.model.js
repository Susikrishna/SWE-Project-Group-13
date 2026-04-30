const mongoose = require("mongoose");

const permissionSetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },

    // Each entry links an MFE to the specific components within it that are granted.
    // An empty `components` array means the entire root MFE is granted.
    mfes: [
      {
        mfeId: { type: mongoose.Schema.Types.ObjectId, ref: "MfeRegistry", required: true },
        components: [{ type: String }], // specific component routes, e.g. ["/billing", "/users"]
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PermissionSet", permissionSetSchema);
