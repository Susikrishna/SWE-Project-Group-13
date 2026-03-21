const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema(
  {
    // The microservice this endpoint belongs to (e.g., 'user-svc')
    service: { type: String, required: true }, 
    
    // The exact URL path (e.g., '/api/users/:id')
    path: { type: String, required: true }, 
    
    // HTTP method (GET, POST, PUT, DELETE, etc.)
    method: { type: String, required: true }, 

    // The domain entity being accessed (e.g., 'profile', 'billing')
    resource: { type: String, required: true }, 
    
    // The specific operation being performed (e.g., 'read', 'update')
    action: { type: String, required: true }, 

    // The generated RBAC string bridging APIs to Roles (format: service:resource:action)
    permissionKey: { type: String, required: true }, 

    // If true, this endpoint bypasses RBAC/Auth checks
    isPublic: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

// Prevent developers from registering the exact same route and method twice
apiSchema.index({ path: 1, method: 1 }, { unique: true });

module.exports = mongoose.model("ApiRegistry", apiSchema);