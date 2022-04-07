const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

router.get('/', (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
});

router.post('/', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err || !user || !bcrypt.compareSync(req.body.password, user.password)) {
            return res.render('login', { error: 'Incorrect email / password' });
        }
        
        // this puts the unique id from mongo in the session cookie handled by client-sessions
        req.session.userId = user._id;
        res.redirect('/dashboard');
    });
});

module.exports = router;