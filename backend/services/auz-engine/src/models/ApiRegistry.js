const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema(
  {
    service: { type: String, required: true, index: true }, 
    basePath: { type: String, required: true }, 
    route: { type: String, required: true }, 
    method: { type: String, required: true, uppercase: true }, 
    description: { type: String, trim: true },
    resource: { type: String, required: true }, 
    action: { type: String, required: true }, 
    permissionKey: { type: String, required: true }, 
    isPublic: { type: Boolean, default: false }, 
    isActive: { type: Boolean, default: true }, 
  },
  { timestamps: true }
);

apiSchema.index({ service: 1, basePath: 1, route: 1, method: 1 }, { unique: true });
apiSchema.index({ permissionKey: 1 });

module.exports = mongoose.model("ApiRegistry", apiSchema);
