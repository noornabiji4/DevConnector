const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

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
        .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }))
})

//@routes   GET api/posts/:id
//desc      GET post by id
//@access   Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ nopostfound: 'No post found with that ID' }))
})

//@routes   POST api/posts
//desc      Tests post route
//@access   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
        // If any errors , send 400 with error object
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    })
    newPost.save().then(post => res.json(post));

});

//@routes DELETE api/posts/:id
//desc DELETE post
//@access Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //check for post owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' })
                    }
                    //Delete
                    post.remove().then(() => res.json({ success: true }))
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//@routes POST api/posts/like/:id
//desc Like post
//@access Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyliked: 'User alreday liked this post' })
                    }
                    //Add user id to liked array
                    post.likes.unshift({ user: req.user.id });
                    post.save().then(post => res.json(post))
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//@routes POST api/posts/unlike/:id
//desc Unlike post
//@access Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notliked: 'You have not yet liked this post' })
                    }
                    // Get remove index
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    // Splice out of array
                    post.likes.splice(removeIndex, 1)

                    // Save
                    post.save().then(post => res.json(post))
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

//@routes POST api/posts/comment/:id
//desc Add comment post
//@access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
        // If any errors , send 400 with error object
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            //Add to comment array 
            post.comments.unshift(newComment);

            // Save
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
})

//@routes DELETE api/posts/comment/:id/:comment_id
//desc Remove comment from post 
//@access Private
router.delete('/comment/:id/:comment_id',
    passport.authenticate('jwt', { session: false }), (req, res) => {
        Post.findById(req.params.id)
            .then(post => {
                if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id)
                .length === 0){
                    return res.status(404).json({ commentnotexist : 'Comment does not exist'})
                }
                // Get remove index
                const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id)

                // Splice comment out of array 
                post.comments.splice(removeIndex , 1)

                post.save().then(post => res.json(post))
            })

            .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
    })

module.exports = router;