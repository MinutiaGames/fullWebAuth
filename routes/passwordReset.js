const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const nodemailer = require('nodemailer');

router.get('/', (req, res) => {
    if (req.query.token) {
        // jwt.verify automatically sees if a token is expired or not
        jwt.verify(req.query.token, process.env.JWT_SECRET, (err, data) => {
            if (err) return res.sendStatus(403);

            req.uuid = data.resetHash;
            req.newPass = true;
        });
    }

    res.render('passwordReset', {
        title: 'Password Reset',
        csrfToken: req.csrfToken(),
        uuid: req.uuid,
        newPass: req.newPass
    });

    // The email will contain a link which is basically website.com/passwordReset?Token=RandomStringOfCrap
    // This random string of crap will be a json token which, when sent to the page in this way, will change the
    // page so when it posts, it instead sets the user's password to the one typed in. If they don't have the token
    // and the token they provided doesn't match one in the db
});

router.post('/', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {

        if (err || !user) {
            return res.render('passwordReset', {
                error: 'No user with specified email found',
                title: 'Password Reset',
                csrfToken: req.csrfToken()
            });
        }

        if (req.body.uuid) {
            if (user.resetHash === req.body.uuid) {
                const hash = bcrypt.hashSync(req.body.password, parseInt(process.env.BCRYPT_WORK_FACTOR));
                User.updateOne({ email: req.body.email }, { password: hash }, err => {
                    if (err) console.log(err);
                });
                return res.redirect('/dashboard');
            }
        }

        // Generate a UUID, add that 
        const resetHash = randomUUID();

        User.updateOne({ email:req.body.email }, { resetHash: resetHash }, err => {
            if (err) console.log(err);
        });


        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NM_EMAIL,
                pass: process.env.NM_PASS
            }
        });

        let mailOptions = {
            from: process.env.NM_EMAIL,
            to: req.body.email,
            subject: 'Password Reset',
            html: `Click <a href="https://pretendcoding-webauth.herokuapp.com/passwordReset?token=${generateResetToken({ resetHash: resetHash })}">here</a> to reset your password.`,
            text: `If the link does not show, copy and paste the following address into the address bar https://pretendcoding-webauth.herokuapp.com/passwordReset?token=${generateResetToken({ resetHash: resetHash })}`
        }

        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                return console.log(err);
            }
            else {
                console.log('Email sent');
                return res.redirect('/');
            }
        });




        // else, email the user a token which they use to reset their password
        // for now, we are pasting a string literal on the page for testing
        // return res.render('passwordReset', {
        //     title: 'Password Reset',
        //     csrfToken: req.csrfToken(),
        //     tokenLiteral: generateResetToken({ resetHash: resetHash })
        // });

    });
});

function generateResetToken(resetHash) {
    return jwt.sign(resetHash, process.env.JWT_SECRET, { expiresIn: '1000s' });
}

module.exports = router;