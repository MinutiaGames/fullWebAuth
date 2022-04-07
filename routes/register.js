const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

router.post('/', (req, res) => {
    const hash = bcrypt.hashSync(req.body.password, parseInt(process.env.BCRYPT_WORK_FACTOR));
    req.body.password = hash;

    // Since the req.body comes in the form of json, this creates a user based on the User model
    // req.body does come with additional information (in this case _csrf), but since that's not
    // part of the User model, it is automatically ignored
    let user = new User(req.body);
    
    user.save((err) => {
        if (err) {
            let error = "Something bad happened! Please try again.";
            
            if (err.code === 11000) {
                error = 'That email is already taken, please try another.'
            }
            console.log(error);
            
            return res.render('register', { error: error });
        }
        res.redirect('/dashboard');
    });
    
});

router.get('/', (req, res) => {
    res.render('register', { csrfToken: req.csrfToken() });
});

module.exports = router;