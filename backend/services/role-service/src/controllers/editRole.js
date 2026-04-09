const Role = require("../models/Role");

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