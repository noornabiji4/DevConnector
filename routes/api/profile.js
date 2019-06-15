const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load validation 
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')


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
        .populate('user', ['name', 'avatar '])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user ';
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
});

//@routes GET api/profile/all
//@desc   GET all profiles 
//@access public

router.get('/all', (req, res) => {
    const errors = {}

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There are no profiles ';
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json({ profile: 'There are no profiles' }))

});


//@routes GET api/profile/handle: handle
//@desc   GET profile by handle 
//@access public

router.get('/handle/:handle', (req, res) => {
    const errors = {}
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err))
});

//@routes GET api/profile/user/:user_id
//@desc   GET profile by user ID
//@access public

router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', ' avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json({ profile: 'There is no profile for this user' }))
});


//@routes POST api/profile  
//@desc Create or edit user profile
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
    if (req.body.website) profileFields.website = req.body.website;
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

    Profile.findOne({ user: req.user.id }).then(profile => {
        if (profile) {
            //update
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).then(profile => res.json(profile))
        }
        else {
            //create 

            // check if handle exist
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

//@routes POST api/profile/experience
//@desc   Add experiance to profile 
//@access Private

router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // check validation 
    if (!isValid) {
        //Return any errors with 400 status
        return res.status(404).json(errors)
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            //Add to experience to array
            profile.experience.unshift(newExp);

            profile.save().then(profile => res.json(profile))
        })
})

//@routes POST api/profile/education
//@desc   Add education to profile 
//@access Private

router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // check validation 
    if (!isValid) {
        //Return any errors with 400 status
        return res.status(404).json(errors)
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            //Add to education to array
            profile.education.unshift(newExp);

            profile.save().then(profile => res.json(profile))
        })
});

//@routes DETELE api/profile/experience/:exp_id
//@desc   Delete education from profile 
//@access Private

router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then(profile => {
        //GET remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        //Splice out of array
        profile.experience.splice(removeIndex, 1);

        //save 
        profile.save().then(profile => res.json(profile))
    })
        .catch(err => res.status(404).json(err))

});

//@routes DETELE api/profile/education/:edu_id
//@desc   Delete education from profile 
//@access Private

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then(profile => {
        //GET remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        //Splice out of array
        profile.education.splice(removeIndex, 1);

        //save 
        profile.save().then(profile => res.json(profile))
    })
        .catch(err => res.status(404).json(err))

});

//@routes DETELE profile
//@desc   Delete user and profile 
//@access Private

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id })
            .then (()=> res.json({success : true}))
        })
});

module.exports = router;