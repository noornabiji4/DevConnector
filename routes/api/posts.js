const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passort = require('passport');

//Post model
const Post = require('../../models/Posts')
//Profile model
const Profile = require('../../models/Profile')


//validation
const validatePostInput = require('../../validation/post')

//@routes GET api/posts/test
//desc Tests post route
//@access public

router.get('/test', (req, res) => res.json({ msg: "Posts works" }));

//@routes   GET api/posts
//desc      GET posts
//@access   Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404)).json({ nopostsfound: 'No posts found' })
})

//@routes   GET api/posts/:id
//desc      GET post by id
//@access   Public
router.get('/', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404)).json({ nopostfound: 'No post found with that ID' })
})

//@routes   POST api/posts
//desc      Tests post route
//@access   Private
router.post('/', passort.authenticate('jwt', { session: false }), (req, res) => {
    const { erorrs, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
        // If any errors , send 400 with error object
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.body.id
    })
    newPost.save().then(post => res.json(post));

});

//@routes DELETE api/posts/:id
//desc DELETE post
//@access Private
router.delete('/:id', passor.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //check for post owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'USer not authorized' })
                    }
                    //Delete
                    post.remove().then(() => res.json({ success: true }))
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

module.exports = router;