const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passort = require('passport');

const Post = require('../../models/Posts')

//@routes GET api/posts/test
//desc Tests post route
//@access public

router.get('/test', (req, res) => res.json({ msg: "Posts works" }));

//@routes   POST api/posts
//desc      Tests post route
//@access   Private
router.post('/', passort.authenticate('jwt', { session: false }), (req, res) => {
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.body.user
    })
    newPost.save().then(post => res.json(post));

})

module.exports = router;