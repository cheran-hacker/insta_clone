require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User'); // Case sensitive? app.js uses 'User'
const User = mongoose.model("User");

const uri = process.env.MONGO_URI;
console.log("Attempting to connect to:", uri ? "URI found" : "URI MISSING");

mongoose.connect(uri)
    .then(() => {
        console.log("Connected to mongo");
        testSave();
    })
    .catch(err => {
        console.log("Connection error:", err);
        process.exit(1);
    });

async function testSave() {
    try {
        const uniqueName = "test" + Date.now();
        console.log("Saving user:", uniqueName);

        const testUser = new User({
            name: "Test Script User",
            email: uniqueName + "@example.com",
            password: "password123",
            username: uniqueName
        });

        await testUser.save();
        console.log("SUCCESS: User saved directly via script.");

        // Cleanup
        await User.deleteOne({ email: testUser.email });
        console.log("Cleanup: Deleted test user.");

        process.exit(0);
    } catch (e) {
        console.log("ERROR: Could not save user.", e);
        if (e.errors) {
            console.log("Validation Errors:", JSON.stringify(e.errors, null, 2));
        }
        process.exit(1);
    }
}
