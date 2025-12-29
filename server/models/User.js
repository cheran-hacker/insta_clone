const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // 👇 THIS WAS MISSING 👇
    bio: {
        type: String,
        default: "" 
    },
    // ----------------------
    pic: {
        type: String,
        default: "https://res.cloudinary.com/cnq/image/upload/v1586197505/person_cpp7lm.jpg"
    },
    followers: [{ type: ObjectId, ref: "User" }],
    following: [{ type: ObjectId, ref: "User" }],
    saved: [{ type: ObjectId, ref: "Post" }]
});

mongoose.model("User", userSchema);