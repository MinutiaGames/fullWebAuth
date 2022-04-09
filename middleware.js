const express = require('express');
const helmet = require('helmet');
const sessions = require('client-sessions');
const csurf = require('csurf');
const User = require('./models/user');
const expressLayouts = require('express-ejs-layouts');

function init(app) {

    app.use(express.urlencoded({ extended: false }));

    app.use(expressLayouts);
    
    app.use(express.static('public'));

    // Setting this to true produces an error in Firefox
    app.use(helmet({ contentSecurityPolicy: false }));

    app.use(sessions({
        cookieName: 'session',
        secret: process.env.COOKIE_SECRET,
        duration: 30 * 60 * 1000, // 30 minutes
        cookie: {
            sameSite: true,
            httpOnly: true,
            secureProxy: process.env.NODE_ENV // When not in production, cookies do not require SSL
        }
    }));

    // Must be placed after app.use(sessions) since by default it uses the session variable
    app.use(csurf());

    // Check if the user has a session, if so, set session variables
    app.use((req, res, next) => {
        if (!(req.session && req.session.userId)) { return next() }
        
        User.findById(req.session.userId, (err, user) => {
            if (err) { return next(err) }
            
            if (!user) { return next() }
            
            // This clears any hashed password which might be exposed
            user.password = undefined;
            
            req.user = user;
            res.locals.user = user;
            
            next();
        });
    });

    // Unless the user is trying to go to the dashboard, if the user has a session (which would only be true if req.user is valid)
    // this automatically redirects them to the dashboard
    app.use((req, res, next) => {
        if (req.path !== '/dashboard' && req.path !== '/passwordReset' && req.user) {
            return res.redirect('/dashboard');
        }

        next();
    });

    // Display message on result of bad CSRF token
    app.use((err, req, res, next) => {
        if (err.code !== "EBADCSRFTOKEN") return next(err);
        
        res.status(403);
        res.send("CSRF Attack detected. If you believe this to be an error, please contact the site admin.");
    });

}

function loginRequired(req, res, next) {
    if (!req.user) {
        return res.redirect('/login');
    }
    
    next();
}

module.exports = init;
module.exports.loginRequired = loginRequired;