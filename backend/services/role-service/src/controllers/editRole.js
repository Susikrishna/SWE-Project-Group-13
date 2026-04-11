const Role = require("../models/Role");
const MfeRegistry = require("../models/MfeRegistry");

const editRoleById = async (req,res) =>{
    try{
        const {roleId,name,description,permissions, mfeAccess,isTemp,expiresAt} = req.body;
        if(!roleId){
            return res.status(400).json({ error: "Role ID is required" })
        }
        const newRole = {
            name:name.trim(),
            description:description,
            permissions: permissions ?? [],
            mfeAccess : mfeAccess ?? [],
            isTemp : isTemp ?? false,
            expiresAt: isTemp ? expiresAt : null,
        }

        // Hard Restriction Validation
        if (mfeAccess && mfeAccess.length > 0) {
            const selectedFeatureIds = Array.from(new Set(mfeAccess.map(key => key.split("::")[0])));
            const registries = await MfeRegistry.find({ feature: { $in: selectedFeatureIds } });
            
            const whitelist = new Set();
            registries.forEach(reg => {
                if (reg.allowedPermissions) {
                    reg.allowedPermissions.forEach(p => whitelist.add(p));
                }
            });

            const unauthorized = (permissions ?? []).filter(p => !whitelist.has(p));
            if (unauthorized.length > 0) {
                return res.status(403).json({ 
                    error: "Hard Restriction Violation", 
                    details: `The following permissions are not authorized by the selected MFEs: ${unauthorized.join(", ")}` 
                });
            }
        } else if (permissions && permissions.length > 0) {
            return res.status(403).json({ error: "Hard Restriction Violation", details: "Permissions cannot be assigned without at least one associated MFE." });
        }

        const response = await Role.findByIdAndUpdate(roleId,{
            $set: newRole
        },{
            new:true
        })

        if (!response) {
            return res.status(404).json({ error: "Role not found" });
        }

        return res.status(200).json({ message: "Role updated successfully", role: response});
    
    }catch(err){
        return res.status(500).json({error:err.message})
    }
}

module.exports = {editRoleById };