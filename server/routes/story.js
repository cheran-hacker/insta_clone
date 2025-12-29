const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Story = mongoose.model("Story");

// Fetch all valid stories (Populate user details)
router.get('/all', requireLogin, (req, res) => {
    // Mongo TTL handles expiration, so just fetch all
    Story.find()
        .populate("postedBy", "_id username pic")
        .sort('-createdAt')
        .then(stories => {
            res.json({ stories });
        })
        .catch(err => {
            console.log(err);
        });
});

// Create a new Story
router.post('/create', requireLogin, (req, res) => {
    const { pic } = req.body;
    if (!pic) {
        return res.status(422).json({ error: "Please add an image" });
    }
    const story = new Story({
        photo: pic,
        postedBy: req.user
    });
    story.save().then(result => {
        res.json({ story: result });
    })
        .catch(err => {
            console.log(err);
        });
});

module.exports = router;
