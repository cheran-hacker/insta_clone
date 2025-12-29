require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Wrap Express in HTTP server
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Register Models
require('./models/User');
require('./models/Post');
require('./models/Conversation');
require('./models/Message');
require('./models/Story'); // New

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/post'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/user'));
app.use('/api/stories', require('./routes/story')); // New 

// --------------------------
// Socket.io Real-Time Logic
// --------------------------

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"]
  }
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  // console.log("A user connected.");

  // 1. Manage Online Users
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", onlineUsers);
  });

  // 2. Real-Time Chat (Messenger)
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  // 3. Real-Time Feed (Likes & Comments)
  // When a user likes a post, broadcast the updated post data to EVERYONE
  socket.on("likePost", (newPostData) => {
    io.emit("postUpdated", newPostData);
  });

  // When a user comments, broadcast the updated post data to EVERYONE
  socket.on("commentPost", (newPostData) => {
    io.emit("postUpdated", newPostData);
  });

  // 4. Disconnect
  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", onlineUsers);
  });
});

// --------------------------
// Start Server
// --------------------------
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});