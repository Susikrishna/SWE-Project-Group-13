const mongoose = require('mongoose');

// The seeded data we want to patch
const DB_URI = "mongodb+srv://krishnasusi323:LepPt8HbOiGfiBRg@swe-group-13.l6znpum.mongodb.net/?appName=SWE-Group-13";

async function patchPorts() {
    await mongoose.connect(DB_URI);
    
    // We update the MfeRegistry documents
    const db = mongoose.connection.db;
    
    await db.collection("mferegistries").updateOne(
        { feature: "dashboard-mfe" },
        { $set: { remoteUrl: "http://localhost:5010/assets/remoteEntry.js" } }
    );
    
    await db.collection("mferegistries").updateOne(
        { feature: "admin-mfe" },
        { $set: { remoteUrl: "http://localhost:5011/assets/remoteEntry.js" } }
    );
    
    await db.collection("mferegistries").updateOne(
        { feature: "analytics-mfe" },
        { $set: { remoteUrl: "http://localhost:5012/assets/remoteEntry.js" } }
    );
    
    console.log("Ports updated successfully!");
    process.exit(0);
}

patchPorts();
