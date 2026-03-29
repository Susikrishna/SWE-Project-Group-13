const userModel = require("../models/User");
const bcrypt = require("bcrypt");
const axios = require("axios")
const getUsers = async (req, res) => {
    try {
        const users = await userModel.find().sort({ createdAt: -1 });
        res.status(200).json({ users, total: users.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addNewUser = async (req, res) => {
    try {
        let { name, username, password, roles } = req.body;
        
        if (!name || !username || !password || !roles) {
            return res.status(400).json({ error: "Missing User fields" });
        }
        
        const existingUser = await userModel.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            name,
            username,
            password: hashedPassword,
            roles,
        });
        
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const addRoleToUser = async (req, res) => {
    try {
        const { username, roleArr } = req.body;
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        const ROLE_URL = "http://localhost:3002/roles";
        
        for (const roleId of roleArr) {
            
            try {
                await axios.get(`${ROLE_URL}/${roleId}`);
            } catch {
                return res.status(404).json({ error: `Role ${roleId} not found` });
            }
            
            if (user.roles.includes(roleId)) {
                return res.status(400).json({ error: `User already has role ${roleId}` });
            }
            user.roles.push(roleId);
        }
        
        await user.save();
        res.status(200).json({
            message: "Role added successfully",
            user: user,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const clearAllRoles = async (req, res) => {
    try {
        await userModel.updateMany({}, { $set: { roles: [] } });
        res.status(200).json({ message: "All roles cleared from users successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const clearRolesForUser = async (req,res) =>{
    try{
        const {username,roleArr} = req.body;
        console.log(username)
        const user = await userModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if(roleArr.length ==0){
            return res.status(404).json({error:"Empty Role array"});
        }
        
        const ROLE_URL = "http://localhost:3002/roles";
        for (const roleId of roleArr) {
            try {
                await axios.get(`${ROLE_URL}/${roleId}`);
            } catch {
                return res.status(404).json({ error: `Role ${roleId} not found` });
            }
        }
        
        for (const roleId of roleArr) {
            if (!user.roles.includes(roleId)) {
                return res.status(400).json({ error: `User does not have role ${roleId}` });
            }
        }

        user.roles = user.roles.filter((role) => !roleArr.includes(role));
        await user.save();
        res.status(200).json({ message: "Roles removed successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
module.exports = { getUsers, addNewUser , addRoleToUser, clearAllRoles, clearRolesForUser};