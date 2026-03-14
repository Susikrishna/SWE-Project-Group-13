const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
{
  resource: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  action: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  description: {
    type: String,
    trim: true
  }

}, { _id: false });


const registrySchema = new mongoose.Schema({

  serviceName: {
    type: String,
    required: true,
    trim: true
  },

  serviceIdentifier: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  serviceType: {
    type: String,
    required: true,
    enum: ["microservice", "microfrontend"]
  },
  
  baseUrl: {
    type: String,
    required: true,
    trim: true,
    match: /^https?:\/\/.+/
  },
  
  exposedPermissions: {
    type: [permissionSchema],
    
    validate: {
      validator: function (permissions) {
        const set = new Set(
          permissions.map(p => `${p.resource}:${p.action}`)
        );
        return set.size === permissions.length;
      },
      message: "Duplicate permissions are not allowed"
    }
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

registrySchema.index({
  "exposedPermissions.resource": 1,
  "exposedPermissions.action": 1
});

module.exports = mongoose.model("ServiceRegistry", registrySchema);