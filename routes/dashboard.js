const express = require('express');
const router = express.Router();
const { loginRequired } = require('../middleware');
const User = require('../models/user');

router.get('/', loginRequired, (req, res, next) => {
    // the .session after request is the cookie with the key "session" which stores the userId which we set in the login post
    if (!(req.session && req.session.userId)) {
        return res.redirect('/login');
    }

    User.findById(req.session.userId, (err, user) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.redirect('/login');
        }

        res.render('dashboard', { title: 'Dashboard' });
    });
});

module.exports = router;