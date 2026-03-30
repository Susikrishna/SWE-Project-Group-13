const mongoose = require("mongoose");
const Role = require("../models/r")
mongoose.connect("mongodb+srv://aryanag2701_db_user:aryan@user-role.ra19zht.mongodb.net/User-Role").then(async () => {
    await Role.deleteMany({});
    console.log("Roles collection cleared");
    mongoose.disconnect();
});