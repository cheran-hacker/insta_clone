const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const storySchema = new mongoose.Schema({
    photo: {
        type: String,
        required: true
    },
    postedBy: {
        type: ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // TTL Index: Documents expire after 24 hours (86400 seconds)
    }
});

mongoose.model("Story", storySchema);
