const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")

// Get All Posts
router.get('/all', requireLogin, (req, res) => {
    Post.find()
        .populate("postedBy", "_id username pic")
        .populate("comments.postedBy", "_id username")
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts })
        })
        .catch(err => {
            console.log(err)
        })
})

// Create Post
router.post('/createpost', requireLogin, (req, res) => {
    const { title, body, pic } = req.body
    if (!title || !body || !pic) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save().then(result => {
        res.json({ post: result })
    })
        .catch(err => {
            console.log(err)
        })
})

// --- LIKE ROUTE ---
router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true // <--- IMPORTANT: Returns updated record
    })
        .populate("postedBy", "_id username pic")
        .populate("comments.postedBy", "_id username")
        .exec((err, result) => {
            if (err) return res.status(422).json({ error: err })
            res.json(result)
        })
})

// --- UNLIKE ROUTE ---
router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true // <--- IMPORTANT
    })
        .populate("postedBy", "_id username pic")
        .populate("comments.postedBy", "_id username")
        .exec((err, result) => {
            if (err) return res.status(422).json({ error: err })
            res.json(result)
        })
})

// --- COMMENT ROUTE ---
router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id username")
        .populate("postedBy", "_id username pic")
        .exec((err, result) => {
            if (err) return res.status(422).json({ error: err })
            res.json(result)
        })
})

// Get My Posts (Active)
router.get('/mypost', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id, isArchived: false })
        .populate("postedBy", "_id username pic")
        .populate("comments.postedBy", "_id username")
        .sort('-createdAt')
        .then(mypost => {
            res.json({ mypost })
        })
        .catch(err => {
            console.log(err)
        })
})

// Get My Archived Posts
router.get('/myarchive', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id, isArchived: true })
        .populate("postedBy", "_id username pic")
        .populate("comments.postedBy", "_id username")
        .sort('-createdAt')
        .then(myarchive => {
            res.json({ myarchive })
        })
        .catch(err => {
            console.log(err)
        })
})

// Archive Post
router.put('/archive', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $set: { isArchived: true }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) return res.status(422).json({ error: err })
        res.json(result)
    })
})

// Unarchive Post
router.put('/unarchive', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $set: { isArchived: false }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) return res.status(422).json({ error: err })
        res.json(result)
    })
})

module.exports = router