const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load validation 
const validateProfileInput = require('../../validation/profile')

//load profle model
const Profile = require('../../models/Profile')
//load user model
const User = require('../../models/User');


//@routes GET api/profile/test
//desc Tests profile route
//@access public
router.get('/test', (req, res) => res.json({ msg: "Profile works" }));

//routes GET api/profile
//desc Get current user profile 
//@access private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user ';
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
})

//routes POST api/profile  
//desc Create or edit user profile
//@access private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check validation 
    if (!isValid) {
        //return any errors with 400 status
        return res.status(400).json(errors)
    }

    //Get Fields 
    const profileFields = {}
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    //Skills - split into array

    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
    //Social 
    profileFields.social = {}
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.body.id }).then(profile => {
        if (profile) {
            //update
            Profile.findOneAndDelete(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).then(profile => res.json(profile))
        }
        else {
            Profile.findOne({ handle: profileFields.handle }).then(profile => {
                if (profile) {
                    errors.handle = 'That handle already exists';
                    res.status(400).json(errors)
                }

                //save  profile
                new Profile(profileFields).save().then(profile => res.json(profile))
            })
        }
    })
})

module.exports = router;