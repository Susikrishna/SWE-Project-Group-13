const mongoose = require("mongoose");

const apiSchema = new mongoose.Schema(
  {
    // The microservice this belongs to (e.g., 'user-svc') as a simple string
    service: { type: String, required: true, index: true }, 
    
    // Gateway routing prefix (e.g., '/api/v1/users')
    basePath: { type: String, required: true }, 
    
    // Specific microservice route (e.g., '/:id')
    route: { type: String, required: true }, 
    
    // HTTP method (GET, POST, PUT, DELETE, etc.)
    method: { type: String, required: true, uppercase: true }, 

    // Built-in documentation explaining what this endpoint does
    description: { type: String, trim: true },

    // Domain entity & operation (e.g., 'profile', 'read')
    resource: { type: String, required: true }, 
    action: { type: String, required: true }, 

    // The generated RBAC string bridging APIs to Roles (e.g., 'user-svc:profile:read')
    permissionKey: { type: String, required: true }, 

    // If true, this endpoint bypasses RBAC/Auth checks entirely
    isPublic: { type: Boolean, default: false }, 
    
    // Soft delete / deprecation flag to disable the API without deleting the record
    isActive: { type: Boolean, default: true }, 
  },
  { timestamps: true }
);

// Prevent developers from registering the exact same route and method twice for a service
apiSchema.index({ service: 1, basePath: 1, route: 1, method: 1 }, { unique: true });

// Extremely fast lookups when verifying a user's permission token
apiSchema.index({ permissionKey: 1 }, { unique: true });

module.exports = mongoose.model("ApiRegistry", apiSchema);