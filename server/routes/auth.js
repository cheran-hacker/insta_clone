const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup Route
router.post('/signup', (req, res) => {
    console.log("DEBUG: Signup Request Body:", req.body); // <--- DEBUG LOG
    const { name, email, password, username, pic } = req.body;
    if (!email || !password || !name || !username) {
        return res.status(422).json({ error: "Please add all fields" });
    }

    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "User already exists" });
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email,
                        password: hashedPassword,
                        name, // <--- Added 'name'
                        username,
                        pic
                    });
                    user.save()
                        .then(user => {
                            res.json({ message: "Saved successfully" });
                        })
                        .catch(err => {
                            console.log("Error saving user:", err);
                            res.status(500).json({ error: "Database save failed: " + err.message });
                        });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Server error during signup" });
        });
});

// Signin Route
router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email or password" });
    }

    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid Email or password" });
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        // Create JWT Token
                        const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
                        const { _id, username, email, followers, following, pic } = savedUser;
                        res.json({ token, user: { _id, username, email, followers, following, pic } });
                    } else {
                        return res.status(422).json({ error: "Invalid Email or password" });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        });
});

module.exports = router; // <--- CRITICAL: This line prevents the crash!