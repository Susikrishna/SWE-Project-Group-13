/**
 * Seed tester roles
 */
db.roles.insertMany([
  {
    _id: "role_admin",
    name: "admin",
    description: "Tester-App Admin",
    permissions: [
      "gradelist-service:gradelist:create", "gradelist-service:gradelist:read", "gradelist-service:gradelist:update", "gradelist-service:gradelist:delete",
      "fee-service:fee-status:create", "fee-service:fee-status:read", "fee-service:fee-status:update", "fee-service:fee-status:delete",
      "room-service:room-booking:create", "room-service:room-booking:read", "room-service:room-booking:update", "room-service:room-booking:delete"
    ],
    mfeAccess: ["gradelist-mfe", "fee-status-mfe", "room-booking-mfe"],
    isTemp: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "role_acad-section",
    name: "acad-section",
    description: "Acad Section Tester-App",
    permissions: [
      "gradelist-service:gradelist:create", "gradelist-service:gradelist:read", "gradelist-service:gradelist:delete",
      "room-service:room-booking:read"
    ],
    mfeAccess: ["gradelist-mfe", "room-booking-mfe"],
    isTemp: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "role_student",
    name: "student",
    description: "Student Tester-App",
    permissions: [
      "gradelist-service:gradelist:read", 
      "fee-service:fee-status:read"
    ],
    mfeAccess: ["gradelist-mfe", "fee-status-mfe"],
    isTemp: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "role_admin-office",
    name: "admin-office",
    description: "Admin Office Tester-App",
    permissions: [
      "fee-service:fee-status:create", "fee-service:fee-status:read", "fee-service:fee-status:update", "fee-service:fee-status:delete",
      "room-service:room-booking:create", "room-service:room-booking:read", "room-service:room-booking:update", "room-service:room-booking:delete"
    ],
    mfeAccess: ["fee-status-mfe", "room-booking-mfe"],
    isTemp: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✓ Inserted 4 Tester-App roles");

// Insert some mock data to test
db.gradelists.insertMany([
  { course: "Algorithms", rollNumber: "CS101", grade: "A", semester: "Fall 2024", createdAt: new Date(), updatedAt: new Date() },
  { course: "Data Structures", rollNumber: "CS102", grade: "B", semester: "Fall 2024", createdAt: new Date(), updatedAt: new Date() }
]);

db.feepayments.insertMany([
  { studentName: "John Doe", rollNumber: "CS101", amount: 1500, status: "Paid", semester: "Fall 2024", createdAt: new Date(), updatedAt: new Date() },
  { studentName: "Jane Smith", rollNumber: "CS102", amount: 1500, status: "Pending", semester: "Fall 2024", createdAt: new Date(), updatedAt: new Date() }
]);

db.roombookings.insertMany([
  { room: "Hall A", date: "2024-12-01", timeSlot: "10:00 AM", purpose: "Lecture", bookedBy: "Prof. Alan", createdAt: new Date(), updatedAt: new Date() },
  { room: "Lab 1", date: "2024-12-02", timeSlot: "02:00 PM", purpose: "Lab Session", bookedBy: "Prof. Turing", createdAt: new Date(), updatedAt: new Date() }
]);

print("✓ Inserted Mock Data for Tester-App");
