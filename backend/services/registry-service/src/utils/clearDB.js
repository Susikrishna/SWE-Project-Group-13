const mongoose = require("mongoose");
const mfeModel = require("../models/mfeRegistry.model")
const apiModel = require("../models/apiRegistry.model")
mongoose.connect("mongodb+srv://aryanag2701_db_user:aryan@user-role.ra19zht.mongodb.net/User-Role").then(async () => {
    await mfeModel.deleteMany({});
    await apiModel.deleteMany({});
    console.log("collections cleared");
    mongoose.disconnect();
});