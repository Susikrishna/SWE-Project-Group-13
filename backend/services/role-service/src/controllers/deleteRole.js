const Role = require("../models/Role");

const deleteRoleByID = async (req, res) => {
    try {
        const { roleId } = req.body
        if (!roleId)
            return res.status(500).json({ error: "Role ID required" })
        const role = await Role.findByIdAndDelete(roleId)
        return res.status(200).json({ message: "Role deleted successfully" })

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const deleteRoles = async (req, res) => {
    try {
        const { roleIds } = req.body
        if (!roleIds || roleIds.length == 0)
            return res.status(500).json({ error: "Role IDs required" })
        const result = await Role.deleteMany({ _id: { $in: roleIds } })
        return res.status(200).json({
            message: "Roles deleted successfully",
            count : result.deletedCount
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { deleteRoleByID, deleteRoles };