const mongoose = require("mongoose");

const gradelistSchema = new mongoose.Schema(
    {
        course: { type: String, required: true, trim: true },
        rollNumber: { type: String, required: true, trim: true },
        grade: { type: String, required: true, trim: true },
        semester: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Gradelist", gradelistSchema);
