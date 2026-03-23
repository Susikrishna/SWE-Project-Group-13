const mongoose = require("mongoose");

const mfeSchema = new mongoose.Schema(
  {
    // The unique slug linking this frontend to a Role's 'mfeAccess' array (e.g., 'set-ui')
    feature: { type: String, required: true, unique: true, index: true }, 
    
    // Human-readable display name for the module (e.g., 'Settings Dashboard')
    name: { type: String, required: true }, 
    
    // Built-in documentation explaining the purpose of this UI module
    description: { type: String, trim: true },

    // The base URL path where this MFE is mounted in the browser (e.g., '/settings')
    route: { type: String, required: true }, 
    
    // The CDN or hosted URL serving the remote javascript (e.g., 'https://cdn.com/user.js')
    remoteUrl: { type: String, required: true }, 
    
    // The specific Webpack Module Federation name (e.g., 'UserSettings')
    module: { type: String, required: true }, 
    
    // Soft delete / dark launch flag to disable the UI module instantly
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MfeRegistry", mfeSchema);