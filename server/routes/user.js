const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");
const User = mongoose.model("User");

// 1. Get User Profile (For viewing other profiles)
router.get('/:id', requireLogin, (req, res) => {
    User.findOne({ _id: req.params.id })
    .select("-password")
    .then(user => {
        Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id username")
        .exec()
        .then(posts => {
            res.json({ user, posts });
        })
        .catch(err => {
            return res.status(422).json({ error: err });
        });
    }).catch(err => res.status(404).json({ error: "User not found" }));
});

// 2. Follow User
router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, { new: true })
    .then(result => {
        User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followId }
        }, { new: true })
        .select("-password")
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            return res.status(422).json({ error: err });
        });
    })
    .catch(err => {
        return res.status(422).json({ error: err });
    });
});

// 3. Unfollow User
router.put('/unfollow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.user._id }
    }, { new: true })
    .then(result => {
        User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.unfollowId }
        }, { new: true })
        .select("-password")
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            return res.status(422).json({ error: err });
        });
    })
    .catch(err => {
        return res.status(422).json({ error: err });
    });
});

// 4. Update Profile Picture Only
router.put('/updatepic', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { pic: req.body.pic } }, { new: true })
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            return res.status(422).json({ error: "pic cannot post" });
        });
});

// 5. Search Users
router.post('/search-users', (req, res) => {
    let userPattern = new RegExp("^" + req.body.query);
    User.find({ email: { $regex: userPattern } })
        .select("_id email username pic")
        .then(user => {
            res.json({ user });
        }).catch(err => {
            console.log(err);
        });
});

// 6. Save Post (Bookmark)
router.put('/savepost', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $push: { saved: req.body.postId }
    }, { new: true })
    .then(result => {
        res.json(result);
    }).catch(err => {
        return res.status(422).json({ error: err });
    });
});

// 7. Unsave Post (Remove Bookmark)
router.put('/unsavepost', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $pull: { saved: req.body.postId }
    }, { new: true })
    .then(result => {
        res.json(result);
    }).catch(err => {
        return res.status(422).json({ error: err });
    });
});

// 8. Update Full Profile (Name, Bio, Pic)
router.put('/updateprofile', requireLogin, (req, res) => {
    const { name, bio, pic } = req.body;
    User.findByIdAndUpdate(req.user._id, {
        $set: { name, bio, pic } 
    }, { new: true })
    .select("-password")
    .then(result => {
        res.json(result);
    }).catch(err => {
        return res.status(422).json({ error: "Could not update profile" });
    });
});

module.exports = router;