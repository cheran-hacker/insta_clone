const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
  caption: { type: String },
  photo: { type: String, required: true }, // URL for Image or Video
  mediaType: { type: String, default: "image" }, // "image" or "video"
  likes: [{ type: ObjectId, ref: "User" }],
  comments: [{
    text: String,
    postedBy: { type: ObjectId, ref: "User" }
  }],
  postedBy: { type: ObjectId, ref: "User" },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

mongoose.model("Post", postSchema);