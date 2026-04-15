const mongoose = require("mongoose");
require("dotenv").config();

const Gradelist = require("./src/models/Gradelist");
const FeePayment = require("./src/models/FeePayment");
const RoomBooking = require("./src/models/RoomBooking");

const MONGODB_URI = process.env.MONGO_DB_URI || "mongodb+srv://aryanag2701_db_user:aryan@user-role.ra19zht.mongodb.net/User-Role";

mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB for seeding"))
    .catch(err => {
        console.error("DB Connection error:", err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        console.log("Clearing existing tester app data...");
        await Gradelist.deleteMany({});
        await FeePayment.deleteMany({});
        await RoomBooking.deleteMany({});

        console.log("Inserting Gradelist data...");
        const gradelists = [
            { course: "Data Structures", rollNumber: "CS2101", grade: "A", semester: "3" },
            { course: "Algorithms", rollNumber: "CS2102", grade: "B+", semester: "3" },
            { course: "Operating Systems", rollNumber: "CS2103", grade: "A-", semester: "4" },
            { course: "Database Systems", rollNumber: "CS2104", grade: "A", semester: "4" },
            { course: "Computer Networks", rollNumber: "CS2105", grade: "B", semester: "5" }
        ];
        await Gradelist.insertMany(gradelists);

        console.log("Inserting FeePayment data...");
        const fees = [
            { studentName: "Alice Smith", rollNumber: "CS2101", amount: 50000, status: "Paid", semester: "3" },
            { studentName: "Bob Jones", rollNumber: "CS2102", amount: 50000, status: "Pending", semester: "3" },
            { studentName: "Charlie Brown", rollNumber: "CS2103", amount: 55000, status: "Overdue", semester: "4" },
            { studentName: "Diana Prince", rollNumber: "CS2104", amount: 55000, status: "Paid", semester: "4" },
            { studentName: "Eve Adams", rollNumber: "CS2105", amount: 60000, status: "Pending", semester: "5" }
        ];
        await FeePayment.insertMany(fees);

        console.log("Inserting RoomBooking data...");
        const bookings = [
            { room: "Room 101", date: "2026-05-01", timeSlot: "10:00 AM - 12:00 PM", purpose: "DSA Lab", bookedBy: "Prof. Alan" },
            { room: "Room 102", date: "2026-05-02", timeSlot: "01:00 PM - 03:00 PM", purpose: "OS Lecture", bookedBy: "Prof. Turing" },
            { room: "Conference Hall", date: "2026-05-05", timeSlot: "09:00 AM - 05:00 PM", purpose: "Hackathon", bookedBy: "Student Council" },
            { room: "Lab A", date: "2026-05-10", timeSlot: "02:00 PM - 04:00 PM", purpose: "Networks Lab", bookedBy: "Prof. Cerf" }
        ];
        await RoomBooking.insertMany(bookings);

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error during seeding:", err);
        process.exit(1);
    }
};

seedData();
