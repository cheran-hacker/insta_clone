const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array, // Stores [userId1, userId2]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);